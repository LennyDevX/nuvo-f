/**
 * Gestor de Lazy Loading para Caches
 * Carga caches especializados solo cuando son necesarios
 */

import { logger } from '../debug/logger.js';
import { memoryPressureDetector } from './MemoryPressureDetector.js';

class LazyLoadingManager {
  constructor() {
    this.loadedCaches = new Map(); // cacheName -> cacheInstance
    this.cacheDefinitions = new Map(); // cacheName -> definition
    this.loadingPromises = new Map(); // cacheName -> Promise
    this.accessPatterns = new Map(); // cacheName -> accessInfo
    this.config = {
      // Estrategias de carga
      loadingStrategies: {
        immediate: 'immediate', // Cargar inmediatamente
        onDemand: 'on_demand', // Cargar cuando se necesite
        preload: 'preload', // Precargar basado en patrones
        conditional: 'conditional' // Cargar basado en condiciones
      },
      // Configuración de precarga
      preloading: {
        enabled: true,
        threshold: 3, // Número de accesos para considerar precarga
        timeWindow: 30 * 60 * 1000, // 30 minutos
        maxConcurrent: 2 // Máximo número de precargas concurrentes
      },
      // Configuración de descarga
      unloading: {
        enabled: true,
        inactivityThreshold: 60 * 60 * 1000, // 1 hora sin uso
        memoryPressureUnload: true,
        maxIdleCaches: 5
      },
      // Prioridades de carga
      priorities: {
        high: ['user_nfts', 'marketplace'],
        medium: ['metadata', 'collections'],
        low: ['analytics', 'logs']
      }
    };
    
    this.initializeBuiltInCaches();
    this.initializeMemoryPressureHandling();
    this.startPeriodicOptimization();
  }

  /**
   * Inicializar caches integrados
   */
  initializeBuiltInCaches() {
    // Definir caches especializados
    this.defineLazyCache('marketplace', {
      factory: () => import('./MarketplaceCache').then(m => new m.default()),
      strategy: 'on_demand',
      priority: 'high',
      dependencies: [],
      estimatedSize: 2 * 1024 * 1024, // 2MB
      description: 'Cache para datos del marketplace'
    });
    
    this.defineLazyCache('nft_collections', {
      factory: () => import('./NFTCollectionCache').then(m => new m.default()),
      strategy: 'on_demand',
      priority: 'high',
      dependencies: [],
      estimatedSize: 1.5 * 1024 * 1024, // 1.5MB
      description: 'Cache para colecciones NFT'
    });
    
    this.defineLazyCache('user_analytics', {
      factory: () => this.createAnalyticsCache(),
      strategy: 'conditional',
      priority: 'low',
      dependencies: ['marketplace'],
      estimatedSize: 512 * 1024, // 512KB
      condition: () => this.shouldLoadAnalytics(),
      description: 'Cache para analytics de usuario'
    });
    
    this.defineLazyCache('token_metadata', {
      factory: () => this.createMetadataCache(),
      strategy: 'preload',
      priority: 'medium',
      dependencies: [],
      estimatedSize: 3 * 1024 * 1024, // 3MB
      description: 'Cache para metadata de tokens'
    });
    
    this.defineLazyCache('price_history', {
      factory: () => this.createPriceHistoryCache(),
      strategy: 'conditional',
      priority: 'medium',
      dependencies: ['marketplace'],
      estimatedSize: 1 * 1024 * 1024, // 1MB
      condition: () => this.shouldLoadPriceHistory(),
      description: 'Cache para historial de precios'
    });
  }

  /**
   * Definir un cache lazy
   */
  defineLazyCache(name, definition) {
    const cacheDefinition = {
      name,
      factory: definition.factory,
      strategy: definition.strategy || 'on_demand',
      priority: definition.priority || 'medium',
      dependencies: definition.dependencies || [],
      estimatedSize: definition.estimatedSize || 1024 * 1024,
      condition: definition.condition || (() => true),
      description: definition.description || `Cache ${name}`,
      createdAt: Date.now(),
      loadCount: 0,
      lastLoaded: null,
      lastUnloaded: null
    };
    
    this.cacheDefinitions.set(name, cacheDefinition);
    
    // Inicializar patrón de acceso
    this.accessPatterns.set(name, {
      accessCount: 0,
      lastAccess: null,
      accessHistory: [],
      loadingTime: 0,
      avgLoadingTime: 0
    });
    
    logger.debug('LAZY_LOADING', `Cache definition registered: ${name}`, {
      strategy: cacheDefinition.strategy,
      priority: cacheDefinition.priority,
      estimatedSize: cacheDefinition.estimatedSize
    });
  }

