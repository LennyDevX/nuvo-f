import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Función para procesar solicitudes a Gemini usando el nuevo SDK y sintaxis correcta
async function processGeminiRequest(prompt, model = 'gemini-2.0-flash') {
  if (!apiKey) {
    throw new Error('API key no configurada');
  }
  if (!prompt) {
    throw new Error('Se requiere un prompt');
  }
  // Sintaxis oficial del nuevo SDK
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  // El texto generado está en response.text
  return response.text;
}

// Ruta POST para Gemini
router.post('/', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const text = await processGeminiRequest(prompt, model);
    
    res.json({ 
      message: 'Respuesta de Gemini generada correctamente',
      response: text 
    });
  } catch (error) {
    console.error('Error con la API de Gemini:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud con Gemini',
      details: error.message 
    });
  }
});

// Ruta GET para pruebas desde el navegador
router.get('/', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const model = req.query.model;
    const text = await processGeminiRequest(prompt, model);
    
    res.json({ 
      message: 'Respuesta de Gemini generada correctamente',
      response: text 
    });
  } catch (error) {
    console.error('Error con la API de Gemini:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud con Gemini',
      details: error.message 
    });
  }
});

// Endpoint especial para Function Calling
router.post('/function-calling', async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.0-flash', functionDeclarations, functionCallingMode = 'ANY', allowedFunctionNames } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }

    // Ejemplo de functionDeclaration si no se envía ninguna
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
          mode: functionCallingMode, // 'ANY', 'NONE', 'AUTO', etc.
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
    console.error('Error en function-calling:', error);
    res.status(500).json({ error: 'Error en function-calling', details: error.message });
  }
});

export default router;
