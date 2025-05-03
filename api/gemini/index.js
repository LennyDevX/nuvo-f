import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Función para procesar solicitudes a Gemini
async function processGeminiRequest(prompt, model = 'gemini-2.0-flash-lite') {
  if (!apiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!prompt) {
    throw new Error('Se requiere un prompt');
  }
  
  const geminiModel = genAI.getGenerativeModel({ model });
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
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

export default router;