  /**
   * Obtener cache (carga lazy)
   */
  async getCache(name) {
    // Registrar acceso
    this.recordAccess(name);
    
    // Si ya está cargado, devolverlo
    if (this.loadedCaches.has(name)) {
      return this.loadedCaches.get(name);
    }
    
    // Si ya se está cargando, esperar
    if (this.loadingPromises.has(name)) {
      return await this.loadingPromises.get(name);
    }
    
    // Cargar el cache
    return await this.loadCache(name);
  }

  /**
   * Cargar cache
   */
  async loadCache(name) {
    const definition = this.cacheDefinitions.get(name);
    if (!definition) {
      throw new Error(`Cache definition not found: ${name}`);
    }
    
    // Verificar condiciones
    if (definition.strategy === 'conditional' && !definition.condition()) {
      logger.debug('LAZY_LOADING', `Cache loading skipped due to condition: ${name}`);
      return null;
    }
    
    // Verificar presión de memoria
    const memoryState = memoryPressureDetector.getCurrentState();
    if (memoryState.pressureLevel === 'critical' && definition.priority === 'low') {
      logger.warn('LAZY_LOADING', `Cache loading deferred due to memory pressure: ${name}`);
      return null;
    }
    
    const startTime = Date.now();
    
    try {
      logger.info('LAZY_LOADING', `Loading cache: ${name}`, {
        strategy: definition.strategy,
        priority: definition.priority,
        estimatedSize: definition.estimatedSize
      });
      
      // Crear promesa de carga
      const loadingPromise = this.performLoad(name, definition);
      this.loadingPromises.set(name, loadingPromise);
      
      // Esperar carga
      const cacheInstance = await loadingPromise;
      
      // Registrar cache cargado
      this.loadedCaches.set(name, cacheInstance);
      this.loadingPromises.delete(name);
      
      // Actualizar estadísticas
      const loadingTime = Date.now() - startTime;
      this.updateLoadingStats(name, loadingTime);
      
      definition.loadCount++;
      definition.lastLoaded = Date.now();
      
      logger.info('LAZY_LOADING', `Cache loaded successfully: ${name}`, {
        loadingTime,
        loadCount: definition.loadCount
      });
      
      return cacheInstance;
      
    } catch (error) {
      this.loadingPromises.delete(name);
      logger.error('LAZY_LOADING', `Failed to load cache: ${name}`, error);
      throw error;
    }
  }

  /**
   * Realizar carga del cache
   */
  async performLoad(name, definition) {
    // Cargar dependencias primero
    await this.loadDependencies(definition.dependencies);
    
    // Crear instancia del cache
    const cacheInstance = await definition.factory();
    
    // Configurar el cache si es necesario
    if (cacheInstance && typeof cacheInstance.configure === 'function') {
      cacheInstance.configure({
        lazyLoaded: true,
        loadedAt: Date.now(),
        priority: definition.priority
      });
    }
    
    return cacheInstance;
  }

  /**
   * Cargar dependencias
   */
  async loadDependencies(dependencies) {
    const loadPromises = dependencies.map(dep => this.getCache(dep));
    await Promise.all(loadPromises);
  }

  /**
   * Descargar cache
   */
  async unloadCache(name, reason = 'manual') {
    const cacheInstance = this.loadedCaches.get(name);
    if (!cacheInstance) {
      return false;
    }
    
    try {
      logger.info('LAZY_LOADING', `Unloading cache: ${name}`, { reason });
      
      // Limpiar cache si tiene método cleanup
      if (typeof cacheInstance.cleanup === 'function') {
        await cacheInstance.cleanup();
      }
      
      // Remover de caches cargados
      this.loadedCaches.delete(name);
      
      // Actualizar definición
      const definition = this.cacheDefinitions.get(name);
      if (definition) {
        definition.lastUnloaded = Date.now();
      }
      
      logger.info('LAZY_LOADING', `Cache unloaded: ${name}`);
      return true;
      
    } catch (error) {
      logger.error('LAZY_LOADING', `Failed to unload cache: ${name}`, error);
      return false;
    }
  }

  /**
   * Registrar acceso
   */
  recordAccess(name) {
    const pattern = this.accessPatterns.get(name);
    if (!pattern) return;
    
    const now = Date.now();
    pattern.accessCount++;
    pattern.lastAccess = now;
    pattern.accessHistory.push(now);
    
    // Mantener solo los últimos 50 accesos
    if (pattern.accessHistory.length > 50) {
      pattern.accessHistory.shift();
    }
  }

