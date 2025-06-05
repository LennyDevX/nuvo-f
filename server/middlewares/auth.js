import env from '../config/environment.js';

export default function auth(req, res, next) {
  // En desarrollo, permitir todas las requests
  if (env.nodeEnv === 'development') {
    return next();
  }
  
  // En producción, verificar API key
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey || apiKey !== env.serverApiKey) {
    return res.status(401).json({
      error: 'Unauthorized - API key required'
    });
  }
  
  next();
}
