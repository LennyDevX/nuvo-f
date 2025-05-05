import { processGeminiRequest, processFunctionCallingRequest } from '../services/gemini-service.js';
import { streamText } from '../utils/stream-utils.js';
import { getMetrics } from '../middlewares/logger.js';

export async function generateContent(req, res, next) {
  try {
    const { prompt, model, messages, temperature, maxTokens, stream } = req.body;
    
    // Soporte para historial de mensajes (array) o prompt simple
    const contents = messages && Array.isArray(messages) && messages.length > 0
      ? messages
      : prompt;
      
    if (!contents) {
      return res.status(400).json({ error: 'Se requiere un prompt o historial de mensajes' });
    }
    
    const params = {};
    if (temperature !== undefined) params.temperature = temperature;
    if (maxTokens !== undefined) params.maxOutputTokens = maxTokens;

    const response = await processGeminiRequest(contents, model, params);

    // Si se pide streaming, envía la respuesta en chunks
    if (stream) {
      return streamText(res, response.text || '');
    }

    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text
    });
  } catch (error) {
    next(error);
  }
}

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

export function getHealthStatus(req, res) {
  res.json({
    status: 'ok',
    ...getMetrics()
  });
}

export function helloCheck(req, res) {
  res.json({ 
    message: 'Gemini API is running', 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
