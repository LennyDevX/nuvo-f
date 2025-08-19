/**
 * Gestor de Smart Eviction
 * Algoritmo inteligente de desalojo que considera frecuencia, tamaño, recencia y valor
 */

import { logger } from '../debug/logger.js';
import { memoryPressureDetector } from './MemoryPressureDetector.js';
import { adaptiveTTLManager } from './AdaptiveTTLManager.js';

class SmartEvictionManager {
  constructor() {
    this.entryMetrics = new Map(); // key -> metrics
    this.evictionHistory = [];
    this.config = {
      // Pesos para el algoritmo de scoring
      weights: {
        frequency: 0.3,
        recency: 0.25,
        size: 0.2,
        ttl: 0.15,
        value: 0.1
      },
      // Configuración de algoritmos
      algorithms: {
        default: 'weighted_score', // weighted_score, lru, lfu, size_based
        memoryPressure: 'size_first',
        highFrequency: 'lru_enhanced'
      },
      // Umbrales
      thresholds: {
        minScore: 0.1, // Score mínimo para mantener en cache
        maxEvictionBatch: 10, // Máximo número de elementos a desalojar por vez
        scoreDecayRate: 0.95, // Tasa de decaimiento del score
        sizeThreshold: 1024 * 1024 // 1MB - umbral de tamaño grande
      },
      // Configuración de métricas
      metrics: {
        trackingWindow: 24 * 60 * 60 * 1000, // 24 horas
        maxHistorySize: 1000
      }
    };
    
    this.initializeMemoryPressureHandling();
    this.startPeriodicOptimization();
  }

  /**
   * Inicializar manejo de presión de memoria
   */
  initializeMemoryPressureHandling() {
    memoryPressureDetector.onPressureLevel('warning', () => {
      this.performEmergencyEviction('warning');
    });
    
    memoryPressureDetector.onPressureLevel('critical', () => {
      this.performEmergencyEviction('critical');
    });
  }

  /**
   * Registrar entrada en el cache
   */
  registerEntry(key, data, ttl, cacheType = 'default') {
    const now = Date.now();
    const size = this.estimateSize(data);
    
    const metrics = {
      key,
      cacheType,
      size,
      ttl,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      accessHistory: [now],
      score: 1.0,
      value: this.calculateInitialValue(data, size, cacheType),
      evictionAttempts: 0
    };
    
    this.entryMetrics.set(key, metrics);
    this.updateScore(key);
    
    logger.debug('SMART_EVICTION', `Entry registered: ${key}`, {
      size,
      initialScore: metrics.score,
      value: metrics.value
    });
  }

  /**
   * Registrar acceso a una entrada
   */
  recordAccess(key) {
    const metrics = this.entryMetrics.get(key);
    if (!metrics) return;
    
    const now = Date.now();
    metrics.lastAccessed = now;
    metrics.accessCount++;
    metrics.accessHistory.push(now);
    
    // Mantener solo los últimos 50 accesos
    if (metrics.accessHistory.length > 50) {
      metrics.accessHistory.shift();
    }
    
    // Actualizar score
    this.updateScore(key);
    
    // Registrar en el TTL adaptativo
    adaptiveTTLManager.recordAccess(key, metrics.cacheType);
  }

  /**
   * Actualizar score de una entrada
   */
  updateScore(key) {
    const metrics = this.entryMetrics.get(key);
    if (!metrics) return;
    
    const now = Date.now();
    const age = now - metrics.createdAt;
    const timeSinceLastAccess = now - metrics.lastAccessed;
    
    // Calcular componentes del score
    const frequencyScore = this.calculateFrequencyScore(metrics);
    const recencyScore = this.calculateRecencyScore(timeSinceLastAccess);
    const sizeScore = this.calculateSizeScore(metrics.size);
    const ttlScore = this.calculateTTLScore(metrics, now);
    const valueScore = this.calculateValueScore(metrics);
    
    // Score ponderado
    const score = (
      frequencyScore * this.config.weights.frequency +
      recencyScore * this.config.weights.recency +
      sizeScore * this.config.weights.size +
      ttlScore * this.config.weights.ttl +
      valueScore * this.config.weights.value
    );
    
    metrics.score = Math.max(0, Math.min(1, score));
    
    logger.debug('SMART_EVICTION', `Score updated for ${key}`, {
      score: metrics.score,
      components: {
        frequency: frequencyScore,
        recency: recencyScore,
        size: sizeScore,
        ttl: ttlScore,
        value: valueScore
      }
    });
  }

