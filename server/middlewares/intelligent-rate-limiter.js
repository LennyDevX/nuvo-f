import rateLimit from 'express-rate-limit';

// Rate limiting basado en el tipo de usuario y endpoint
export const createIntelligentRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
    max: (req) => {
      // Más requests para endpoints simples
      if (req.path === '/hello') return 100;
      if (req.path === '/models') return 50;
      
      // Menos para endpoints computacionalmente intensivos
      if (req.method === 'POST') return 20;
      return 30;
    },
    keyGenerator: (req) => {
      // Rate limiting por IP + User-Agent para mejor granularidad
      return `${req.ip}-${req.get('User-Agent')?.slice(0, 50)}`;
    }
  });
};