  /**
   * Actualizar estadísticas de carga
   */
  updateLoadingStats(name, loadingTime) {
    const pattern = this.accessPatterns.get(name);
    if (!pattern) return;
    
    pattern.loadingTime = loadingTime;
    
    // Calcular tiempo promedio de carga
    const definition = this.cacheDefinitions.get(name);
    if (definition) {
      const totalTime = (pattern.avgLoadingTime * (definition.loadCount - 1)) + loadingTime;
      pattern.avgLoadingTime = totalTime / definition.loadCount;
    }
  }

  /**
   * Precargar caches basado en patrones
   */
  async preloadCaches() {
    if (!this.config.preloading.enabled) return;
    
    const candidates = this.getPreloadCandidates();
    const maxConcurrent = this.config.preloading.maxConcurrent;
    
    // Cargar en lotes
    for (let i = 0; i < candidates.length; i += maxConcurrent) {
      const batch = candidates.slice(i, i + maxConcurrent);
      const loadPromises = batch.map(name => {
        logger.debug('LAZY_LOADING', `Preloading cache: ${name}`);
        return this.loadCache(name).catch(error => {
          logger.warn('LAZY_LOADING', `Preload failed for ${name}:`, error);
        });
      });
      
      await Promise.all(loadPromises);
    }
  }

  /**
   * Obtener candidatos para precarga
   */
  getPreloadCandidates() {
    const candidates = [];
    const now = Date.now();
    const timeWindow = this.config.preloading.timeWindow;
    
    for (const [name, definition] of this.cacheDefinitions.entries()) {
      // Solo precargar si la estrategia lo permite
      if (definition.strategy !== 'preload') continue;
      
      // No precargar si ya está cargado
      if (this.loadedCaches.has(name)) continue;
      
      const pattern = this.accessPatterns.get(name);
      if (!pattern) continue;
      
      // Verificar si hay suficientes accesos recientes
      const recentAccesses = pattern.accessHistory.filter(
        time => now - time < timeWindow
      ).length;
      
      if (recentAccesses >= this.config.preloading.threshold) {
        candidates.push(name);
      }
    }
    
    // Ordenar por prioridad
    return candidates.sort((a, b) => {
      const priorityA = this.getPriorityWeight(this.cacheDefinitions.get(a).priority);
      const priorityB = this.getPriorityWeight(this.cacheDefinitions.get(b).priority);
      return priorityB - priorityA;
    });
  }

