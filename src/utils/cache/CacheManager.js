import { logger } from '../debug/logger';
import { cacheMetrics } from './CacheMetrics';
import { CACHE_TTL, CLEANUP_CONFIG } from './cacheConfig';

const CACHE_STORAGE_KEY = 'nuvo-cache-manager-v1';

export class CacheManager {
  constructor(maxSize = 100, cacheId = 'general') {
    this.cache = new Map();
    this.ttls = new Map();
    this.maxSize = maxSize;
    this.cacheId = cacheId;
    
    // Registrar en métricas
    cacheMetrics.registerCache(cacheId, { maxSize });
    
    this._loadFromStorage();
    this.setupProgressiveCleanup();
    
    logger.debug('CACHE', `CacheManager "${cacheId}" initialized`, { maxSize });
  }

  // Configurar limpieza progresiva
  setupProgressiveCleanup() {
    setInterval(() => {
      this.progressiveCleanup();
    }, CLEANUP_CONFIG.INTERVAL);
  }

  // Limpieza progresiva
  progressiveCleanup() {
    const startTime = Date.now();
    const now = Date.now();
    let cleaned = 0;
    
    const entries = Array.from(this.ttls.entries());
    
    for (const [key, expiry] of entries) {
      if (Date.now() - startTime > CLEANUP_CONFIG.MAX_CLEANUP_TIME) {
        break;
      }
      
      if (cleaned >= CLEANUP_CONFIG.BATCH_SIZE) {
        break;
      }
      
      if (now > expiry) {
        this.cache.delete(key);
        this.ttls.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this._saveToStorage();
      logger.throttledLog('DEBUG', 'CACHE', `CacheManager "${this.cacheId}" cleanup removed ${cleaned} expired entries`, null, 30000);
      cacheMetrics.updateMemoryUsage(this.getMemoryUsage());
    }
  }

  async get(key, fetchFn, ttl = CACHE_TTL.DEFAULT) {
    const startTime = performance.now();
    const now = Date.now();
    const cached = this.cache.get(key);
    const expiry = this.ttls.get(key);

    // Check if we have a valid cached item
    if (cached && expiry && now < expiry) {
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordHit(this.cacheId, responseTime);
      return cached;
    }

    const responseTime = performance.now() - startTime;
    cacheMetrics.recordMiss(this.cacheId, responseTime);
    
    // If no fetch function provided, just return the cached value or null
    if (!fetchFn) return cached || null;

    // Fetch new data
    try {
      const data = await fetchFn();
      
      // Only cache if we got valid data
      if (data !== undefined && data !== null) {
        this.set(key, data, ttl);
      }
      return data;
    } catch (error) {
      logger.error('CACHE', `Error fetching data for cache key ${key}`, error);
      
      // If we have stale data, return it as fallback
      if (cached) {
        logger.throttledLog('WARN', 'CACHE', `Returning stale data for ${key} due to fetch error`, null, 30000);
        return cached;
      }
      throw error;
    }
  }

  set(key, data, ttl = CACHE_TTL.DEFAULT) {
    // Implement LRU eviction if cache exceeds max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this._getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.ttls.delete(oldestKey);
        cacheMetrics.recordEviction(this.cacheId, this.cache.size);
      }
    }
    
    this.cache.set(key, data);
    this.ttls.set(key, Date.now() + ttl);
    this._saveToStorage();
    
    cacheMetrics.recordSet(this.cacheId, this.cache.size);
    logger.throttledLog('DEBUG', 'CACHE', `CacheManager "${this.cacheId}" set key: ${key}`, { ttl }, 10000);
  }

  clear(key) {
    if (key) {
      const deleted = this.cache.delete(key);
      this.ttls.delete(key);
      if (deleted) {
        cacheMetrics.recordDelete(this.cacheId, this.cache.size);
      }
    } else {
      this.cache.clear();
      this.ttls.clear();
      cacheMetrics.recordClear(this.cacheId);
    }
    this._saveToStorage();
  }

  clearByPrefix(prefix) {
    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        this.ttls.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      this._saveToStorage();
      logger.info('CACHE', `CacheManager "${this.cacheId}" cleared ${cleared} entries with prefix: ${prefix}`);
      cacheMetrics.recordDelete(this.cacheId, this.cache.size);
    }
  }

  // Find the key with the oldest expiry time
  _getOldestKey() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, expiry] of this.ttls.entries()) {
      if (expiry < oldestTime) {
        oldestTime = expiry;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
  
  // Clean expired items
  purgeExpired() {
    const now = Date.now();
    let changed = false;
    for (const [key, expiry] of this.ttls.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttls.delete(key);
        changed = true;
      }
    }
    if (changed) this._saveToStorage();
  }
  
  // Obtener uso de memoria estimado con manejo de BigInt
  getMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      try {
        // Función personalizada para manejar BigInt
        const stringifiedValue = JSON.stringify(value, (key, val) => {
          if (typeof val === 'bigint') {
            return val.toString();
          }
          return val;
        });
        totalSize += stringifiedValue.length * 2; // UTF-16
        totalSize += key.length * 2;
      } catch (error) {
        // Si falla la serialización, usar aproximación básica
        console.warn('Failed to serialize cache value for memory calculation:', error);
        totalSize += 100; // Estimación aproximada por elemento
        totalSize += key.length * 2;
      }
    }
    return totalSize;
  }

  // Get statistics about the cache usage con métricas integradas
  getStats() {
    const metricsData = cacheMetrics.getCacheMetrics(this.cacheId);
    const memoryUsage = this.getMemoryUsage();
    
    return {
      cacheId: this.cacheId,
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: cacheMetrics.formatBytes(memoryUsage),
      metrics: metricsData
    };
  }

  _saveToStorage() {
    try {
      const obj = {
        cache: Array.from(this.cache.entries()),
        ttls: Array.from(this.ttls.entries())
      };
      // Usar el mismo replacer para localStorage
      const serializedData = JSON.stringify(obj, (key, val) => {
        if (typeof val === 'bigint') {
          return val.toString();
        }
        return val;
      });
      localStorage.setItem(CACHE_STORAGE_KEY, serializedData);
    } catch (e) {
      // Log the error for debugging
      console.warn('Failed to save cache to localStorage:', e);
    }
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj.cache && obj.ttls) {
        this.cache = new Map(obj.cache);
        this.ttls = new Map(obj.ttls);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

export const globalCache = new CacheManager(100, 'global');

// Automatically clean expired items every minute
setInterval(() => {
  globalCache.purgeExpired();
}, 60000);
