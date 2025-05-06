import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

// --- Métricas simples ---
let totalRequests = 0;
let totalErrors = 0;
let totalTokens = 0;

// --- Rate limiting básico en memoria ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30; // Máximo 30 peticiones por ventana
const rateLimitMap = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  if (timestamps.length > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }
  next();
}

// --- Autenticación por API Key ---
// Si no tienes SERVER_API_KEY definida, desactiva la autenticación por completo
const SERVER_API_KEY = process.env.SERVER_API_KEY;
function requireApiKey(req, res, next) {
  if (!SERVER_API_KEY) {
    // No hay autenticación si no existe la variable de entorno
    return next();
  }
  const clientKey = req.headers['x-api-key'];
  if (!clientKey || clientKey !== SERVER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
}

// --- Logger simple ---
function logRequest(req, res, next) {
  const start = Date.now();
  totalRequests++;
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${ms}ms`);
  });
  next();
}

// --- Health & metrics endpoint ---
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    totalRequests,
    totalErrors,
    totalTokens
  });
});

// --- Endpoint simple para /api/hello (health check para el frontend) ---
router.get('/hello', (req, res) => {
  res.json({ message: 'Gemini API is running', status: 'ok' });
});

// --- Middleware global ---
router.use(logRequest);
router.use(rateLimit);
router.use(requireApiKey);

// --- Función para procesar solicitudes a Gemini ---
async function processGeminiRequest(contents, model = 'gemini-2.0-flash', params = {}) {
  if (!apiKey) throw new Error('API key no configurada');
  if (!contents) throw new Error('Se requiere un prompt o historial de mensajes');
  // Llama al modelo Gemini
  const response = await ai.models.generateContent({
    model,
    contents,
    ...params
  });
  // Simula conteo de tokens (si el SDK lo permite, usa response.usage)
  if (response.usage && response.usage.totalTokens) {
    totalTokens += response.usage.totalTokens;
  }
  return response;
}

// --- Streaming helper (mejorado para soportar streaming real) ---
async function streamText(res, text) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  // Más granularidad para una experiencia fluida
  const chunkSize = 10; // Enviamos de 10 en 10 caracteres
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    res.write(chunk);
    // Pequeña pausa para simular respuesta natural
    await new Promise(r => setTimeout(r, 5));
  }
  res.end();
}

// --- POST principal con soporte mejorado para historial y streaming ---
router.post('/', async (req, res) => {
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

    const response = await processGeminiRequest(contents, model || 'gemini-2.0-flash', params);

    // Si se pide streaming, envía la respuesta en chunks
    if (stream) {
      console.log('Enviando respuesta en streaming');
      await streamText(res, response.text || '');
      return;
    }

    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text
    });
  } catch (error) {
    totalErrors++;
    console.error('Error con la API de Gemini:', error);
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    if (error.message && error.message.includes('prompt')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(502).json({
      error: 'Error al procesar la solicitud con Gemini',
      details: error.message
    });
  }
});

// --- GET para pruebas desde navegador ---
router.get('/', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const model = req.query.model;
    const text = await processGeminiRequest(prompt, model);
    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: text.text
    });
  } catch (error) {
    totalErrors++;
    console.error('Error con la API de Gemini:', error);
    res.status(502).json({
      error: 'Error al procesar la solicitud con Gemini',
      details: error.message
    });
  }
});

// --- Endpoint especial para Function Calling ---
router.post('/function-calling', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.0-flash', functionDeclarations, functionCallingMode = 'ANY', allowedFunctionNames } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }

    const defaultFunctionDeclaration = {
      name: 'controlLight',
      parameters: {
        type: 'object',
        description: 'Set the brightness and color temperature of a room light.',
        properties: {
          brightness: {
            type: 'number',
            description: 'Light level from 0 to 100. Zero is off and 100 is full brightness.'
          },
          colorTemperature: {
            type: 'string',
            description: 'Color temperature: daylight, cool, or warm.'
          }
        },
        required: ['brightness', 'colorTemperature']
      }
    };

    const tools = [{ functionDeclarations: functionDeclarations || [defaultFunctionDeclaration] }];

    const config = {
      toolConfig: {
        functionCallingConfig: {
          mode: functionCallingMode,
          allowedFunctionNames: allowedFunctionNames || ['controlLight']
        }
      },
      tools
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config
    });

    res.json({
      message: 'Respuesta de Gemini con Function Calling',
      response: response.text,
      functionCalls: response.functionCalls || null
    });
  } catch (error) {
    totalErrors++;
    console.error('Error en function-calling:', error);
    res.status(502).json({ error: 'Error en function-calling', details: error.message });
  }
});

export default router;
