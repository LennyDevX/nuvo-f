import { logger } from '../debug/logger';
import { SIZE_UTILS, METRICS_CONFIG } from './cacheConfig';

/**
 * Sistema centralizado de métricas para todos los caches
 */
class CacheMetrics {
  constructor() {
    this.metrics = new Map();
    this.globalStats = {
      totalHits: 0,
      totalMisses: 0,
      totalSets: 0,
      totalDeletes: 0,
      totalClears: 0,
      totalEvictions: 0,
      totalMemoryUsage: 0
    };
    this.startTime = Date.now();
    
    if (METRICS_CONFIG.LOG_INTERVAL) {
      this.startMetricsLogging();
    }
  }

  /**
   * Registrar un cache en el sistema de métricas
   */
  registerCache(cacheId, config = {}) {
    this.metrics.set(cacheId, {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
      evictions: 0,
      currentSize: 0,
      maxSize: config.maxSize || 100,
      domain: config.domain || 'general',
      totalResponseTime: 0,
      avgResponseTime: 0,
      lastActivity: Date.now(),
      memoryUsage: 0
    });
    
    logger.debug('CACHE', `Registered cache: ${cacheId}`, config);
  }

  /**
   * Registrar un hit de cache
   */
  recordHit(cacheId, responseTime = 0) {
    const cache = this.metrics.get(cacheId);
    if (cache) {
      cache.hits++;
      cache.totalResponseTime += responseTime;
      cache.avgResponseTime = cache.totalResponseTime / cache.hits;
      cache.lastActivity = Date.now();
      this.globalStats.totalHits++;
    }
  }

  /**
   * Registrar un miss de cache
   */
  recordMiss(cacheId, responseTime = 0) {
    const cache = this.metrics.get(cacheId);
    if (cache) {
      cache.misses++;
      cache.lastActivity = Date.now();
      this.globalStats.totalMisses++;
    }
  }

  /**
   * Registrar una operación set
   */
  recordSet(cacheId, newSize) {
    const cache = this.metrics.get(cacheId);
    if (cache) {
      cache.sets++;
      cache.currentSize = newSize;
      cache.lastActivity = Date.now();
      this.globalStats.totalSets++;
    }
  }

  /**
   * Registrar una operación delete
   */
  recordDelete(cacheId, newSize) {
    const cache = this.metrics.get(cacheId);
    if (cache) {
      cache.deletes++;
      cache.currentSize = newSize;
      cache.lastActivity = Date.now();
      this.globalStats.totalDeletes++;
    }
  }

  /**
   * Registrar una operación clear
   */
  recordClear(cacheId) {
    const cache = this.metrics.get(cacheId);
    if (cache) {
      cache.clears++;
      cache.currentSize = 0;
      cache.lastActivity = Date.now();
      this.globalStats.totalClears++;
    }
  }

  /**
   * Registrar una eviction
   */
  recordEviction(cacheId, newSize) {
    const cache = this.metrics.get(cacheId);
    if (cache) {
      cache.evictions++;
      cache.currentSize = newSize;
      cache.lastActivity = Date.now();
      this.globalStats.totalEvictions++;
    }
  }

  /**
   * Actualizar uso de memoria
   */
  updateMemoryUsage(memoryUsage) {
    // Se puede llamar con el cacheId específico si es necesario
    this.globalStats.totalMemoryUsage = memoryUsage;
  }

  /**
   * Obtener métricas de un cache específico
   */
  getCacheMetrics(cacheId) {
    const cache = this.metrics.get(cacheId);
    if (!cache) return null;

    const total = cache.hits + cache.misses;
    return {
      ...cache,
      hitRate: total > 0 ? (cache.hits / total * 100).toFixed(2) + '%' : '0%',
      missRate: total > 0 ? (cache.misses / total * 100).toFixed(2) + '%' : '0%',
      fillRate: cache.maxSize > 0 ? (cache.currentSize / cache.maxSize * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Obtener métricas globales
   */
  getGlobalMetrics() {
    const totalRequests = this.globalStats.totalHits + this.globalStats.totalMisses;
    
    return {
      ...this.globalStats,
      globalHitRate: totalRequests > 0 ? 
        (this.globalStats.totalHits / totalRequests * 100).toFixed(2) + '%' : '0%',
      totalMemoryFormatted: SIZE_UTILS.formatBytes(this.globalStats.totalMemoryUsage),
      activeCaches: this.metrics.size,
      totalRequests
    };
  }

  /**
   * Obtener todas las métricas
   */
  getAllMetrics() {
    const cacheMetrics = {};
    for (const [cacheId, _] of this.metrics) {
      cacheMetrics[cacheId] = this.getCacheMetrics(cacheId);
    }

    return {
      global: this.getGlobalMetrics(),
      caches: cacheMetrics
    };
  }

  /**
   * Reset métricas
   */
  reset(cacheId = null) {
    if (cacheId) {
      const cache = this.metrics.get(cacheId);
      if (cache) {
        cache.hits = 0;
        cache.misses = 0;
        cache.sets = 0;
        cache.deletes = 0;
        cache.clears = 0;
        cache.evictions = 0;
        cache.totalResponseTime = 0;
        cache.avgResponseTime = 0;
      }
    } else {
      // Reset global
      this.globalStats = {
        totalHits: 0,
        totalMisses: 0,
        totalSets: 0,
        totalDeletes: 0,
        totalClears: 0,
        totalEvictions: 0,
        totalMemoryUsage: 0
      };
      // Reset all caches
      for (const cache of this.metrics.values()) {
        cache.hits = 0;
        cache.misses = 0;
        cache.sets = 0;
        cache.deletes = 0;
        cache.clears = 0;
        cache.evictions = 0;
        cache.totalResponseTime = 0;
        cache.avgResponseTime = 0;
      }
    }
  }

  /**
   * Utility function para formatear bytes
   */
  formatBytes(bytes) {
    return SIZE_UTILS.formatBytes(bytes);
  }

  // Logging automático de métricas
  startMetricsLogging() {
    setInterval(() => {
      if (METRICS_CONFIG.TRACK_PERFORMANCE) {
        this.logPerformanceMetrics();
      }
    }, METRICS_CONFIG.LOG_INTERVAL);
  }

  // Log de métricas de rendimiento
  logPerformanceMetrics() {
    const global = this.getGlobalMetrics();
    
    logger.throttledLog('INFO', 'CACHE', 'Global Cache Metrics', {
      hitRate: global.globalHitRate,
      totalRequests: global.totalRequests,
      memoryUsage: global.avgMemoryUsage,
      uptime: global.uptime
    }, 60000); // Log cada minuto máximo

    // Log métricas por caché con baja eficiencia
    for (const [cacheId, _] of this.metrics) {
      const metrics = this.getCacheMetrics(cacheId);
      if (metrics && metrics.efficiency < 0.5) {
        logger.warn('CACHE', `Low efficiency cache: ${cacheId}`, {
          hitRate: metrics.hitRate,
          efficiency: (metrics.efficiency * 100).toFixed(1) + '%',
          fillRate: metrics.fillRate
        });
      }
    }
  }
}

// Export singleton instance
export const cacheMetrics = new CacheMetrics();

