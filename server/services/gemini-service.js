import ai, { DEFAULT_MODEL, defaultFunctionDeclaration } from '../config/ai-config.js';
import { incrementTokenCount } from '../middlewares/logger.js';
import env from '../config/environment.js';

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
  
  // Llama al modelo Gemini
  const response = await ai.models.generateContent({
    model,
    contents,
    ...params
  });
  
  // Conteo de tokens (si el SDK lo permite)
  if (response.usage && response.usage.totalTokens) {
    incrementTokenCount(response.usage.totalTokens);
  }
  
  return response;
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
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config
  });
  
  return {
    text: response.text,
    functionCalls: response.functionCalls || null
  };
}