  /**
   * Calcular score de frecuencia
   */
  calculateFrequencyScore(metrics) {
    const now = Date.now();
    const windowStart = now - this.config.metrics.trackingWindow;
    
    // Filtrar accesos en la ventana de tiempo
    const recentAccesses = metrics.accessHistory.filter(time => time >= windowStart);
    const accessesPerHour = recentAccesses.length / (this.config.metrics.trackingWindow / (1000 * 60 * 60));
    
    // Normalizar (logarítmico para evitar dominancia de valores muy altos)
    return Math.min(1, Math.log10(accessesPerHour + 1) / 2);
  }

  /**
   * Calcular score de recencia
   */
  calculateRecencyScore(timeSinceLastAccess) {
    const maxAge = 2 * 60 * 60 * 1000; // 2 horas
    return Math.max(0, 1 - (timeSinceLastAccess / maxAge));
  }

  /**
   * Calcular score de tamaño (inverso - tamaños más pequeños tienen mejor score)
   */
  calculateSizeScore(size) {
    const maxSize = this.config.thresholds.sizeThreshold;
    return Math.max(0.1, 1 - (size / maxSize));
  }

  /**
   * Calcular score de TTL
   */
  calculateTTLScore(metrics, now) {
    const timeToExpiry = (metrics.createdAt + metrics.ttl) - now;
    const remainingRatio = timeToExpiry / metrics.ttl;
    
    // Score más alto para elementos que aún tienen mucho tiempo de vida
    return Math.max(0, remainingRatio);
  }

  /**
   * Calcular score de valor
   */
  calculateValueScore(metrics) {
    // El valor se mantiene constante pero puede ser ajustado por tipo de cache
    let baseValue = metrics.value;
    
    // Ajustar por tipo de cache
    const typeMultipliers = {
      'user_nfts': 1.2,
      'marketplace': 1.1,
      'metadata': 0.9,
      'default': 1.0
    };
    
    return baseValue * (typeMultipliers[metrics.cacheType] || 1.0);
  }

  /**
   * Calcular valor inicial de los datos
   */
  calculateInitialValue(data, size, cacheType) {
    let value = 0.5; // Valor base
    
    // Ajustar por tipo de datos
    if (cacheType === 'user_nfts') {
      value = 0.8; // NFTs del usuario son muy valiosos
    } else if (cacheType === 'marketplace') {
      value = 0.7; // Datos del marketplace son importantes
    } else if (cacheType === 'metadata') {
      value = 0.6; // Metadata es moderadamente valioso
    }
    
    // Ajustar por complejidad de los datos
    if (data && typeof data === 'object') {
      const complexity = Object.keys(data).length;
      value += Math.min(0.2, complexity / 100);
    }
    
    return Math.min(1, value);
  }

  /**
   * Seleccionar candidatos para desalojo
   */
  selectEvictionCandidates(count, algorithm = null) {
    const currentAlgorithm = algorithm || this.getCurrentAlgorithm();
    const candidates = Array.from(this.entryMetrics.entries())
      .map(([key, metrics]) => ({ key, ...metrics }))
      .filter(entry => entry.score < this.config.thresholds.minScore || this.shouldConsiderForEviction(entry));
    
    switch (currentAlgorithm) {
      case 'weighted_score':
        return this.selectByWeightedScore(candidates, count);
      case 'size_first':
        return this.selectBySizeFirst(candidates, count);
      case 'lru_enhanced':
        return this.selectByLRUEnhanced(candidates, count);
      case 'lfu':
        return this.selectByLFU(candidates, count);
      default:
        return this.selectByWeightedScore(candidates, count);
    }
  }

