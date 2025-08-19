/**
 * Gestor de Memory Pooling
 * Reutiliza objetos para reducir garbage collection y mejorar rendimiento
 */

import { logger } from '../debug/logger.js';
import { memoryPressureDetector } from './MemoryPressureDetector.js';

class MemoryPoolManager {
  constructor() {
    this.pools = new Map(); // poolName -> pool
    this.poolStats = new Map(); // poolName -> stats
    this.config = {
      // Configuración de pools
      pools: {
        maxSize: 100, // Máximo objetos por pool
        initialSize: 10, // Tamaño inicial del pool
        growthFactor: 1.5, // Factor de crecimiento
        shrinkThreshold: 0.3, // Umbral para reducir pool
        maxIdleTime: 5 * 60 * 1000 // 5 minutos máximo sin uso
      },
      // Tipos de objetos predefinidos
      objectTypes: {
        CACHE_ENTRY: 'cache_entry',
        METADATA: 'metadata',
        OPERATION: 'operation',
        RESULT: 'result',
        BATCH: 'batch',
        METRICS: 'metrics',
        ARRAY_BUFFER: 'array_buffer',
        STRING_BUILDER: 'string_builder'
      },
      // Configuración de limpieza
      cleanup: {
        enabled: true,
        interval: 2 * 60 * 1000, // 2 minutos
        aggressiveCleanup: false
      },
      // Configuración de monitoreo
      monitoring: {
        enabled: true,
        trackAllocations: true,
        trackPerformance: true
      }
    };
    
    this.initializePredefinedPools();
    this.initializeMemoryPressureHandling();
    this.startPeriodicCleanup();
  }

  /**
   * Inicializar pools predefinidos
   */
  initializePredefinedPools() {
    // Pool para entradas de cache
    this.createPool(this.config.objectTypes.CACHE_ENTRY, {
      factory: () => ({
        key: null,
        value: null,
        ttl: 0,
        createdAt: 0,
        lastAccessed: 0,
        accessCount: 0,
        size: 0,
        metadata: null
      }),
      reset: (obj) => {
        obj.key = null;
        obj.value = null;
        obj.ttl = 0;
        obj.createdAt = 0;
        obj.lastAccessed = 0;
        obj.accessCount = 0;
        obj.size = 0;
        obj.metadata = null;
        return obj;
      },
      maxSize: 200
    });
    
    // Pool para metadata
    this.createPool(this.config.objectTypes.METADATA, {
      factory: () => ({
        type: null,
        source: null,
        timestamp: 0,
        version: null,
        tags: [],
        properties: new Map()
      }),
      reset: (obj) => {
        obj.type = null;
        obj.source = null;
        obj.timestamp = 0;
        obj.version = null;
        obj.tags.length = 0;
        obj.properties.clear();
        return obj;
      },
      maxSize: 100
    });
    
    // Pool para operaciones
    this.createPool(this.config.objectTypes.OPERATION, {
      factory: () => ({
        id: null,
        type: null,
        key: null,
        value: null,
        options: {},
        timestamp: 0,
        status: 'pending',
        result: null,
        error: null
      }),
      reset: (obj) => {
        obj.id = null;
        obj.type = null;
        obj.key = null;
        obj.value = null;
        obj.options = {};
        obj.timestamp = 0;
        obj.status = 'pending';
        obj.result = null;
        obj.error = null;
        return obj;
      },
      maxSize: 150
    });
    
    // Pool para resultados
    this.createPool(this.config.objectTypes.RESULT, {
      factory: () => ({
        success: false,
        data: null,
        error: null,
        timestamp: 0,
        executionTime: 0,
        metadata: {}
      }),
      reset: (obj) => {
        obj.success = false;
        obj.data = null;
        obj.error = null;
        obj.timestamp = 0;
        obj.executionTime = 0;
        obj.metadata = {};
        return obj;
      },
      maxSize: 100
    });
    
    // Pool para lotes
    this.createPool(this.config.objectTypes.BATCH, {
      factory: () => ({
        id: null,
        operations: [],
        status: 'pending',
        createdAt: 0,
        completedAt: 0,
        results: [],
        metadata: {}
      }),
      reset: (obj) => {
        obj.id = null;
        obj.operations.length = 0;
        obj.status = 'pending';
        obj.createdAt = 0;
        obj.completedAt = 0;
        obj.results.length = 0;
        obj.metadata = {};
        return obj;
      },
      maxSize: 50
    });
    
    // Pool para métricas
    this.createPool(this.config.objectTypes.METRICS, {
      factory: () => ({
        name: null,
        value: 0,
        timestamp: 0,
        tags: new Map(),
        type: 'counter'
      }),
      reset: (obj) => {
        obj.name = null;
        obj.value = 0;
        obj.timestamp = 0;
        obj.tags.clear();
        obj.type = 'counter';
        return obj;
      },
      maxSize: 200
    });
    
    // Pool para ArrayBuffers
    this.createPool(this.config.objectTypes.ARRAY_BUFFER, {
      factory: () => new ArrayBuffer(1024), // 1KB por defecto
      reset: (buffer) => {
        // Los ArrayBuffers no necesitan reset, solo reutilización
        return buffer;
      },
      maxSize: 20,
      sizeVariants: {
        small: () => new ArrayBuffer(256),   // 256B
        medium: () => new ArrayBuffer(1024), // 1KB
        large: () => new ArrayBuffer(4096)   // 4KB
      }
    });
    
    // Pool para StringBuilder (arrays para concatenación eficiente)
    this.createPool(this.config.objectTypes.STRING_BUILDER, {
      factory: () => [],
      reset: (arr) => {
        arr.length = 0;
        return arr;
      },
      maxSize: 50
    });
  }

