/**
 * Gestor de TTL Adaptativo
 * Ajusta dinámicamente los TTLs basado en patrones de uso y condiciones del sistema
 */

import { logger } from '../debug/logger.js';
import { CACHE_TTL, PERFORMANCE_THRESHOLDS } from './cacheConfig.js';
import { memoryPressureDetector } from './MemoryPressureDetector.js';

class AdaptiveTTLManager {
  constructor() {
    this.accessPatterns = new Map(); // key -> { accessCount, lastAccess, avgInterval, trend }
    this.ttlAdjustments = new Map(); // key -> { originalTTL, currentTTL, adjustmentFactor }
    this.globalStats = {
      totalAccesses: 0,
      avgAccessInterval: 0,
      memoryPressureAdjustments: 0,
      performanceAdjustments: 0
    };
    this.config = {
      minTTL: 5 * 60 * 1000, // 5 minutos mínimo
      maxTTL: 24 * 60 * 60 * 1000, // 24 horas máximo
      learningPeriod: 10, // Número mínimo de accesos para aprender
      adjustmentFactors: {
        highFrequency: 1.5, // Aumentar TTL para datos muy accedidos
        lowFrequency: 0.7, // Reducir TTL para datos poco accedidos
        memoryPressure: 0.5, // Reducir TTL bajo presión de memoria
        goodPerformance: 1.2, // Aumentar TTL con buen rendimiento
        poorPerformance: 0.8 // Reducir TTL con mal rendimiento
      },
      thresholds: {
        highFrequency: 10, // Accesos por hora
        lowFrequency: 1, // Accesos por hora
        recentAccess: 30 * 60 * 1000 // 30 minutos
      }
    };
    
    this.initializeMemoryPressureHandling();
    this.startPeriodicOptimization();
  }

  /**
   * Inicializar manejo de presión de memoria
   */
  initializeMemoryPressureHandling() {
    // Registrar callbacks para diferentes niveles de presión
    memoryPressureDetector.onPressureLevel('warning', (data) => {
      this.handleMemoryPressure('warning', data);
    });
    
    memoryPressureDetector.onPressureLevel('critical', (data) => {
      this.handleMemoryPressure('critical', data);
    });
    
    memoryPressureDetector.onPressureLevel('normal', (data) => {
      this.handleMemoryPressure('normal', data);
    });
  }

  /**
   * Manejar presión de memoria
   */
  handleMemoryPressure(level, data) {
    const adjustmentFactor = level === 'critical' ? 0.3 : 
                           level === 'warning' ? 0.6 : 1.0;
    
    if (level !== 'normal') {
      logger.info('ADAPTIVE_TTL', `Adjusting TTLs due to ${level} memory pressure`, {
        adjustmentFactor,
        memoryUsage: data.memoryInfo.usagePercentage
      });
      
      this.globalStats.memoryPressureAdjustments++;
      this.applyGlobalTTLAdjustment(adjustmentFactor, `memory_pressure_${level}`);
    }
  }

  /**
   * Registrar acceso a una clave
   */
  recordAccess(key, cacheType = 'default') {
    const now = Date.now();
    const pattern = this.accessPatterns.get(key) || {
      accessCount: 0,
      lastAccess: now,
      firstAccess: now,
      intervals: [],
      avgInterval: 0,
      trend: 'stable',
      cacheType
    };
    
    // Actualizar estadísticas de acceso
    pattern.accessCount++;
    
    if (pattern.lastAccess) {
      const interval = now - pattern.lastAccess;
      pattern.intervals.push(interval);
      
      // Mantener solo los últimos 20 intervalos
      if (pattern.intervals.length > 20) {
        pattern.intervals.shift();
      }
      
      // Calcular intervalo promedio
      pattern.avgInterval = pattern.intervals.reduce((a, b) => a + b, 0) / pattern.intervals.length;
      
      // Calcular tendencia
      pattern.trend = this.calculateAccessTrend(pattern.intervals);
    }
    
    pattern.lastAccess = now;
    this.accessPatterns.set(key, pattern);
    
    // Actualizar estadísticas globales
    this.globalStats.totalAccesses++;
    
    // Ajustar TTL si es necesario
    this.adjustTTLForKey(key, pattern);
  }