  /**
   * Obtener peso de prioridad
   */
  getPriorityWeight(priority) {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[priority] || 1;
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
  async handleMemoryPressure(level) {
    if (!this.config.unloading.memoryPressureUnload) return;
    
    const unloadCandidates = this.getUnloadCandidates(level);
    
    logger.info('LAZY_LOADING', `Unloading caches due to ${level} memory pressure`, {
      candidates: unloadCandidates.length
    });
    
    for (const name of unloadCandidates) {
      await this.unloadCache(name, `memory_pressure_${level}`);
    }
  }

  /**
   * Obtener candidatos para descarga
   */
  getUnloadCandidates(pressureLevel = 'normal') {
    const candidates = [];
    const now = Date.now();
    
    for (const [name, cacheInstance] of this.loadedCaches.entries()) {
      const definition = this.cacheDefinitions.get(name);
      const pattern = this.accessPatterns.get(name);
      
      if (!definition || !pattern) continue;
      
      // Criterios de descarga
      const timeSinceLastAccess = pattern.lastAccess ? now - pattern.lastAccess : Infinity;
      const isLowPriority = definition.priority === 'low';
      const isInactive = timeSinceLastAccess > this.config.unloading.inactivityThreshold;
      
      // Descargar basado en presión de memoria
      if (pressureLevel === 'critical') {
        if (isLowPriority || isInactive) {
          candidates.push(name);
        }
      } else if (pressureLevel === 'warning') {
        if (isLowPriority && isInactive) {
          candidates.push(name);
        }
      } else {
        // Descarga normal por inactividad
        if (isInactive) {
          candidates.push(name);
        }
      }
    }
    
    // Ordenar por prioridad (descargar primero los de menor prioridad)
    return candidates.sort((a, b) => {
      const priorityA = this.getPriorityWeight(this.cacheDefinitions.get(a).priority);
      const priorityB = this.getPriorityWeight(this.cacheDefinitions.get(b).priority);
      return priorityA - priorityB;
    });
  }

  /**
   * Iniciar optimización periódica
   */
  startPeriodicOptimization() {
    // Verificar precarga cada 5 minutos
    setInterval(() => {
      this.preloadCaches();
    }, 5 * 60 * 1000);
    
    // Verificar descarga cada 10 minutos
    setInterval(() => {
      this.performMaintenanceUnload();
    }, 10 * 60 * 1000);
  }

  /**
   * Realizar descarga de mantenimiento
   */
  async performMaintenanceUnload() {
    if (!this.config.unloading.enabled) return;
    
    const loadedCount = this.loadedCaches.size;
    if (loadedCount <= this.config.unloading.maxIdleCaches) return;
    
    const candidates = this.getUnloadCandidates();
    const toUnload = candidates.slice(0, loadedCount - this.config.unloading.maxIdleCaches);
    
    for (const name of toUnload) {
      await this.unloadCache(name, 'maintenance');
    }
  }

  /**
   * Crear cache de analytics
   */
  createAnalyticsCache() {
    return {
      data: new Map(),
      configure: (config) => {
        this.config = { ...this.config, ...config };
      },
      cleanup: async () => {
        this.data.clear();
      }
    };
  }

  /**
   * Crear cache de metadata
   */
  createMetadataCache() {
    return {
      data: new Map(),
      configure: (config) => {
        this.config = { ...this.config, ...config };
      },
      cleanup: async () => {
        this.data.clear();
      }
    };
  }

  /**
   * Crear cache de historial de precios
   */
  createPriceHistoryCache() {
    return {
      data: new Map(),
      configure: (config) => {
        this.config = { ...this.config, ...config };
      },
      cleanup: async () => {
        this.data.clear();
      }
    };
  }

  /**
   * Verificar si debe cargar analytics
   */
  shouldLoadAnalytics() {
    // Cargar analytics solo si el marketplace está activo
    return this.loadedCaches.has('marketplace');
  }

  /**
   * Verificar si debe cargar historial de precios
   */
  shouldLoadPriceHistory() {
    // Cargar historial solo si hay actividad reciente en marketplace
    const marketplacePattern = this.accessPatterns.get('marketplace');
    if (!marketplacePattern) return false;
    
    const now = Date.now();
    const recentAccesses = marketplacePattern.accessHistory.filter(
      time => now - time < 30 * 60 * 1000 // 30 minutos
    ).length;
    
    return recentAccesses > 5;
  }

  /**
   * Obtener estadísticas del sistema
   */
  getStats() {
    const loadedCaches = Array.from(this.loadedCaches.keys());
    const totalDefinitions = this.cacheDefinitions.size;
    const loadedCount = loadedCaches.length;
    
    return {
      overview: {
        totalDefinitions,
        loadedCount,
        loadingRatio: loadedCount / totalDefinitions,
        loadedCaches
      },
      definitions: Array.from(this.cacheDefinitions.entries()).map(([name, def]) => ({
        name,
        strategy: def.strategy,
        priority: def.priority,
        loadCount: def.loadCount,
        lastLoaded: def.lastLoaded,
        estimatedSize: def.estimatedSize,
        isLoaded: this.loadedCaches.has(name)
      })),
      accessPatterns: Array.from(this.accessPatterns.entries()).map(([name, pattern]) => ({
        name,
        accessCount: pattern.accessCount,
        lastAccess: pattern.lastAccess,
        avgLoadingTime: pattern.avgLoadingTime
      })),
      memoryUsage: {
        estimatedTotal: Array.from(this.cacheDefinitions.values())
          .filter(def => this.loadedCaches.has(def.name))
          .reduce((sum, def) => sum + def.estimatedSize, 0)
      }
    };
  }

  /**
   * Configurar el sistema
   */
  configure(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      preloading: { ...this.config.preloading, ...newConfig.preloading },
      unloading: { ...this.config.unloading, ...newConfig.unloading },
      priorities: { ...this.config.priorities, ...newConfig.priorities }
    };
  }

  /**
   * Resetear el sistema
   */
  async reset() {
    // Descargar todos los caches
    const loadedNames = Array.from(this.loadedCaches.keys());
    for (const name of loadedNames) {
      await this.unloadCache(name, 'reset');
    }
    
    // Limpiar patrones de acceso
    for (const pattern of this.accessPatterns.values()) {
      pattern.accessCount = 0;
      pattern.lastAccess = null;
      pattern.accessHistory = [];
      pattern.loadingTime = 0;
      pattern.avgLoadingTime = 0;
    }
  }
}

// Instancia singleton
export const lazyLoadingManager = new LazyLoadingManager();
export default lazyLoadingManager;