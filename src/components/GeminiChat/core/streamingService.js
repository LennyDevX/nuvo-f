import { enhancedCache } from './cacheManager';

export class StreamingService {
  constructor() {
    this.activeStreams = new Set();
    this.webWorker = null;
    this.workerSessionId = 0;
    this.pendingWorkerCallbacks = new Map();
    this.initializeWebWorker();
  }

  initializeWebWorker() {
    try {
      // Try to create worker from separate file first
      this.webWorker = new Worker(
        new URL('./streamingWebWorker.js', import.meta.url),
        { type: 'module' }
      );
      
      this.webWorker.onmessage = this.handleWorkerMessage.bind(this);
      this.webWorker.onerror = this.handleWorkerError.bind(this);
      
      console.log('Web Worker initialized successfully');
      
    } catch (error) {
      console.warn('Failed to initialize Web Worker from file, trying fallback:', error);
      this.tryFallbackWorker();
    }
  }

  tryFallbackWorker() {
    try {
      // Fallback: Create worker from blob with proper CSP handling
      const workerScript = this.getWorkerScript();
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.webWorker = new Worker(URL.createObjectURL(blob));
      
      this.webWorker.onmessage = this.handleWorkerMessage.bind(this);
      this.webWorker.onerror = this.handleWorkerError.bind(this);
      
      console.log('Fallback Web Worker initialized successfully');
      
    } catch (error) {
      console.warn('Web Worker not available, using main thread processing:', error);
      this.webWorker = null;
    }
  }

  getWorkerScript() {
    return `
      self.onmessage = function(e) {
        const { type, data, id } = e.data;
        
        switch (type) {
          case 'PROCESS_STREAM':
            processStreamChunk(data, id);
            break;
          case 'DECODE_TEXT':
            decodeTextChunk(data, id);
            break;
          case 'CLEANUP':
            cleanup(id);
            break;
        }
      };

      function processStreamChunk(data, id) {
        try {
          const { chunk, accumulated, isLowPerformance, chunkIndex } = data;
          
          const decoder = new TextDecoder('utf-8', { stream: true });
          const decodedChunk = decoder.decode(chunk, { stream: true });
          
          const newAccumulated = accumulated + decodedChunk;
          const lines = newAccumulated.split('\\n');
          const remainingChunk = lines.pop() || '';
          
          let fullResponse = '';
          for (const line of lines) {
            if (line.trim()) {
              fullResponse += line + '\\n';
            }
          }
          
          const shouldUpdate = !isLowPerformance || 
                              decodedChunk.includes('.') || 
                              decodedChunk.includes('\\n') ||
                              fullResponse.length % 100 === 0;
          
          self.postMessage({
            type: 'CHUNK_PROCESSED',
            id,
            data: {
              fullResponse,
              remainingChunk,
              shouldUpdate,
              chunkSize: decodedChunk.length,
              chunkIndex
            }
          });
        } catch (error) {
          self.postMessage({
            type: 'PROCESSING_ERROR',
            id,
            error: { message: error.message, name: error.name }
          });
        }
      }

      function cleanup(id) {
        self.postMessage({ type: 'CLEANUP_COMPLETE', id });
      }
    `;
  }

  handleWorkerMessage(e) {
    const { type, data, error, id } = e.data;
    const callback = this.pendingWorkerCallbacks.get(id);
    
    if (!callback) return;
    
    switch (type) {
      case 'CHUNK_PROCESSED':
        callback.resolve(data);
        this.pendingWorkerCallbacks.delete(id);
        break;
        
      case 'PROCESSING_ERROR':
      case 'WORKER_ERROR':
        console.error('Worker processing error:', error);
        callback.reject(new Error(error.message || 'Worker processing failed'));
        this.pendingWorkerCallbacks.delete(id);
        break;
        
      case 'CLEANUP_COMPLETE':
        callback.resolve();
        this.pendingWorkerCallbacks.delete(id);
        break;
    }
  }

  handleWorkerError(error) {
    console.error('Web Worker error:', error);
    // Cleanup pending callbacks
    for (const [id, callback] of this.pendingWorkerCallbacks) {
      callback.reject(new Error('Worker error: ' + error.message));
    }
    this.pendingWorkerCallbacks.clear();
    
    // Fallback to main thread
    this.webWorker = null;
  }

