// Métricas simples
let totalRequests = 0;
let totalErrors = 0;
let totalTokens = 0;

export const getMetrics = () => ({
  totalRequests,
  totalErrors,
  totalTokens
});

export const incrementTokenCount = (amount) => {
  totalTokens += amount;
};

export const incrementErrorCount = () => {
  totalErrors++;
};

export default function loggerMiddleware(req, res, next) {
  const start = Date.now();
  totalRequests++;
  
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${ms}ms`);
  });
  
  next();
}
