import { incrementErrorCount } from './logger.js';

export default function errorHandler(err, req, res, next) {
  incrementErrorCount();
  
  console.error('Error Handler:', err);
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON syntax'
    });
  }
  
  // Errores específicos de Gemini mejorados
  if (err.message?.includes('quota')) {
    return res.status(429).json({
      error: 'Quota Exceeded',
      message: 'API quota exceeded. Please try again later.',
      retryAfter: 3600 // 1 hora
    });
  }
  
  if (err.message?.includes('safety')) {
    return res.status(400).json({
      error: 'Content Safety',
      message: 'Content blocked by safety filters'
    });
  }
  
  if (err.message?.includes('API key')) {
    return res.status(500).json({ 
      error: 'Configuration Error',
      message: 'Gemini API key not configured properly'
    });
  }
  
  if (err.message?.includes('Timeout')) {
    return res.status(504).json({
      error: 'Timeout Error', 
      message: 'The AI service took too long to respond'
    });
  }
  
  if (err.message?.includes('Rate limit')) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.'
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
}
