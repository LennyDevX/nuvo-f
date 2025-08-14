// Web Worker for processing streaming responses
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
    default:
      self.postMessage({
        type: 'ERROR',
        id,
        error: `Unknown message type: ${type}`
      });
  }
};

function processStreamChunk(data, id) {
  try {
    const { chunk, accumulated, isLowPerformance, chunkIndex } = data;
    
    // Convert Uint8Array back to ArrayBuffer if needed
    const buffer = chunk instanceof Uint8Array ? chunk.buffer : chunk;
    
    const decoder = new TextDecoder('utf-8', { stream: true });
    const decodedChunk = decoder.decode(buffer, { stream: true });
    
    const newAccumulated = accumulated + decodedChunk;
    const lines = newAccumulated.split('\n');
    const remainingChunk = lines.pop() || '';
    
    let fullResponse = '';
    for (const line of lines) {
      if (line.trim()) {
        fullResponse += line + '\n';
      }
    }
    
    // Intelligent throttling based on performance and content
    const shouldUpdate = !isLowPerformance || 
                        decodedChunk.includes('.') || 
                        decodedChunk.includes('!') ||
                        decodedChunk.includes('?') ||
                        decodedChunk.includes('\n') ||
                        fullResponse.length % 100 === 0 ||
                        chunkIndex % 5 === 0; // Every 5th chunk
    
    // Calculate processing metrics
    const metrics = {
      chunkSize: decodedChunk.length,
      totalSize: fullResponse.length + remainingChunk.length,
      linesProcessed: lines.length - 1,
      hasContent: fullResponse.length > 0
    };
    
    self.postMessage({
      type: 'CHUNK_PROCESSED',
      id,
      data: {
        fullResponse,
        remainingChunk,
        shouldUpdate,
        metrics,
        chunkIndex
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'PROCESSING_ERROR',
      id,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    });
  }
}

function decodeTextChunk(data, id) {
  try {
    const { buffer, encoding = 'utf-8' } = data;
    const decoder = new TextDecoder(encoding);
    const text = decoder.decode(buffer);
    
    self.postMessage({
      type: 'TEXT_DECODED',
      id,
      data: { text, size: text.length }
    });
  } catch (error) {
    self.postMessage({
      type: 'DECODE_ERROR',
      id,
      error: {
        message: error.message,
        name: error.name
      }
    });
  }
}

function cleanup(id) {
  // Cleanup any ongoing operations for this session
  self.postMessage({
    type: 'CLEANUP_COMPLETE',
    id
  });
}

// Handle worker errors
self.onerror = function(error) {
  self.postMessage({
    type: 'WORKER_ERROR',
    error: {
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno
    }
  });
};

// Handle unhandled promise rejections
self.onunhandledrejection = function(event) {
  self.postMessage({
    type: 'WORKER_UNHANDLED_REJECTION',
    error: {
      message: event.reason?.message || 'Unhandled promise rejection',
      reason: event.reason
    }
  });
};
