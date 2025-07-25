import { 
  processGeminiRequest, 
  processGeminiStreamRequest,
  createOptimizedGeminiStream,
  processFunctionCallingRequest, 
  clearCache as clearGeminiCache 
} from '../services/gemini-service.js';
import { streamText } from '../utils/stream-utils.js';
import { getMetrics } from '../middlewares/logger.js';

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
  try {
    const { prompt, model, messages, temperature, maxTokens, stream, image } = req.body;
    // Validación de entrada
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
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

    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text,
      // Si el modelo devuelve imagen, inclúyela
      image: response.image || null,
      metadata: {
        model: model || 'default',
        tokensUsed: response.usage?.totalTokens || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Genera contenido usando Gemini (GET).
 * GET /api/gemini/generate
 */
export async function generateContentGet(req, res, next) {
  try {
    const prompt = req.query.prompt;
    const model = req.query.model;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }
    
    const response = await processGeminiRequest(prompt, model);
    
    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Llama funciones usando Gemini Function Calling.
 * POST /api/gemini/function-calling
 */
export async function functionCalling(req, res, next) {
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

    res.json({
      message: 'Respuesta de Gemini con Function Calling',
      response: response.text,
      functionCalls: response.functionCalls
    });
  } catch (error) {
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
        name: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        isDefault: false, // ← Cambiar a false
        isStable: true,
        description: 'Latest stable model with fast performance'
      },
      {
        name: 'gemini-1.5-pro', 
        displayName: 'Gemini 1.5 Pro',
        isStable: true,
        description: 'High-quality responses with large context window'
      },
      {
        name: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash', 
        isStable: true,
        description: 'Fast and efficient for most tasks'
      },
      {
        name: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        isDefault: true, // ← Cambiar a true
        isStable: false,
        isPreview: true,
        description: 'Stable model - optimized for speed and quality'
      }
    ],
    default: 'gemini-2.5-flash', // ← Ya está correcto
    note: 'Stable models are recommended for production use. Preview models may experience issues and automatically fallback to stable models.'
  });
}

/**
 * Analiza un texto usando Gemini.
 * POST /api/gemini/analyze
 */
export async function analyzeText(req, res, next) {
  try {
    const { text, analysisType = 'general', detailedAnalysis = false } = req.body;
    
    if (!text) {
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
    
    res.json({
      analysis: response.text,
      type: analysisType,
      metrics,
      additionalAnalysis,
      processingTime: Date.now() - req.startTime || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Compara dos textos usando Gemini.
 * POST /api/gemini/compare
 */
export async function compareTexts(req, res, next) {
  try {
    const { text1, text2, comparisonType = 'similarity' } = req.body;
    
    if (!text1 || !text2) {
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
    
    res.json({
      comparison: response.text,
      type: comparisonType,
      lengths: {
        text1: text1.length,
        text2: text2.length
      }
    });
  } catch (error) {
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
