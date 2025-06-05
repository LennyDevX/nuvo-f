import ai, { DEFAULT_MODEL, defaultFunctionDeclaration } from '../config/ai-config.js';
import { incrementTokenCount } from '../middlewares/logger.js';
import env from '../config/environment.js';

/**
 * Utilidad para timeout y reintentos
 * @param {Function} fn - Función a ejecutar con timeout y reintentos
 * @param {Object} options - Opciones de timeout y reintentos
 * @param {Number} options.timeoutMs - Tiempo máximo de espera en milisegundos
 * @param {Number} options.maxRetries - Número máximo de reintentos
 * @param {Number} options.backoffMs - Tiempo de espera entre reintentos en milisegundos
 * @returns {Promise<any>} - Resultado de la función
 */
async function withTimeoutAndRetry(fn, { timeoutMs = 30000, maxRetries = 2, backoffMs = 2000 } = {}) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout esperando respuesta de Gemini')), timeoutMs))
      ]);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      // Solo reintenta en timeout o errores de red
      if (err.message && (err.message.includes('Timeout') || err.message.includes('network'))) {
        await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
        attempt++;
      } else {
        throw err;
      }
    }
  }
}

// Sistema de caché mejorado con TTL
class ResponseCache {
  constructor(maxSize = 100, ttlMs = 300000) { // 5 minutos TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  
  generateKey(contents, model, params) {
    return JSON.stringify({ contents, model, params });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

const responseCache = new ResponseCache();

/**
 * Procesa una solicitud a la API de Gemini
 * @param {Object|String} contents - Contenido del prompt o historial de mensajes
 * @param {String} model - Modelo de Gemini a utilizar
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise<Object>} - Respuesta de Gemini
 */
export async function processGeminiRequest(contents, model = DEFAULT_MODEL, params = {}) {
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!contents) {
    throw new Error('Se requiere un prompt o historial de mensajes');
  }
  
  // Verificar caché
  const cacheKey = responseCache.generateKey(contents, model, params);
  const cachedResponse = responseCache.get(cacheKey);
  
  if (cachedResponse) {
    console.log('Respuesta obtenida desde caché');
    return cachedResponse;
  }
  
  // Configuración de generación mejorada
  const generationConfig = {
    temperature: params.temperature || 0.7,
    topK: params.topK || 40,
    topP: params.topP || 0.95,
    maxOutputTokens: params.maxOutputTokens || 2048,
    responseMimeType: 'text/plain',
  };
  
  // Llama al modelo Gemini con timeout y reintentos
  const response = await withTimeoutAndRetry(() => ai.models.generateContent({
    model,
    contents,
    generationConfig,
    ...params
  }), { timeoutMs: 35000, maxRetries: 2, backoffMs: 2500 });
  
  // Guardar en caché
  responseCache.set(cacheKey, response);
  
  // Conteo de tokens (si el SDK lo permite)
  if (response.usage && response.usage.totalTokens) {
    incrementTokenCount(response.usage.totalTokens);
  }
  
  return response;
}

// Función para limpiar caché manualmente
export function clearCache() {
  responseCache.clear();
}

/**
 * Procesa una solicitud de function calling a la API de Gemini
 * @param {Object} options - Opciones de la solicitud
 * @returns {Promise<Object>} - Respuesta con function calls
 */
export async function processFunctionCallingRequest({
  prompt,
  model = DEFAULT_MODEL,
  functionDeclarations = [defaultFunctionDeclaration],
  functionCallingMode = 'ANY',
  allowedFunctionNames = ['controlLight']
}) {
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!prompt) {
    throw new Error('Se requiere un prompt');
  }
  
  const tools = [{ functionDeclarations }];
  
  const config = {
    toolConfig: {
      functionCallingConfig: {
        mode: functionCallingMode,
        allowedFunctionNames: allowedFunctionNames
      }
    },
    tools
  };
  
  // Llama al modelo Gemini con timeout y reintentos
  const response = await withTimeoutAndRetry(() => ai.models.generateContent({
    model,
    contents: prompt,
    config
  }), { timeoutMs: 35000, maxRetries: 2, backoffMs: 2500 });
  
  return {
    text: response.text,
    functionCalls: response.functionCalls || null
  };
}
