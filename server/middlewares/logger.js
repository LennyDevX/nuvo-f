// Métricas simples
let totalRequests = 0;
let totalErrors = 0;
let totalTokens = 0;
let tokenCount = 0;

export const getMetrics = () => ({
  totalRequests,
  totalErrors,
  totalTokens
});

export function incrementTokenCount(count) {
  tokenCount += count;
}

export function getTokenCount() {
  return tokenCount;
}

export const incrementErrorCount = () => {
  totalErrors++;
};

export default function logger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - START`);
  
  // Interceptar el final de la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
}