  /**
   * Determinar algoritmo actual basado en condiciones
   */
  getCurrentAlgorithm() {
    const memoryState = memoryPressureDetector.getCurrentState();
    
    if (memoryState.pressureLevel === 'critical') {
      return this.config.algorithms.memoryPressure;
    }
    
    // Verificar si hay muchos accesos recientes
    const recentAccesses = Array.from(this.entryMetrics.values())
      .filter(m => Date.now() - m.lastAccessed < 5 * 60 * 1000).length;
    
    if (recentAccesses > 50) {
      return this.config.algorithms.highFrequency;
    }
    
    return this.config.algorithms.default;
  }

  /**
   * Verificar si una entrada debe considerarse para desalojo
   */
  shouldConsiderForEviction(entry) {
    const now = Date.now();
    
    // No desalojar si se accedió recientemente y tiene buen score
    if (now - entry.lastAccessed < 5 * 60 * 1000 && entry.score > 0.7) {
      return false;
    }
    
    // Considerar si es muy grande
    if (entry.size > this.config.thresholds.sizeThreshold) {
      return true;
    }
    
    // Considerar si ha expirado
    if (now > entry.createdAt + entry.ttl) {
      return true;
    }
    
    return entry.score < 0.3;
  }

  /**
   * Seleccionar por score ponderado
   */
  selectByWeightedScore(candidates, count) {
    return candidates
      .sort((a, b) => a.score - b.score)
      .slice(0, count);
  }

  /**
   * Seleccionar por tamaño primero
   */
  selectBySizeFirst(candidates, count) {
    return candidates
      .sort((a, b) => {
        // Priorizar por tamaño, luego por score
        const sizeDiff = b.size - a.size;
        return sizeDiff !== 0 ? sizeDiff : a.score - b.score;
      })
      .slice(0, count);
  }

  /**
   * Seleccionar por LRU mejorado
   */
  selectByLRUEnhanced(candidates, count) {
    return candidates
      .sort((a, b) => {
        // LRU pero considerando frecuencia
        const recencyDiff = a.lastAccessed - b.lastAccessed;
        const frequencyDiff = b.accessCount - a.accessCount;
        
        // Si la diferencia de recencia es significativa, usar eso
        if (Math.abs(recencyDiff) > 30 * 60 * 1000) { // 30 minutos
          return recencyDiff;
        }
        
        // Sino, considerar frecuencia
        return frequencyDiff;
      })
      .slice(0, count);
  }

  /**
   * Seleccionar por LFU
   */
  selectByLFU(candidates, count) {
    return candidates
      .sort((a, b) => a.accessCount - b.accessCount)
      .slice(0, count);
  }

  /**
   * Realizar desalojo de emergencia
   */
  performEmergencyEviction(pressureLevel) {
    const targetCount = pressureLevel === 'critical' ? 20 : 10;
    const algorithm = pressureLevel === 'critical' ? 'size_first' : 'weighted_score';
    
    const candidates = this.selectEvictionCandidates(targetCount, algorithm);
    
    logger.warn('SMART_EVICTION', `Emergency eviction triggered (${pressureLevel})`, {
      candidatesCount: candidates.length,
      algorithm
    });
    
    return candidates.map(candidate => candidate.key);
  }

  /**
   * Realizar desalojo normal
   */
  performEviction(targetCount) {
    const candidates = this.selectEvictionCandidates(targetCount);
    
    // Registrar en historial
    const evictionRecord = {
      timestamp: Date.now(),
      count: candidates.length,
      algorithm: this.getCurrentAlgorithm(),
      memoryPressure: memoryPressureDetector.getCurrentState().pressureLevel,
      candidates: candidates.map(c => ({
        key: c.key,
        score: c.score,
        size: c.size,
        accessCount: c.accessCount
      }))
    };
    
    this.evictionHistory.push(evictionRecord);
    
    // Mantener historial limitado
    if (this.evictionHistory.length > this.config.metrics.maxHistorySize) {
      this.evictionHistory.shift();
    }
    
    // Actualizar métricas de intentos de desalojo
    candidates.forEach(candidate => {
      const metrics = this.entryMetrics.get(candidate.key);
      if (metrics) {
        metrics.evictionAttempts++;
      }
    });
    
    logger.info('SMART_EVICTION', `Eviction performed`, {
      candidatesCount: candidates.length,
      algorithm: evictionRecord.algorithm,
      totalSize: candidates.reduce((sum, c) => sum + c.size, 0)
    });
    
    return candidates.map(candidate => candidate.key);
  }

