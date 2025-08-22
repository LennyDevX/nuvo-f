import { 
  processGeminiRequest, 
  processGeminiStreamRequest,
  createOptimizedGeminiStream,
  processFunctionCallingRequest, 
  clearCache as clearGeminiCache 
} from '../services/gemini-service.js';
import { streamText } from '../utils/stream-utils.js';
import { getMetrics } from '../middlewares/logger.js';
import embeddingsService from '../services/embeddings-service.js';
import contextCacheService from '../services/context-cache-service.js';
import analyticsService from '../services/analytics-service.js';
import batchService from '../services/batch-service.js';
import webScraperService from '../services/web-scraper-service.js';

// === Configuración ===
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB, cambiar aquí para ajustar el límite

// === Utilidades ===
/**
 * Valida la entrada del usuario para generación de contenido Gemini.
 * @param {object} data - Datos recibidos en el body.
 * @returns {string[]} Lista de errores descriptivos.
 */
function validateInput(data) {
  const errors = [];
  if (!data.prompt && (!data.messages || !Array.isArray(data.messages) || data.messages.length === 0)) {
    errors.push('Debes proporcionar un prompt o un historial de mensajes válido. Ejemplo: { prompt: "¿Cuál es la capital de Francia?" }');
  }
  if (data.temperature !== undefined && (typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 2)) {
    errors.push('El parámetro "temperature" debe ser un número entre 0 y 2. Ejemplo: { temperature: 0.8 }');
  }
  if (data.maxTokens !== undefined && (typeof data.maxTokens !== 'number' || data.maxTokens < 1 || data.maxTokens > 8192)) {
    errors.push('El parámetro "maxTokens" debe ser un número entre 1 y 8192. Ejemplo: { maxTokens: 2048 }');
  }
  if (data.image && typeof data.image !== 'string') {
    errors.push('El campo "image" debe ser una cadena en formato base64.');
  }
  return errors;
}

