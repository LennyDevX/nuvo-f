// Configuración para rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30; // Máximo 30 peticiones por ventana
const rateLimitMap = new Map();

export default function rateLimiterMiddleware(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  
  if (timestamps.length > RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Try again later.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    });
  }
  
  next();
}
