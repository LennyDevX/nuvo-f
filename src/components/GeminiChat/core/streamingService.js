export class StreamingService {
  constructor() {
    this.activeStreams = new Set();
  }

  async processStream({ response, dispatch, isLowPerformance, shouldReduceMotion, onUpdate, onFinish, onError }) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { stream: true });
    
    let fullResponse = '';
    let accumulatedChunk = '';
    let frameId = null;
    let lastUpdate = Date.now();
    
    // Adaptive configuration based on performance
    const getUpdateThrottle = () => {
      const frameBudget = 16.67; // 60fps
      
      if (isLowPerformance) {
        return Math.max(100, frameBudget * 3);
      }
      
      return Math.max(32, frameBudget);
    };
    
    // Smart buffer updates
    const smartUpdate = (content) => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      
      frameId = requestAnimationFrame(() => {
        onUpdate(content);
      });
    };
    
    // Initialize streaming
    dispatch({ type: 'START_STREAMING' });
    this.activeStreams.add(reader);
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;
        
        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        accumulatedChunk += chunk;
        
        // Process complete lines
        const lines = accumulatedChunk.split('\n');
        accumulatedChunk = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            fullResponse += line + '\n';
          }
        }
        
        // Intelligent update throttling
        const now = Date.now();
        const throttleDelay = getUpdateThrottle();
        
        if (now - lastUpdate >= throttleDelay || 
            chunk.includes('.') || 
            chunk.includes('\n') ||
            fullResponse.length % 100 === 0) {
          
          smartUpdate(fullResponse + accumulatedChunk);
          lastUpdate = now;
        }
      }
      
      // Process remaining content
      if (accumulatedChunk.trim()) {
        fullResponse += accumulatedChunk;
      }
      
      // Final update and finish with proper content passing
      if (frameId) cancelAnimationFrame(frameId);
      onUpdate(fullResponse);
      onFinish(fullResponse); // Pass the final content to onFinish callback
      
    } catch (error) {
      if (frameId) cancelAnimationFrame(frameId);
      
      if (error.name === 'AbortError') {
        console.log('Stream cancelled by user');
        return;
      }
      
      onError(error);
    } finally {
      this.activeStreams.delete(reader);
      try {
        reader.releaseLock();
      } catch (e) {
        // Reader already released
      }
    }
  }

  cancelAllStreams() {
    this.activeStreams.forEach(reader => {
      try {
        reader.cancel();
      } catch (e) {
        console.warn('Error cancelling stream:', e);
      }
    });
    this.activeStreams.clear();
  }

  getActiveStreamCount() {
    return this.activeStreams.size;
  }
}
