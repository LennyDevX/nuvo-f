import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export default {
  port: process.env.PORT || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY,
  serverApiKey: process.env.SERVER_API_KEY,
  isVercel: process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined || process.env.VERCEL_URL !== undefined,
  nodeEnv: process.env.NODE_ENV || 'development'
};