  async processStream({ response, dispatch, isLowPerformance, shouldReduceMotion, onUpdate, onFinish, onError }) {
    const reader = response.body.getReader();
    let fullResponse = '';
    let accumulatedChunk = '';
    let frameId = null;
    let lastUpdate = Date.now();
    let chunkIndex = 0;
    
    // Enhanced performance configuration
    const getUpdateThrottle = () => {
      const baseFPS = shouldReduceMotion ? 15 : 30;
      const frameBudget = 1000 / baseFPS;
      
      if (isLowPerformance) {
        return Math.max(200, frameBudget * 4);
      }
      
      return Math.max(50, frameBudget);
    };
    
    // Smart buffer updates with Web Worker support
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
        
        chunkIndex++;
        
        // Use Web Worker if available, otherwise process in main thread
        if (this.webWorker) {
          try {
            const result = await this.processChunkWithWorker(
              value, 
              accumulatedChunk, 
              isLowPerformance, 
              chunkIndex
            );
            
            accumulatedChunk = result.remainingChunk;
            fullResponse += result.fullResponse;
            
            if (result.shouldUpdate) {
              smartUpdate(fullResponse + accumulatedChunk);
              lastUpdate = Date.now();
            }
          } catch (workerError) {
            console.warn('Worker processing failed, falling back to main thread:', workerError);
            this.webWorker = null;
            // Continue with main thread processing
            const result = await this.processChunkMainThread(value, accumulatedChunk, isLowPerformance);
            accumulatedChunk = result.remainingChunk;
            fullResponse += result.processedContent;
            
            const now = Date.now();
            const throttleDelay = getUpdateThrottle();
            
            if (result.shouldUpdate || now - lastUpdate >= throttleDelay) {
              smartUpdate(fullResponse + accumulatedChunk);
              lastUpdate = now;
            }
          }
        } else {
          const result = await this.processChunkMainThread(value, accumulatedChunk, isLowPerformance);
          accumulatedChunk = result.remainingChunk;
          fullResponse += result.processedContent;
          
          const now = Date.now();
          const throttleDelay = getUpdateThrottle();
          
          if (result.shouldUpdate || now - lastUpdate >= throttleDelay) {
            smartUpdate(fullResponse + accumulatedChunk);
            lastUpdate = now;
          }
        }
      }
      
      // Process remaining content
      if (accumulatedChunk.trim()) {
        fullResponse += accumulatedChunk;
      }
      
      // Final update and cache the result
      if (frameId) cancelAnimationFrame(frameId);
      onUpdate(fullResponse);
      onFinish(fullResponse);
      
      // Cache successful response with TTL
      if (fullResponse && fullResponse.length > 10 && fullResponse.length < 15000) {
        const cacheKey = `response_${Date.now()}`;
        enhancedCache.set(cacheKey, fullResponse, 1800000); // 30 minutes TTL
      }
      
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

  async processChunkWithWorker(chunk, accumulated, isLowPerformance, chunkIndex) {
    return new Promise((resolve, reject) => {
      const sessionId = ++this.workerSessionId;
      
      this.pendingWorkerCallbacks.set(sessionId, { resolve, reject });
      
      // Set timeout for worker response
      setTimeout(() => {
        if (this.pendingWorkerCallbacks.has(sessionId)) {
          this.pendingWorkerCallbacks.delete(sessionId);
          reject(new Error('Worker processing timeout'));
        }
      }, 5000);
      
      this.webWorker.postMessage({
        type: 'PROCESS_STREAM',
        id: sessionId,
        data: { 
          chunk: chunk, 
          accumulated, 
          isLowPerformance,
          chunkIndex
        }
      });
    });
  }

  async processChunkMainThread(value, accumulatedChunk, isLowPerformance) {
    const decoder = new TextDecoder('utf-8', { stream: true });
    const chunk = decoder.decode(value, { stream: true });
    accumulatedChunk += chunk;
    
    const lines = accumulatedChunk.split('\n');
    accumulatedChunk = lines.pop() || '';
    
    let processedContent = '';
    for (const line of lines) {
      if (line.trim()) {
        processedContent += line + '\n';
      }
    }
    
    const shouldUpdate = !isLowPerformance || 
                        chunk.includes('.') || 
                        chunk.includes('\n') ||
                        processedContent.length % 150 === 0;
    
    return {
      processedContent,
      remainingChunk: accumulatedChunk,
      shouldUpdate
    };
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

  destroy() {
    this.cancelAllStreams();
    
    // Cleanup pending worker callbacks
    for (const [id, callback] of this.pendingWorkerCallbacks) {
      callback.reject(new Error('Service destroyed'));
    }
    this.pendingWorkerCallbacks.clear();
    
    if (this.webWorker) {
      // Send cleanup message to worker
      if (this.webWorker) {
        try {
          this.webWorker.postMessage({ type: 'CLEANUP', id: 'destroy' });
        } catch (e) {
          // Worker might be terminated already
        }
      }
      
      // Terminate worker
      setTimeout(() => {
        if (this.webWorker) {
          this.webWorker.terminate();
          this.webWorker = null;
        }
      }, 100);
    }
  }
}
