import { globalCache } from '../cache/CacheManager';

const API_STATS_KEY = 'alchemy-api-stats';
let stats = globalCache.get(API_STATS_KEY) || {
  calls: 0,
  errors: 0,
  lastCalled: {},
  timestamp: Date.now()
};

export function trackApiCall(endpoint, success = true) {
  stats.calls++;
  if (!success) stats.errors++;
  stats.lastCalled[endpoint] = Date.now();
  globalCache.set(API_STATS_KEY, stats, 24 * 60 * 60 * 1000); // 24h
  
  // Verificar si estamos haciendo muchas llamadas
  const recentCalls = Object.values(stats.lastCalled)
    .filter(time => Date.now() - time < 60000).length;
  
  return recentCalls > 20; // True si estamos haciendo demasiadas llamadas
}