  /**
   * Calcular tendencia de acceso
   */
  calculateAccessTrend(intervals) {
    if (intervals.length < 3) return 'stable';
    
    const recent = intervals.slice(-5); // Últimos 5 intervalos
    const older = intervals.slice(-10, -5); // 5 intervalos anteriores
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change < -0.2) return 'increasing'; // Intervalos más cortos = más frecuente
    if (change > 0.2) return 'decreasing'; // Intervalos más largos = menos frecuente
    return 'stable';
  }

  /**
   * Ajustar TTL para una clave específica
   */
  adjustTTLForKey(key, pattern) {
    if (pattern.accessCount < this.config.learningPeriod) {
      return; // No hay suficientes datos para ajustar
    }
    
    const originalTTL = this.getOriginalTTL(pattern.cacheType);
    let adjustmentFactor = 1.0;
    const reasons = [];
    
    // Calcular frecuencia de acceso (accesos por hora)
    const hoursSinceFirst = (Date.now() - pattern.firstAccess) / (1000 * 60 * 60);
    const accessFrequency = pattern.accessCount / Math.max(hoursSinceFirst, 0.1);
    
    // Ajustar basado en frecuencia
    if (accessFrequency >= this.config.thresholds.highFrequency) {
      adjustmentFactor *= this.config.adjustmentFactors.highFrequency;
      reasons.push('high_frequency');
    } else if (accessFrequency <= this.config.thresholds.lowFrequency) {
      adjustmentFactor *= this.config.adjustmentFactors.lowFrequency;
      reasons.push('low_frequency');
    }
    
    // Ajustar basado en tendencia
    if (pattern.trend === 'increasing') {
      adjustmentFactor *= 1.3; // Más accesos = TTL más largo
      reasons.push('increasing_trend');
    } else if (pattern.trend === 'decreasing') {
      adjustmentFactor *= 0.8; // Menos accesos = TTL más corto
      reasons.push('decreasing_trend');
    }
    
    // Ajustar basado en recencia
    const timeSinceLastAccess = Date.now() - pattern.lastAccess;
    if (timeSinceLastAccess < this.config.thresholds.recentAccess) {
      adjustmentFactor *= 1.1; // Acceso reciente = TTL ligeramente más largo
      reasons.push('recent_access');
    }
    
    // Calcular nuevo TTL
    const newTTL = Math.max(
      this.config.minTTL,
      Math.min(this.config.maxTTL, originalTTL * adjustmentFactor)
    );
    
    // Guardar ajuste
    const currentAdjustment = this.ttlAdjustments.get(key);
    if (!currentAdjustment || Math.abs(currentAdjustment.currentTTL - newTTL) > originalTTL * 0.1) {
      this.ttlAdjustments.set(key, {
        originalTTL,
        currentTTL: newTTL,
        adjustmentFactor,
        reasons,
        lastAdjustment: Date.now()
      });
      
      logger.debug('ADAPTIVE_TTL', `TTL adjusted for key: ${key}`, {
        originalTTL,
        newTTL,
        adjustmentFactor,
        reasons,
        accessFrequency,
        trend: pattern.trend
      });
    }
  }

  /**
   * Obtener TTL original para un tipo de cache
   */
  getOriginalTTL(cacheType) {
    return CACHE_TTL[cacheType] || CACHE_TTL.default;
  }

  /**
   * Obtener TTL adaptativo para una clave
   */
  getAdaptiveTTL(key, cacheType = 'default') {
    const adjustment = this.ttlAdjustments.get(key);
    
    if (adjustment) {
      return adjustment.currentTTL;
    }
    
    return this.getOriginalTTL(cacheType);
  }

  /**
   * Aplicar ajuste global de TTL
   */
  applyGlobalTTLAdjustment(factor, reason) {
    const affectedKeys = [];
    
    for (const [key, adjustment] of this.ttlAdjustments.entries()) {
      const newTTL = Math.max(
        this.config.minTTL,
        Math.min(this.config.maxTTL, adjustment.currentTTL * factor)
      );
      
      adjustment.currentTTL = newTTL;
      adjustment.adjustmentFactor *= factor;
      adjustment.reasons.push(reason);
      adjustment.lastAdjustment = Date.now();
      
      affectedKeys.push(key);
    }
    
    logger.info('ADAPTIVE_TTL', `Global TTL adjustment applied`, {
      factor,
      reason,
      affectedKeys: affectedKeys.length
    });
  }

  /**
   * Iniciar optimización periódica
   */
  startPeriodicOptimization() {
    // Optimizar cada 5 minutos
    setInterval(() => {
      this.optimizeTTLs();
    }, 5 * 60 * 1000);
    
    // Limpiar datos antiguos cada hora
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  /**
   * Optimizar TTLs basado en patrones globales
   */
  optimizeTTLs() {
    const now = Date.now();
    const optimizations = {
      extended: 0,
      reduced: 0,
      removed: 0
    };
    
    for (const [key, pattern] of this.accessPatterns.entries()) {
      const timeSinceLastAccess = now - pattern.lastAccess;
      
      // Si no se ha accedido en mucho tiempo, reducir TTL
      if (timeSinceLastAccess > 2 * 60 * 60 * 1000) { // 2 horas
        const adjustment = this.ttlAdjustments.get(key);
        if (adjustment) {
          adjustment.currentTTL *= 0.7;
          adjustment.reasons.push('long_inactivity');
          optimizations.reduced++;
        }
      }
      
      // Si se accede muy frecuentemente, extender TTL
      const hoursSinceFirst = (now - pattern.firstAccess) / (1000 * 60 * 60);
      const accessFrequency = pattern.accessCount / Math.max(hoursSinceFirst, 0.1);
      
      if (accessFrequency > 20) { // Muy alta frecuencia
        const adjustment = this.ttlAdjustments.get(key);
        if (adjustment) {
          adjustment.currentTTL = Math.min(
            this.config.maxTTL,
            adjustment.currentTTL * 1.2
          );
          adjustment.reasons.push('very_high_frequency');
          optimizations.extended++;
        }
      }
    }
    
    if (optimizations.extended > 0 || optimizations.reduced > 0) {
      logger.debug('ADAPTIVE_TTL', 'Periodic TTL optimization completed', optimizations);
    }
  }

  /**
   * Limpiar datos antiguos
   */
  cleanupOldData() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    const keysToRemove = [];
    
    // Limpiar patrones de acceso antiguos
    for (const [key, pattern] of this.accessPatterns.entries()) {
      if (now - pattern.lastAccess > maxAge) {
        keysToRemove.push(key);
      }
    }
    
    // Limpiar ajustes de TTL antiguos
    for (const [key, adjustment] of this.ttlAdjustments.entries()) {
      if (now - adjustment.lastAdjustment > maxAge) {
        keysToRemove.push(key);
      }
    }
    
    // Remover claves antiguas
    keysToRemove.forEach(key => {
      this.accessPatterns.delete(key);
      this.ttlAdjustments.delete(key);
    });
    
    if (keysToRemove.length > 0) {
      logger.debug('ADAPTIVE_TTL', `Cleaned up ${keysToRemove.length} old entries`);
    }
  }

  /**
   * Obtener estadísticas del sistema adaptativo
   */
  getStats() {
    const patterns = Array.from(this.accessPatterns.values());
    const adjustments = Array.from(this.ttlAdjustments.values());
    
    return {
      global: this.globalStats,
      patterns: {
        total: patterns.length,
        avgAccessCount: patterns.reduce((sum, p) => sum + p.accessCount, 0) / patterns.length || 0,
        trends: {
          increasing: patterns.filter(p => p.trend === 'increasing').length,
          decreasing: patterns.filter(p => p.trend === 'decreasing').length,
          stable: patterns.filter(p => p.trend === 'stable').length
        }
      },
      adjustments: {
        total: adjustments.length,
        avgAdjustmentFactor: adjustments.reduce((sum, a) => sum + a.adjustmentFactor, 0) / adjustments.length || 1,
        ttlRange: {
          min: Math.min(...adjustments.map(a => a.currentTTL)),
          max: Math.max(...adjustments.map(a => a.currentTTL)),
          avg: adjustments.reduce((sum, a) => sum + a.currentTTL, 0) / adjustments.length || 0
        }
      }
    };
  }

  /**
   * Resetear estadísticas
   */
  reset() {
    this.accessPatterns.clear();
    this.ttlAdjustments.clear();
    this.globalStats = {
      totalAccesses: 0,
      avgAccessInterval: 0,
      memoryPressureAdjustments: 0,
      performanceAdjustments: 0
    };
  }

  /**
   * Configurar parámetros del sistema
   */
  configure(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return { ...this.config };
  }
}

// Instancia singleton
export const adaptiveTTLManager = new AdaptiveTTLManager();
export default adaptiveTTLManager;