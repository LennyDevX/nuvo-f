import env from '../config/environment.js';

export default function authMiddleware(req, res, next) {
  // Si no hay API key configurada, permitir todas las solicitudes
  if (!env.serverApiKey) {
    return next();
  }
  
  const clientKey = req.headers['x-api-key'];
  
  if (!clientKey || clientKey !== env.serverApiKey) {
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid API Key',
      message: 'Please provide a valid API key in the x-api-key header'
    });
  }
  
  next();
}