  /**
   * Remover entrada del tracking
   */
  removeEntry(key) {
    this.entryMetrics.delete(key);
  }

  /**
   * Iniciar optimización periódica
   */
  startPeriodicOptimization() {
    // Actualizar scores cada 2 minutos
    setInterval(() => {
      this.updateAllScores();
    }, 2 * 60 * 1000);
    
    // Limpiar métricas antiguas cada 30 minutos
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 30 * 60 * 1000);
  }

  /**
   * Actualizar todos los scores
   */
  updateAllScores() {
    for (const key of this.entryMetrics.keys()) {
      this.updateScore(key);
    }
  }

  /**
   * Limpiar métricas antiguas
   */
  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    const keysToRemove = [];
    
    for (const [key, metrics] of this.entryMetrics.entries()) {
      if (now - metrics.lastAccessed > maxAge) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => this.entryMetrics.delete(key));
    
    if (keysToRemove.length > 0) {
      logger.debug('SMART_EVICTION', `Cleaned up ${keysToRemove.length} old metrics`);
    }
  }

  /**
   * Estimar tamaño de datos
   */
  estimateSize(data) {
    if (!data) return 0;
    
    try {
      return JSON.stringify(data).length * 2; // Aproximación UTF-16
    } catch (error) {
      // Fallback para datos no serializables
      if (typeof data === 'string') return data.length * 2;
      if (typeof data === 'number') return 8;
      if (typeof data === 'boolean') return 4;
      return 100; // Estimación por defecto
    }
  }

  /**
   * Obtener estadísticas del sistema
   */
  getStats() {
    const metrics = Array.from(this.entryMetrics.values());
    const totalSize = metrics.reduce((sum, m) => sum + m.size, 0);
    const avgScore = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length || 0;
    
    return {
      entries: {
        total: metrics.length,
        totalSize,
        avgSize: totalSize / metrics.length || 0,
        avgScore,
        scoreDistribution: this.getScoreDistribution(metrics)
      },
      evictions: {
        total: this.evictionHistory.length,
        recent: this.evictionHistory.slice(-10),
        algorithms: this.getAlgorithmUsage()
      },
      performance: {
        memoryPressure: memoryPressureDetector.getCurrentState().pressureLevel,
        currentAlgorithm: this.getCurrentAlgorithm()
      }
    };
  }

  /**
   * Obtener distribución de scores
   */
  getScoreDistribution(metrics) {
    const distribution = { low: 0, medium: 0, high: 0 };
    
    metrics.forEach(m => {
      if (m.score < 0.3) distribution.low++;
      else if (m.score < 0.7) distribution.medium++;
      else distribution.high++;
    });
    
    return distribution;
  }

  /**
   * Obtener uso de algoritmos
   */
  getAlgorithmUsage() {
    const usage = {};
    
    this.evictionHistory.forEach(record => {
      usage[record.algorithm] = (usage[record.algorithm] || 0) + 1;
    });
    
    return usage;
  }

  /**
   * Configurar el sistema
   */
  configure(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      weights: { ...this.config.weights, ...newConfig.weights },
      algorithms: { ...this.config.algorithms, ...newConfig.algorithms },
      thresholds: { ...this.config.thresholds, ...newConfig.thresholds }
    };
  }

  /**
   * Resetear el sistema
   */
  reset() {
    this.entryMetrics.clear();
    this.evictionHistory = [];
  }
}

// Instancia singleton
export const smartEvictionManager = new SmartEvictionManager();
export default smartEvictionManager;