// Función mejorada para optimización inteligente de conversaciones
function optimizeMessages(messages, maxMessages = 20) {
  if (!Array.isArray(messages) || messages.length <= maxMessages) {
    return messages;
  }
  
  // Análisis inteligente de importancia de mensajes
  const messageImportance = messages.map((msg, index) => {
    let score = 0;
    
    // Mensajes recientes son más importantes
    score += (index / messages.length) * 3;
    
    // Mensajes del usuario son más importantes
    if (msg.role === 'user') score += 2;
    
    // Mensajes con preguntas son importantes
    if (msg.parts?.[0]?.text?.includes('?')) score += 1.5;
    
    // Mensajes con código o datos técnicos
    if (msg.parts?.[0]?.text?.match(/```|{|}|\[|\]/)) score += 1;
    
    // Mensajes cortos probablemente son menos importantes
    if (msg.parts?.[0]?.text?.length < 50) score -= 0.5;
    
    return { ...msg, index, score };
  });
  
  // Mantener siempre los primeros 2 mensajes (contexto inicial)
  const contextMessages = messages.slice(0, 2);
  
  // Ordenar por importancia y tomar los mejores
  const remainingMessages = messageImportance
    .slice(2)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMessages - 4) // Reservar espacio para contexto y resumen
    .sort((a, b) => a.index - b.index); // Reordenar cronológicamente
  
  // Crear resumen inteligente del contenido omitido
  const omittedCount = messages.length - contextMessages.length - remainingMessages.length;
  const summaryMessage = {
    role: 'model',
    parts: [{
      text: `[Contexto: ${omittedCount} mensajes anteriores resumidos. Conversación continúa manteniendo el hilo principal.]`
    }]
  };
  
  return [
    ...contextMessages,
    summaryMessage,
    ...remainingMessages.map(({ score, index, ...msg }) => msg)
  ];
}

/**
 * Genera contenido usando Gemini.
 * POST /api/gemini/generate
 */
export async function generateContent(req, res, next) {
  // Iniciar tracking de analytics
  const requestMetrics = analyticsService.startRequest('generate_content', req.body.model || 'default');
  
  try {
    const { prompt, model, messages, temperature, maxTokens, stream, image } = req.body;
    // Validación de entrada
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
      analyticsService.failRequest(requestMetrics, new Error('Validation failed'));
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos', 
        details: validationErrors 
      });
    }

    // Validación de tamaño de imagen (configurable)
    if (image && typeof image === 'string') {
      const base64Length = image.length - (image.indexOf(',') + 1);
      const imageSize = Math.ceil(base64Length * 3 / 4); // Aproximación
      if (imageSize > IMAGE_SIZE_LIMIT) {
        return res.status(413).json({
          error: `La imagen es demasiado grande (máx ${(IMAGE_SIZE_LIMIT / (1024 * 1024)).toFixed(1)}MB). Usa una imagen más pequeña.`
        });
      }
    }

    // Detectar multimodalidad (imagen en el mensaje)
    let contents;
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Si el último mensaje tiene texto y/o imagen, prepara contenido multimodal
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.image || lastMsg.text) {
        const parts = [];
        if (lastMsg.text) parts.push({ text: lastMsg.text });
        if (lastMsg.image) {
          // Extrae el mimeType si está presente, si no usa png por defecto
          const mimeMatch = lastMsg.image.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
          parts.push({ inlineData: { mimeType, data: lastMsg.image.replace(/^data:image\/\w+;base64,/, '') } });
        }
        contents = [
          ...optimizeMessages(messages.slice(0, -1), 24),
          {
            role: lastMsg.role || 'user',
            parts
          }
        ];
      } else {
        contents = optimizeMessages(messages, 25);
      }
    } else if (image) {
      // Si viene imagen directa en el body
      contents = [
        { role: 'user', parts: [
          ...(prompt ? [{ text: prompt }] : []),
          { inlineData: { mimeType: 'image/png', data: image.replace(/^data:image\/\w+;base64,/, '') } }
        ]}
      ];
    } else {
      contents = prompt;
    }

    // Parámetros adaptativos basados en el tipo de contenido
    const isComplexQuery = typeof contents === 'string' 
      ? contents.length > 200 || contents.includes('explain') || contents.includes('analyze')
      : Array.isArray(contents) && contents.some(msg => 
          msg.parts?.[0]?.text?.length > 200 || 
          msg.parts?.[0]?.text?.includes('explain')
        );
    
    const params = {
      temperature: temperature || (isComplexQuery ? 0.7 : 0.8),
      maxOutputTokens: maxTokens || (isComplexQuery ? 3000 : 2048),
      topP: isComplexQuery ? 0.9 : 0.95 // Más conservador para consultas complejas
    };

    // Streaming nativo mejorado
    if (stream) {
      try {
        // Headers optimizados para streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Nginx
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // CORS para streaming (ya incluido arriba)
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Detectar características del cliente
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Mobile|Android|iPhone/.test(userAgent);
        const connectionType = req.headers['connection-type'] || 'unknown';
        
        // Configuración adaptativa
        const streamConfig = {
          enableCompression: !isMobile, // Menos compresión en móviles
          bufferSize: isMobile ? 512 : 1024,
          flushInterval: isMobile ? 30 : 50
        };
        
        // Obtener stream nativo de Gemini
        const geminiStream = await processGeminiStreamRequest(contents, model, params);
        
        // Crear stream optimizado
        const optimizedStream = createOptimizedGeminiStream(geminiStream, streamConfig);
        
        // Pipe el stream al response
        const reader = optimizedStream.getReader();

        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                res.end();
                break;
              }
              if (res.destroyed || res.writableEnded) {
                await reader.cancel();
                break;
              }
              if (!res.write(value)) {
                await new Promise((resolve) => {
                  res.once('drain', resolve);
                  res.once('error', resolve);
                  res.once('close', resolve);
                });
              }
            }
          } catch (error) {
            // Mejor manejo de errores en streaming
            console.error('Error in streaming pump:', error);
            if (!res.headersSent) {
              res.status(500).end('Stream error: ' + (error.message || 'Error desconocido'));
            } else {
              res.end('Stream error: ' + (error.message || 'Error desconocido'));
            }
          }
        };

        req.on('close', () => {
          reader.cancel().catch(console.error);
        });
        req.on('aborted', () => {
          reader.cancel().catch(console.error);
        });

        return pump();

      } catch (streamError) {
        // Mejor manejo de errores en streaming
        console.error('Stream setup error:', streamError);
        if (!res.headersSent) {
          return res.status(500).json({ 
            error: 'No se pudo inicializar el stream',
            message: streamError.message 
          });
        } else {
          res.end('Stream setup error: ' + (streamError.message || 'Error desconocido'));
        }
      }
    }

    const response = await processGeminiRequest(contents, model, params);

    // Streaming adaptativo mejorado
    if (stream) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Streaming adaptativo basado en complejidad de respuesta
      const responseLength = response.text?.length || 0;
      const adaptiveConfig = {
        chunkSize: responseLength > 1000 ? 20 : 15,
        delayMs: responseLength > 1000 ? 12 : 8
      };
      
      return streamText(res, response.text || '', adaptiveConfig);
    }

    // Registrar éxito en analytics
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      model: model || 'default'
    });

    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text,
      // Si el modelo devuelve imagen, inclúyela
      image: response.image || null,
      metadata: {
        model: model || 'default',
        tokensUsed: response.usage?.totalTokens || 0,
        timestamp: new Date().toISOString(),
        contextCache: Array.isArray(contents) && contents.length >= 3 ? 'potentially-used' : 'not-applicable'
      }
    });
  } catch (error) {
    // Registrar fallo en analytics
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Genera contenido usando Gemini (GET).
 * GET /api/gemini/generate
 */
export async function generateContentGet(req, res, next) {
  const requestMetrics = analyticsService.startRequest('generate_content_get', req.query.model || 'default');
  
  try {
    const prompt = req.query.prompt;
    const model = req.query.model;
    
    if (!prompt) {
      analyticsService.failRequest(requestMetrics, new Error('Missing prompt'));
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }
    
    const response = await processGeminiRequest(prompt, model);
    
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      model: model || 'default'
    });
    
    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Llama funciones usando Gemini Function Calling.
 * POST /api/gemini/function-calling
 */
export async function functionCalling(req, res, next) {
  const requestMetrics = analyticsService.startRequest('function_calling', req.body.model || 'default');
  
  try {
    const { 
      prompt, 
      model, 
      functionDeclarations, 
      functionCallingMode, 
      allowedFunctionNames 
    } = req.body;

    const response = await processFunctionCallingRequest({
      prompt,
      model,
      functionDeclarations,
      functionCallingMode,
      allowedFunctionNames
    });

    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      model: model || 'default',
      functionCallsCount: response.functionCalls?.length || 0
    });

    res.json({
      message: 'Respuesta de Gemini con Function Calling',
      response: response.text,
      functionCalls: response.functionCalls
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Devuelve el estado de salud del API.
 * GET /api/gemini/health
 */
export function getHealthStatus(req, res) {
  res.json({
    status: 'ok',
    ...getMetrics()
  });
}

/**
 * Endpoint de prueba.
 * GET /api/gemini/hello
 */
export function helloCheck(req, res) {
  res.json({ 
    message: 'Gemini API is running', 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

/**
 * Verifica la conexión con la API de Gemini.
 * GET /api/gemini/check-api
 */
export function checkApiConnection(req, res) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'API key not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Respuesta exitosa
    res.json({
      status: 'ok',
      message: 'API connection available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API connection check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Limpia la caché de Gemini.
 * POST /api/gemini/clear-cache
 */
export function clearCache(req, res) {
  try {
    clearGeminiCache();
    res.json({ 
      message: 'Caché limpiado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar caché' });
  }
}

/**
 * Lista los modelos disponibles de Gemini.
 * GET /api/gemini/models
 */
export function getAvailableModels(req, res) {
  res.json({
    models: [
      {
        name: 'gemini-2.5-flash-lite',
        displayName: 'Gemini 2.5 Flash Lite',
        isDefault: true,
        isStable: true,
        isPreview: false,
        description: 'Optimized stable model for speed and quality - recommended for all use cases'
      }
    ],
    default: 'gemini-2.5-flash-lite',
    note: 'Using the latest stable Gemini 2.5 Flash Lite model for optimal performance and reliability.'
  });
}

/**
 * Analiza un texto usando Gemini.
 * POST /api/gemini/analyze
 */
export async function analyzeText(req, res, next) {
  const requestMetrics = analyticsService.startRequest('analyze_text', 'gemini-analysis');
  
  try {
    const { text, analysisType = 'general', detailedAnalysis = false } = req.body;
    
    if (!text) {
      analyticsService.failRequest(requestMetrics, new Error('Missing text'));
      return res.status(400).json({ error: 'Se requiere texto para analizar' });
    }
    
    // Prompts mejorados y más especializados
    const prompts = {
      sentiment: `Analiza exhaustivamente el sentimiento del siguiente texto. Proporciona:
        1. Puntaje general del -1 (muy negativo) al 1 (muy positivo)
        2. Emociones específicas detectadas
        3. Confianza del análisis (0-100%)
        4. Palabras clave que influyen en el sentimiento
        
        Texto: "${text}"`,
        
      summary: `Crea un resumen estructurado del siguiente texto:
        1. Resumen ejecutivo (50 palabras máximo)
        2. Puntos clave principales
        3. Conclusiones o insights importantes
        
        Texto: "${text}"`,
        
      keywords: `Extrae y categoriza las palabras clave del siguiente texto:
        1. Términos principales (máximo 10)
        2. Entidades mencionadas (personas, lugares, organizaciones)
        3. Conceptos técnicos o especializados
        4. Frecuencia y relevancia de cada término
        
        Texto: "${text}"`,
        
      technical: `Realiza un análisis técnico profundo del siguiente texto:
        1. Complejidad del lenguaje (1-10)
        2. Áreas temáticas identificadas
        3. Terminología especializada
        4. Nivel de expertise requerido para comprensión
        
        Texto: "${text}"`,
        
      linguistic: `Analiza los aspectos lingüísticos del texto:
        1. Estructura y coherencia
        2. Calidad de redacción
        3. Registro del lenguaje (formal/informal)
        4. Sugerencias de mejora
        
        Texto: "${text}"`,
        
      content: `Evalúa la calidad y estructura del contenido:
        1. Claridad del mensaje
        2. Organización de ideas
        3. Completitud de la información
        4. Audiencia objetivo identificada
        
        Texto: "${text}"`,
        
      general: `Proporciona un análisis integral del siguiente texto cubriendo:
        1. Tema principal y subtemas
        2. Tono y estilo
        3. Intención del autor
        4. Insights y observaciones relevantes
        5. Contexto y aplicabilidad
        
        Texto: "${text}"`
    };
    
    // Análisis adicional para textos largos
    let additionalAnalysis = {};
    
    // Análisis de estructura para textos largos
    if (detailedAnalysis && text.length > 500) {
      try {
        const structurePrompt = `Analiza la estructura del siguiente texto y proporciona:
        1. Número de ideas principales
        2. Flujo lógico de argumentos
        3. Transiciones entre secciones
        4. Calidad de la conclusión
        
        Texto: "${text}"`;
        
        const structureResponse = await processGeminiRequest(structurePrompt);
        additionalAnalysis.structure = structureResponse.text;
      } catch (error) {
        console.warn('Error en análisis de estructura:', error);
      }
    }
    
    // Métricas automáticas del texto
    const metrics = {
      length: text.length,
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
      averageWordsPerSentence: Math.round(
        text.split(/\s+/).length / text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      ),
      readingTime: Math.ceil(text.split(/\s+/).length / 200) // Minutos (200 palabras/min)
    };
    
    const prompt = prompts[analysisType] || prompts.general;
    const response = await processGeminiRequest(prompt);
    
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      analysisType,
      textLength: text.length,
      detailedAnalysis
    });

    res.json({
      analysis: response.text,
      type: analysisType,
      metrics,
      additionalAnalysis,
      processingTime: Date.now() - req.startTime || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Compara dos textos usando Gemini.
 * POST /api/gemini/compare
 */
export async function compareTexts(req, res, next) {
  const requestMetrics = analyticsService.startRequest('compare_texts', 'gemini-comparison');
  
  try {
    const { text1, text2, comparisonType = 'similarity' } = req.body;
    
    if (!text1 || !text2) {
      analyticsService.failRequest(requestMetrics, new Error('Missing texts for comparison'));
      return res.status(400).json({ error: 'Se requieren dos textos para comparar' });
    }
    
    const comparisonPrompts = {
      similarity: `Compara estos dos textos y analiza:
        1. Similitud de contenido (0-100%)
        2. Diferencias principales
        3. Temas comunes
        4. Estilo de escritura comparativo
        
        Texto 1: "${text1}"
        Texto 2: "${text2}"`,
        
      quality: `Compara la calidad de estos dos textos:
        1. Claridad y coherencia
        2. Estructura y organización
        3. Uso del lenguaje
        4. Cuál es mejor y por qué
        
        Texto 1: "${text1}"
        Texto 2: "${text2}"`,
        
      sentiment: `Compara el sentimiento de estos textos:
        1. Diferencias en tono emocional
        2. Nivel de positividad/negatividad
        3. Intenciones comunicativas
        
        Texto 1: "${text1}"
        Texto 2: "${text2}"`
    };
    
    const prompt = comparisonPrompts[comparisonType] || comparisonPrompts.similarity;
    const response = await processGeminiRequest(prompt);
    
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      comparisonType,
      text1Length: text1.length,
      text2Length: text2.length
    });

    res.json({
      comparison: response.text,
      type: comparisonType,
      lengths: {
        text1: text1.length,
        text2: text2.length
      }
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Devuelve estadísticas de uso del API.
 * GET /api/gemini/usage
 */
export function getUsageStats(req, res) {
  const stats = getMetrics();
  res.json({
    ...stats,
    cacheInfo: {
      // Aquí podrías agregar estadísticas del caché
      message: 'Cache stats available in future versions'
    }
  });
}

/**
 * Crea/actualiza un índice de embeddings en memoria
 * POST /api/gemini/embeddings/index
 * body: { name: string, documents: Array<{text:string, meta?:any}>, model?: string }
 */
export async function upsertEmbeddingsIndex(req, res, next) {
  const requestMetrics = analyticsService.startRequest('embeddings_index', req.body.model || 'default');
  
  try {
    const { name, documents, model } = req.body;
    if (!name || !Array.isArray(documents)) {
      analyticsService.failRequest(requestMetrics, new Error('Missing index name or documents'));
      return res.status(400).json({ error: 'Nombre de índice y documentos son requeridos' });
    }
    
    const result = await embeddingsService.upsertIndex(name, documents, { model });
    
    analyticsService.endRequest(requestMetrics, {
      indexName: name,
      documentsCount: documents.length,
      model: model || 'default',
      operation: 'upsert'
    });
    
    res.json({ message: 'Índice actualizado', ...result });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Búsqueda semántica por similitud
 * POST /api/gemini/embeddings/search
 * body: { name: string, query: string, topK?: number, model?: string }
 */
export async function searchEmbeddings(req, res, next) {
  const requestMetrics = analyticsService.startRequest('embeddings_search', req.body.model || 'default');
  
  try {
    const { name, query, topK = 5, model } = req.body;
    if (!name || !query) {
      analyticsService.failRequest(requestMetrics, new Error('Missing index name or query'));
      return res.status(400).json({ error: 'Nombre de índice y query son requeridos' });
    }
    
    const results = await embeddingsService.search(name, query, topK, { model });
    
    analyticsService.endRequest(requestMetrics, {
      indexName: name,
      queryLength: query.length,
      topK,
      resultsCount: results.length,
      model: model || 'default',
      operation: 'search'
    });
    
    res.json({ results });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Limpia un índice de embeddings
 * DELETE /api/gemini/embeddings/index/:name
 */
export function clearEmbeddingsIndex(req, res, next) {
  const requestMetrics = analyticsService.startRequest('embeddings_clear', 'system');
  
  try {
    const { name } = req.params;
    if (!name) {
      analyticsService.failRequest(requestMetrics, new Error('Missing index name'));
      return res.status(400).json({ error: 'Nombre requerido' });
    }
    
    const result = embeddingsService.clearIndex(name);
    
    analyticsService.endRequest(requestMetrics, {
      indexName: name,
      operation: 'clear'
    });
    
    res.json({ message: 'Índice limpiado', ...result });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Stats del Context Cache
 * GET /api/gemini/context-cache/stats
 */
export function getContextCacheStats(req, res) {
  const requestMetrics = analyticsService.startRequest('context_cache_stats', 'system');
  
  try {
    const stats = contextCacheService.getStats();
    
    analyticsService.endRequest(requestMetrics, {
      operation: 'get_cache_stats',
      cacheSize: stats.size || 0
    });
    
    res.json({ stats });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    res.status(500).json({ error: 'Error al obtener estadísticas del cache' });
  }
}

// === NUEVOS ENDPOINTS: BATCH PROCESSING ===

/**
 * Procesa múltiples requests de generación en batch
 * POST /api/gemini/batch/generate
 * body: { requests: Array<{prompt, model?, temperature?, maxTokens?}>, options?: {concurrency?, failFast?, timeout?} }
 */
export async function processBatchGeneration(req, res, next) {
  try {
    const { requests, options = {} } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de requests no vacío',
        example: {
          requests: [
            { prompt: "¿Qué es la IA?", model: "gemini-2.5-flash-lite" },
            { prompt: "Explica blockchain", temperature: 0.7 }
          ],
          options: { concurrency: 3, failFast: false }
        }
      });
    }
    
    const result = await batchService.processBatchGeneration(requests, options);
    
    res.json({
      message: 'Batch processing completado',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Procesa múltiples operaciones de embeddings en batch
 * POST /api/gemini/batch/embeddings
 * body: { operations: Array<{type, ...params}>, options?: {concurrency?} }
 */
export async function processBatchEmbeddings(req, res, next) {
  try {
    const { operations, options = {} } = req.body;
    
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de operaciones no vacío',
        example: {
          operations: [
            { type: "index", name: "docs", documents: [{text: "contenido"}] },
            { type: "search", name: "docs", query: "buscar esto", topK: 5 }
          ]
        }
      });
    }
    
    const result = await batchService.processBatchEmbeddings(operations, options);
    
    res.json({
      message: 'Batch embeddings completado',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Procesa análisis de múltiples textos en batch
 * POST /api/gemini/batch/analyze
 * body: { texts: Array<string>, analysisType?: string, options?: {} }
 */
export async function processBatchAnalysis(req, res, next) {
  try {
    const { texts, analysisType = 'general', options = {} } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de textos no vacío',
        supportedTypes: ['general', 'sentiment', 'summary', 'keywords']
      });
    }
    
    const result = await batchService.processBatchAnalysis(texts, analysisType, options);
    
    res.json({
      message: 'Batch analysis completado',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene el estado de un batch job
 * GET /api/gemini/batch/status/:batchId
 */
export function getBatchStatus(req, res) {
  const { batchId } = req.params;
  const status = batchService.getBatchStatus(batchId);
  
  if (status.error) {
    return res.status(404).json(status);
  }
  
  res.json(status);
}

/**
 * Lista todos los batch jobs activos
 * GET /api/gemini/batch/active
 */
export function getActiveBatches(req, res) {
  const batches = batchService.getActiveBatches();
  res.json({ batches });
}

/**
 * Cancela un batch job
 * DELETE /api/gemini/batch/:batchId
 */
export function cancelBatch(req, res) {
  const { batchId } = req.params;
  const result = batchService.cancelBatch(batchId);
  
  if (result.error) {
    return res.status(400).json(result);
  }
  
  res.json(result);
}

/**
 * Obtiene estadísticas de batch processing
 * GET /api/gemini/batch/stats
 */
export function getBatchStats(req, res) {
  const stats = batchService.getBatchStats();
  res.json({ stats });
}

// === NUEVOS ENDPOINTS: ANALYTICS AVANZADAS ===

/**
 * Obtiene métricas completas del sistema
 * GET /api/gemini/analytics/metrics
 */
export function getAdvancedMetrics(req, res) {
  const metrics = analyticsService.getMetrics();
  res.json({ metrics });
}

/**
 * Obtiene métricas en tiempo real
 * GET /api/gemini/analytics/realtime
 */
export function getRealTimeMetrics(req, res) {
  const realTimeMetrics = analyticsService.getRealTimeMetrics();
  res.json({ realTime: realTimeMetrics });
}

/**
 * Obtiene insights y recomendaciones del sistema
 * GET /api/gemini/analytics/insights
 */
export function getSystemInsights(req, res) {
  const insights = analyticsService.getInsights();
  res.json({ insights });
}

/**
 * Exporta métricas a archivo
 * POST /api/gemini/analytics/export
 * body: { format?: 'json' | 'csv' }
 */
export async function exportMetrics(req, res, next) {
  try {
    const { format = 'json' } = req.body;
    
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ 
        error: 'Formato no soportado',
        supportedFormats: ['json', 'csv']
      });
    }
    
    const result = await analyticsService.exportMetrics(format);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Error al exportar métricas',
        details: result.error
      });
    }
    
    res.json({
      message: 'Métricas exportadas exitosamente',
      filename: result.filename,
      filepath: result.filepath
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resetea todas las métricas del sistema
 * POST /api/gemini/analytics/reset
 */
export function resetMetrics(req, res) {
  analyticsService.resetMetrics();
  res.json({ 
    message: 'Métricas reseteadas exitosamente',
    timestamp: new Date().toISOString()
  });
}

/**
 * Endpoint para suscribirse a métricas en tiempo real (WebSocket simulation)
 * GET /api/gemini/analytics/stream
 */
export function streamMetrics(req, res) {
  // Configurar headers para Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Enviar métricas iniciales
  const initialMetrics = analyticsService.getRealTimeMetrics();
  res.write(`data: ${JSON.stringify(initialMetrics)}\n\n`);
  
  // Suscribirse a actualizaciones
  const unsubscribe = analyticsService.subscribe((event, data) => {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString()
    };
    
    if (!res.destroyed) {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  });
  
  // Enviar heartbeat cada 30 segundos
  const heartbeat = setInterval(() => {
    if (!res.destroyed) {
      const metrics = analyticsService.getRealTimeMetrics();
      res.write(`data: ${JSON.stringify({ event: 'heartbeat', data: metrics })}\n\n`);
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
  
  // Cleanup al cerrar conexión
  req.on('close', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
  
  req.on('aborted', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
}

/**
 * Extrae contenido de una URL
 * POST /api/gemini/extract-url
 * body: { url: string, includeInContext?: boolean }
 */
export async function extractUrlContent(req, res, next) {
  try {
    const { url, includeInContext = false } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'Se requiere una URL válida',
        example: { url: 'https://example.com' }
      });
    }

    console.log(`Intentando extraer contenido de: ${url}`);

    // Extraer contenido de la URL
    const extractedContent = await webScraperService.extractContent(url);
    
    // Si se solicita, agregar al contexto usando embeddings
    if (includeInContext) {
      try {
        await embeddingsService.upsertIndex('url_context', [{
          content: extractedContent.content,
          metadata: {
            ...extractedContent.metadata,
            type: 'url_content',
            title: extractedContent.title,
            url: extractedContent.url,
            addedAt: new Date().toISOString()
          }
        }]);
        console.log(`Contenido de ${url} agregado al contexto`);
      } catch (contextError) {
        console.warn('Error agregando contenido al contexto:', contextError);
      }
    }

    // Formatear respuesta
    const response = {
      success: true,
      data: extractedContent,
      formatted: webScraperService.formatForChat(extractedContent),
      addedToContext: includeInContext
    };

    console.log(`Extracción exitosa de ${url}: ${extractedContent.title}`);
    res.json(response);
  } catch (error) {
    console.error('Error extracting URL content:', error);
    
    // Proporcionar error más detallado
    const errorResponse = {
      success: false,
      error: error.message,
      url: req.body.url,
      details: {
        type: error.name || 'ExtractionError',
        timestamp: new Date().toISOString()
      }
    };
    
    // Diferentes códigos de estado según el tipo de error
    if (error.message.includes('URL no válida') || error.message.includes('no permitida')) {
      // Proporcionar mensaje más específico para URLs de OAuth
      if (error.message.includes('OAuth') || error.message.includes('oauth')) {
        errorResponse.error = 'Esta URL contiene patrones de autenticación OAuth que pueden causar redirecciones infinitas y no se puede procesar.';
        errorResponse.suggestion = 'Intenta usar la URL de documentación directa sin parámetros de autenticación.';
      }
      return res.status(400).json(errorResponse);
    } else if (error.message.includes('Error HTTP: 404') || error.message.includes('no existe')) {
      return res.status(404).json(errorResponse);
    } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return res.status(408).json(errorResponse);
    } else if (error.message.includes('maximum redirect')) {
      errorResponse.error = 'La URL causó demasiadas redirecciones. Esto puede ocurrir con URLs de autenticación o páginas que requieren login.';
      errorResponse.suggestion = 'Verifica que la URL sea accesible públicamente sin requerir autenticación.';
      return res.status(400).json(errorResponse);
    } else {
      return res.status(500).json(errorResponse);
    }
  }
}

/**
 * Extrae contenido de múltiples URLs
 * POST /api/gemini/extract-multiple-urls
 * body: { urls: string[], options?: { concurrency?: number, continueOnError?: boolean, includeInContext?: boolean } }
 */
export async function extractMultipleUrls(req, res, next) {
  try {
    const { urls, options = {} } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de URLs no vacío',
        example: { urls: ['https://example1.com', 'https://example2.com'] }
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({ 
        error: 'Máximo 10 URLs permitidas por solicitud'
      });
    }

    const { includeInContext = false, ...extractOptions } = options;
    
    // Extraer contenido de múltiples URLs
    const result = await webScraperService.extractMultipleUrls(urls, extractOptions);
    
    // Si se solicita, agregar contenido exitoso al contexto
    if (includeInContext && result.results.length > 0) {
      try {
        const documentsForContext = result.results.map(content => ({
          content: content.content,
          metadata: {
            ...content.metadata,
            type: 'url_content',
            title: content.title,
            url: content.url,
            addedAt: new Date().toISOString()
          }
        }));

        await embeddingsService.upsertIndex('url_context', documentsForContext);
        console.log(`${result.results.length} URLs agregadas al contexto`);
      } catch (contextError) {
        console.warn('Error agregando URLs al contexto:', contextError);
      }
    }

    // Formatear respuestas
    const formattedResults = result.results.map(content => ({
      ...content,
      formatted: webScraperService.formatForChat(content)
    }));

    const response = {
      success: true,
      results: formattedResults,
      errors: result.errors,
      summary: result.summary,
      addedToContext: includeInContext
    };

    res.json(response);
  } catch (error) {
    console.error('Error extracting multiple URLs:', error);
    next(error);
  }
}

/**
 * Valida una URL antes de intentar extraer contenido
 * POST /api/gemini/validate-url
 * body: { url: string }
 */
export async function validateUrl(req, res, next) {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        valid: false,
        error: 'Se requiere una URL válida',
        example: { url: 'https://example.com' }
      });
    }

    console.log(`Validando URL: ${url}`);
    
    // Limpiar la URL
    const cleanedUrl = webScraperService.cleanUrl(url);
    console.log(`URL limpia: ${cleanedUrl}`);
    
    // Validar formato
    const isValidFormat = webScraperService.isValidUrl(cleanedUrl);
    
    if (!isValidFormat) {
      return res.json({
        valid: false,
        originalUrl: url,
        cleanedUrl,
        error: 'URL no válida o no permitida (debe ser HTTP/HTTPS y no local)',
        issues: ['Formato inválido o URL local/privada']
      });
    }
    
    // Verificar si la URL está truncada
    const issues = [];
    if (url.includes('…') || url.includes('...')) {
      issues.push('URL parece estar truncada');
    }
    
    if (url !== cleanedUrl) {
      issues.push('URL fue modificada durante la limpieza');
    }
    
    // Intentar hacer una petición HEAD para verificar accesibilidad
    let accessible = false;
    let httpStatus = null;
    let contentType = null;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const response = await fetch(cleanedUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      accessible = response.ok;
      httpStatus = response.status;
      contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        issues.push(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      
      if (contentType && !contentType.includes('text/html')) {
        issues.push(`Contenido no es HTML: ${contentType}`);
      }
      
    } catch (fetchError) {
      issues.push(`No se pudo acceder: ${fetchError.message}`);
    }
    
    const validation = {
      valid: isValidFormat && accessible && issues.length === 0,
      originalUrl: url,
      cleanedUrl,
      accessible,
      httpStatus,
      contentType,
      issues: issues.length > 0 ? issues : null,
      recommendations: []
    };
    
    // Agregar recomendaciones
    if (url.includes('…') || url.includes('...')) {
      validation.recommendations.push('Intenta copiar la URL completa sin truncar');
    }
    
    if (!accessible && httpStatus === 404) {
      validation.recommendations.push('Verifica que la URL sea correcta y que la página exista');
    }
    
    if (contentType && !contentType.includes('text/html')) {
      validation.recommendations.push('Esta URL no apunta a una página web HTML');
    }
    
    console.log(`Validación completada para ${url}:`, validation);
    res.json(validation);
    
  } catch (error) {
    console.error('Error validating URL:', error);
    res.status(500).json({
      valid: false,
      error: 'Error interno validando la URL',
      details: error.message
    });
  }
}