  /**
   * Crear un nuevo pool
   */
  createPool(name, options = {}) {
    if (this.pools.has(name)) {
      logger.warn('MEMORY_POOL', `Pool already exists: ${name}`);
      return false;
    }
    
    const pool = {
      name,
      objects: [],
      factory: options.factory || (() => ({})),
      reset: options.reset || ((obj) => obj),
      maxSize: options.maxSize || this.config.pools.maxSize,
      initialSize: options.initialSize || this.config.pools.initialSize,
      sizeVariants: options.sizeVariants || {},
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
    
    // Crear objetos iniciales
    for (let i = 0; i < pool.initialSize; i++) {
      pool.objects.push(pool.factory());
    }
    
    this.pools.set(name, pool);
    
    // Inicializar estadísticas
    this.poolStats.set(name, {
      allocations: 0,
      deallocations: 0,
      hits: 0,
      misses: 0,
      currentSize: pool.initialSize,
      maxSizeReached: pool.initialSize,
      totalCreated: pool.initialSize,
      memoryUsage: this.estimatePoolMemoryUsage(pool)
    });
    
    logger.debug('MEMORY_POOL', `Pool created: ${name}`, {
      initialSize: pool.initialSize,
      maxSize: pool.maxSize
    });
    
    return true;
  }

  /**
   * Obtener objeto del pool
   */
  acquire(poolName, variant = null) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      throw new Error(`Pool not found: ${poolName}`);
    }
    
    const stats = this.poolStats.get(poolName);
    pool.lastUsed = Date.now();
    
    // Intentar obtener objeto del pool
    let obj = pool.objects.pop();
    
    if (obj) {
      // Hit del pool
      stats.hits++;
      stats.allocations++;
      
      // Reset del objeto
      obj = pool.reset(obj);
      
      logger.debug('MEMORY_POOL', `Object acquired from pool: ${poolName}`, {
        poolSize: pool.objects.length,
        hits: stats.hits
      });
      
    } else {
      // Miss del pool - crear nuevo objeto
      stats.misses++;
      stats.allocations++;
      stats.totalCreated++;
      
      // Usar variante si se especifica
      if (variant && pool.sizeVariants[variant]) {
        obj = pool.sizeVariants[variant]();
      } else {
        obj = pool.factory();
      }
      
      logger.debug('MEMORY_POOL', `New object created for pool: ${poolName}`, {
        variant,
        misses: stats.misses
      });
    }
    
