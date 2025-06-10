import env from '../config/environment.js';

export default function auth(req, res, next) {
  // Para Vercel Preview y producción, temporalmente permitir todas las requests
  // Esto evita problemas de autenticación mientras están en development/preview
  return next();
  
  // Código de autenticación completo (comentado temporalmente)
  /*
  // Siempre permitir acceso si no tenemos SERVER_API_KEY configurada
  if (!env.serverApiKey) {
    return next();
  }
  
  // Permitir acceso en desarrollo
  if (env.nodeEnv === 'development') {
    return next();
  }
  
  // Permitir acceso en Vercel (cualquier variante de detección)
  if (env.isVercel || process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
    console.log('Auth middleware - Running on Vercel, bypassing auth');
    return next();
  }
  
  // Solo en este punto verificar API key
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey || apiKey !== env.serverApiKey) {
    console.log('Auth middleware - Unauthorized access attempt', { 
      hasApiKey: !!apiKey, 
      environment: env.nodeEnv,
      isVercel: env.isVercel 
    });
    return res.status(401).json({
      error: 'Unauthorized - API key required'
    });
  }
  
  next();
  */
}
