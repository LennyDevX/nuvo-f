/**
 * Transmite texto al cliente con control de backpressure mejorado
 */
export async function streamText(res, text, options = {}) {
  const {
    chunkSize = 10,
    delayMs = 5,
    contentType = 'text/plain; charset=utf-8',
    enableBackpressure = true
  } = options;
  
  // Configurar headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Función para escribir con backpressure
  const writeChunk = (chunk) => {
    return new Promise((resolve, reject) => {
      const canContinue = res.write(chunk);
      
      if (canContinue) {
        resolve();
      } else if (enableBackpressure) {
        res.once('drain', resolve);
        res.once('error', reject);
        res.once('close', reject);
      } else {
        resolve();
      }
    });
  };
  
  try {
    // Transmitir el texto en fragmentos con control de flujo
    for (let i = 0; i < text.length; i += chunkSize) {
      // Verificar si el cliente sigue conectado
      if (res.destroyed || res.writableEnded) {
        break;
      }
      
      const chunk = text.slice(i, i + chunkSize);
      await writeChunk(chunk);
      
      // Pausa controlada
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    
    res.end();
  } catch (error) {
    console.error('Error durante streaming:', error);
    if (!res.destroyed) {
      res.destroy();
    }
  }
}

/**
 * Stream JSON progresivo para respuestas estructuradas
 */
export async function streamJSON(res, data, options = {}) {
  const jsonString = JSON.stringify(data, null, 2);
  return streamText(res, jsonString, {
    ...options,
    contentType: 'application/json; charset=utf-8'
  });
}

/**
 * Streaming adaptativo inteligente basado en contenido y conexión
 */
export async function streamTextAdaptive(res, text, options = {}) {
  const {
    contentType = 'text/plain; charset=utf-8',
    enableBackpressure = true,
    adaptToContent = true,
    clientInfo = {}
  } = options;
  
  // Detectar características del contenido
  const contentAnalysis = {
    isCode: /```|function|class|import|export/.test(text),
    isLongForm: text.length > 1000,
    hasLists: /^\s*[-*+]\s/m.test(text) || /^\s*\d+\.\s/m.test(text),
    hasTables: /\|.*\|/.test(text),
    complexity: text.split(/[.!?]+/).length > 10 ? 'high' : 'medium'
  };
  
  // Adaptación inteligente de parámetros
  let adaptiveConfig = {
    chunkSize: 15,
    delayMs: 8
  };
  
  if (adaptToContent) {
    if (contentAnalysis.isCode) {
      // Código necesita chunks más pequeños para mejor legibilidad
      adaptiveConfig = { chunkSize: 8, delayMs: 12 };
    } else if (contentAnalysis.isLongForm) {
      // Textos largos pueden usar chunks más grandes
      adaptiveConfig = { chunkSize: 25, delayMs: 6 };
    } else if (contentAnalysis.hasLists || contentAnalysis.hasTables) {
      // Listas y tablas necesitan timing específico
      adaptiveConfig = { chunkSize: 12, delayMs: 10 };
    } else if (contentAnalysis.complexity === 'high') {
      // Contenido complejo necesita pausas para digestión
      adaptiveConfig = { chunkSize: 10, delayMs: 15 };
    }
  }
  
  // Detectar velocidad de conexión del cliente (si está disponible)
  const userAgent = clientInfo.userAgent || '';
  const isMobile = /Mobile|Android|iPhone/.test(userAgent);
  const isSlowConnection = clientInfo.connectionType === 'slow' || isMobile;
  
  if (isSlowConnection) {
    adaptiveConfig.chunkSize *= 0.7;
    adaptiveConfig.delayMs *= 1.3;
  }
  
  // Configurar headers optimizados
  res.setHeader('Content-Type', contentType);
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Analysis', JSON.stringify(contentAnalysis));
  
  return streamText(res, text, {
    ...adaptiveConfig,
    enableBackpressure,
    contentType
  });
}

/**
 * Streaming con pausas inteligentes para mejor UX
 */
export async function streamTextWithSmartPauses(res, text, options = {}) {
  const { pauseAtSentences = true, pauseAtParagraphs = true } = options;
  
  let processedText = '';
  let lastPauseIndex = 0;
  
  for (let i = 0; i < text.length; i++) {
    processedText += text[i];
    
    // Pausas inteligentes en puntos naturales
    if (pauseAtSentences && /[.!?]/.test(text[i]) && i > lastPauseIndex + 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      lastPauseIndex = i;
    }
    
    if (pauseAtParagraphs && text[i] === '\n' && text[i + 1] === '\n') {
      await new Promise(resolve => setTimeout(resolve, 200));
      lastPauseIndex = i;
    }
  }
  
  return streamTextAdaptive(res, processedText, options);
}