    // Actualizar estadísticas
    stats.currentSize = pool.objects.length;
    stats.memoryUsage = this.estimatePoolMemoryUsage(pool);
    
    return obj;
  }

  /**
   * Devolver objeto al pool
   */
  release(poolName, obj) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      logger.warn('MEMORY_POOL', `Cannot release to unknown pool: ${poolName}`);
      return false;
    }
    
    const stats = this.poolStats.get(poolName);
    
    // Verificar si el pool tiene espacio
    if (pool.objects.length >= pool.maxSize) {
      // Pool lleno, descartar objeto
      logger.debug('MEMORY_POOL', `Pool full, discarding object: ${poolName}`);
      return false;
    }
    
    // Resetear y devolver al pool
    try {
      const resetObj = pool.reset(obj);
      pool.objects.push(resetObj);
      
      stats.deallocations++;
      stats.currentSize = pool.objects.length;
      stats.maxSizeReached = Math.max(stats.maxSizeReached, stats.currentSize);
      stats.memoryUsage = this.estimatePoolMemoryUsage(pool);
      
      logger.debug('MEMORY_POOL', `Object released to pool: ${poolName}`, {
        poolSize: pool.objects.length
      });
      
      return true;
      
    } catch (error) {
      logger.error('MEMORY_POOL', `Failed to reset object for pool: ${poolName}`, error);
      return false;
    }
  }

  /**
   * Usar objeto con auto-release
   */
  async withPooledObject(poolName, callback, variant = null) {
    const obj = this.acquire(poolName, variant);
    
    try {
      const result = await callback(obj);
      return result;
    } finally {
      this.release(poolName, obj);
    }
  }

  /**
   * Crear múltiples objetos
   */
  acquireMultiple(poolName, count, variant = null) {
    const objects = [];
    
    for (let i = 0; i < count; i++) {
      objects.push(this.acquire(poolName, variant));
    }
    
    return objects;
  }

  /**
   * Devolver múltiples objetos
   */
  releaseMultiple(poolName, objects) {
    let successCount = 0;
    
    for (const obj of objects) {
      if (this.release(poolName, obj)) {
        successCount++;
      }
    }
    
    return successCount;
  }

  /**
   * Redimensionar pool
   */
  resizePool(poolName, newSize) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      return false;
    }
    
    const currentSize = pool.objects.length;
    
    if (newSize > currentSize) {
      // Expandir pool
      const objectsToAdd = newSize - currentSize;
      for (let i = 0; i < objectsToAdd; i++) {
        pool.objects.push(pool.factory());
      }
      
      logger.debug('MEMORY_POOL', `Pool expanded: ${poolName}`, {
        oldSize: currentSize,
        newSize: pool.objects.length
      });
      
    } else if (newSize < currentSize) {
      // Reducir pool
      const objectsToRemove = currentSize - newSize;
      pool.objects.splice(0, objectsToRemove);
      
      logger.debug('MEMORY_POOL', `Pool shrunk: ${poolName}`, {
        oldSize: currentSize,
        newSize: pool.objects.length
      });
    }
    
    // Actualizar estadísticas
    const stats = this.poolStats.get(poolName);
    stats.currentSize = pool.objects.length;
    stats.memoryUsage = this.estimatePoolMemoryUsage(pool);
    
    return true;
  }

  /**
   * Limpiar pool
   */
  clearPool(poolName) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      return false;
    }
    
    const clearedCount = pool.objects.length;
    pool.objects.length = 0;
    
    // Actualizar estadísticas
    const stats = this.poolStats.get(poolName);
    stats.currentSize = 0;
    stats.memoryUsage = 0;
    
    logger.info('MEMORY_POOL', `Pool cleared: ${poolName}`, {
      clearedObjects: clearedCount
    });
    
    return true;
  }

  /**
   * Eliminar pool
   */
  destroyPool(poolName) {
    if (!this.pools.has(poolName)) {
      return false;
    }
    
    this.clearPool(poolName);
    this.pools.delete(poolName);
    this.poolStats.delete(poolName);
    
    logger.info('MEMORY_POOL', `Pool destroyed: ${poolName}`);
    return true;
  }

  /**
   * Inicializar manejo de presión de memoria
   */
  initializeMemoryPressureHandling() {
    memoryPressureDetector.onPressureLevel('warning', () => {
      this.handleMemoryPressure('warning');
    });
    
    memoryPressureDetector.onPressureLevel('critical', () => {
      this.handleMemoryPressure('critical');
    });
  }

  /**
   * Manejar presión de memoria
   */
  handleMemoryPressure(level) {
    logger.info('MEMORY_POOL', `Handling ${level} memory pressure`);
    
    if (level === 'critical') {
      // Limpieza agresiva
      this.performAggressiveCleanup();
    } else if (level === 'warning') {
      // Limpieza moderada
      this.performModerateCleanup();
    }
  }

  /**
   * Limpieza agresiva
   */
  performAggressiveCleanup() {
    let totalCleaned = 0;
    
    for (const [poolName, pool] of this.pools.entries()) {
      const currentSize = pool.objects.length;
      const targetSize = Math.floor(currentSize * 0.3); // Mantener solo 30%
      
      if (currentSize > targetSize) {
        const toRemove = currentSize - targetSize;
        pool.objects.splice(0, toRemove);
        totalCleaned += toRemove;
        
        // Actualizar estadísticas
        const stats = this.poolStats.get(poolName);
        stats.currentSize = pool.objects.length;
        stats.memoryUsage = this.estimatePoolMemoryUsage(pool);
      }
    }
    
    logger.info('MEMORY_POOL', `Aggressive cleanup completed`, {
      objectsCleaned: totalCleaned
    });
  }

  /**
   * Limpieza moderada
   */
  performModerateCleanup() {
    let totalCleaned = 0;
    
    for (const [poolName, pool] of this.pools.entries()) {
      const currentSize = pool.objects.length;
      const targetSize = Math.floor(currentSize * 0.6); // Mantener 60%
      
      if (currentSize > targetSize) {
        const toRemove = currentSize - targetSize;
        pool.objects.splice(0, toRemove);
        totalCleaned += toRemove;
        
        // Actualizar estadísticas
        const stats = this.poolStats.get(poolName);
        stats.currentSize = pool.objects.length;
        stats.memoryUsage = this.estimatePoolMemoryUsage(pool);
      }
    }
    
    logger.info('MEMORY_POOL', `Moderate cleanup completed`, {
      objectsCleaned: totalCleaned
    });
  }

  /**
   * Iniciar limpieza periódica
   */
  startPeriodicCleanup() {
    if (!this.config.cleanup.enabled) return;
    
    setInterval(() => {
      this.performPeriodicMaintenance();
    }, this.config.cleanup.interval);
  }

  /**
   * Mantenimiento periódico
   */
  performPeriodicMaintenance() {
    const now = Date.now();
    
    for (const [poolName, pool] of this.pools.entries()) {
      const timeSinceLastUse = now - pool.lastUsed;
      
      // Reducir pools inactivos
      if (timeSinceLastUse > this.config.pools.maxIdleTime) {
        const currentSize = pool.objects.length;
        const targetSize = Math.max(pool.initialSize, Math.floor(currentSize * 0.5));
        
        if (currentSize > targetSize) {
          this.resizePool(poolName, targetSize);
        }
      }
      
      // Optimizar pools basado en uso
      this.optimizePoolSize(poolName);
    }
  }

  /**
   * Optimizar tamaño del pool
   */
  optimizePoolSize(poolName) {
    const pool = this.pools.get(poolName);
    const stats = this.poolStats.get(poolName);
    
    if (!pool || !stats) return;
    
    const hitRate = stats.hits / (stats.hits + stats.misses);
    const currentSize = pool.objects.length;
    
    // Si la tasa de hit es baja, aumentar el pool
    if (hitRate < 0.7 && currentSize < pool.maxSize) {
      const newSize = Math.min(pool.maxSize, Math.floor(currentSize * this.config.pools.growthFactor));
      this.resizePool(poolName, newSize);
      
    // Si la tasa de hit es muy alta y el pool está subutilizado, reducir
    } else if (hitRate > 0.95 && currentSize > pool.initialSize) {
      const utilizationRate = (stats.allocations - stats.deallocations) / currentSize;
      if (utilizationRate < this.config.pools.shrinkThreshold) {
        const newSize = Math.max(pool.initialSize, Math.floor(currentSize * 0.8));
        this.resizePool(poolName, newSize);
      }
    }
  }

  /**
   * Estimar uso de memoria del pool
   */
  estimatePoolMemoryUsage(pool) {
    // Estimación básica - puede ser refinada según el tipo de objeto
    const avgObjectSize = 100; // bytes por objeto (estimación)
    return pool.objects.length * avgObjectSize;
  }

  /**
   * Obtener estadísticas de todos los pools
   */
  getStats() {
    const poolStats = {};
    let totalMemoryUsage = 0;
    let totalObjects = 0;
    let totalAllocations = 0;
    let totalHits = 0;
    let totalMisses = 0;
    
    for (const [poolName, stats] of this.poolStats.entries()) {
      poolStats[poolName] = { ...stats };
      totalMemoryUsage += stats.memoryUsage;
      totalObjects += stats.currentSize;
      totalAllocations += stats.allocations;
      totalHits += stats.hits;
      totalMisses += stats.misses;
    }
    
    return {
      pools: poolStats,
      summary: {
        totalPools: this.pools.size,
        totalObjects,
        totalMemoryUsage,
        totalAllocations,
        overallHitRate: totalHits / (totalHits + totalMisses) || 0,
        memoryPressure: memoryPressureDetector.getCurrentState().pressureLevel
      }
    };
  }

  /**
   * Obtener estadísticas de un pool específico
   */
  getPoolStats(poolName) {
    const pool = this.pools.get(poolName);
    const stats = this.poolStats.get(poolName);
    
    if (!pool || !stats) {
      return null;
    }
    
    return {
      ...stats,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0,
      utilizationRate: (stats.allocations - stats.deallocations) / stats.currentSize || 0,
      efficiency: stats.hits / stats.totalCreated || 0
    };
  }

  /**
   * Configurar el sistema
   */
  configure(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      pools: { ...this.config.pools, ...newConfig.pools },
      cleanup: { ...this.config.cleanup, ...newConfig.cleanup },
      monitoring: { ...this.config.monitoring, ...newConfig.monitoring }
    };
  }

  /**
   * Resetear todas las estadísticas
   */
  resetStats() {
    for (const stats of this.poolStats.values()) {
      stats.allocations = 0;
      stats.deallocations = 0;
      stats.hits = 0;
      stats.misses = 0;
      stats.totalCreated = stats.currentSize;
    }
  }

  /**
   * Destruir el sistema completo
   */
  destroy() {
    // Limpiar todos los pools
    for (const poolName of this.pools.keys()) {
      this.destroyPool(poolName);
    }
    
    logger.info('MEMORY_POOL', 'Memory pool system destroyed');
  }
}

// Instancia singleton
export const memoryPoolManager = new MemoryPoolManager();
export default memoryPoolManager;