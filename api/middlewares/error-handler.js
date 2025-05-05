import { incrementErrorCount } from './logger.js';
import env from '../config/environment.js';

export default function errorHandler(err, req, res, next) {
  incrementErrorCount();
  
  console.error('Error:', err);
  
  // No exponer detalles de error en producción
  const errorDetails = env.nodeEnv === 'production' 
    ? 'An internal server error occurred' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: err.name || 'Error',
    message: errorDetails,
    path: req.path
  });
}
