/**
 * Detector de presión de memoria del navegador
 * Monitorea el uso de memoria y activa estrategias de limpieza automática
 */

import { logger } from '../debug/logger.js';
import { MEMORY_LIMITS, PERFORMANCE_THRESHOLDS } from './cacheConfig.js';

class MemoryPressureDetector {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.checkInterval = 30000; // 30 segundos
    this.memoryInfo = {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      timestamp: Date.now()
    };
    this.pressureLevel = 'normal'; // normal, warning, critical
    this.callbacks = {
      warning: [],
      critical: [],
      normal: []
    };
    this.history = [];
    this.maxHistorySize = 100;
    this.performanceObserver = null;
    
    this.initializeDetection();
  }

  /**
   * Inicializar detección de memoria
   */
  initializeDetection() {
    // Verificar si performance.memory está disponible
    if (!this.isMemoryAPIAvailable()) {
      logger.warn('MEMORY_PRESSURE', 'Performance.memory API not available, using fallback methods');
      this.initializeFallbackDetection();
      return;
    }

    // Configurar Performance Observer para detectar long tasks
    this.setupPerformanceObserver();
    
    // Iniciar monitoreo
    this.startMonitoring();
    
    logger.debug('MEMORY_PRESSURE', 'Memory pressure detection initialized');
  }

  /**
   * Verificar si la API de memoria está disponible
   */
  isMemoryAPIAvailable() {
    return 'memory' in performance && 
           'usedJSHeapSize' in performance.memory;
  }

  /**
   * Configurar Performance Observer
   */
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.duration > 50) { // Long task > 50ms
              this.handleLongTask(entry);
            }
          }
        });
        
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        logger.warn('MEMORY_PRESSURE', 'Failed to setup PerformanceObserver:', error);
      }
    }
  }

  /**
   * Inicializar detección fallback
   */
  initializeFallbackDetection() {
    // Usar heurísticas basadas en rendimiento y comportamiento del navegador
    this.startFallbackMonitoring();
  }

  /**
   * Iniciar monitoreo de memoria
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryPressure();
    }, this.checkInterval);
    
    // Verificación inicial
    this.checkMemoryPressure();
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  /**
   * Verificar presión de memoria
   */
  checkMemoryPressure() {
    const currentInfo = this.getCurrentMemoryInfo();
    const previousLevel = this.pressureLevel;
    
    // Actualizar información de memoria
    this.memoryInfo = {
      ...currentInfo,
      timestamp: Date.now()
    };
    
    // Agregar a historial
    this.addToHistory(currentInfo);
    
    // Calcular nivel de presión
    const newLevel = this.calculatePressureLevel(currentInfo);
    
    // Si cambió el nivel, notificar
    if (newLevel !== previousLevel) {
      this.pressureLevel = newLevel;
      this.notifyPressureChange(newLevel, previousLevel);
    }
    
    // Ejecutar callbacks del nivel actual
    this.executeCallbacks(newLevel, currentInfo);
  }

  /**
   * Obtener información actual de memoria
   */
  getCurrentMemoryInfo() {
    if (this.isMemoryAPIAvailable()) {
      const memory = performance.memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    } else {
      return this.getFallbackMemoryInfo();
    }
  }

  /**
   * Obtener información de memoria fallback
   */
  getFallbackMemoryInfo() {
    // Usar heurísticas basadas en rendimiento
    const now = performance.now();
    const gcDetected = this.detectGarbageCollection();
    const responseTime = this.measureResponseTime();
    
    // Estimar uso de memoria basado en indicadores indirectos
    let estimatedUsage = 50; // Base 50%
    
    if (gcDetected) estimatedUsage += 20;
    if (responseTime > 100) estimatedUsage += 15;
    if (this.history.length > 0) {
      const trend = this.calculateMemoryTrend();
      estimatedUsage += trend * 10;
    }
    
    return {
      usedJSHeapSize: estimatedUsage * 1024 * 1024, // Estimación en bytes
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB estimado
      jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB estimado
      usagePercentage: Math.min(estimatedUsage, 95),
      isEstimated: true
    };
  }

  /**
   * Detectar garbage collection
   */
  detectGarbageCollection() {
    // Medir tiempo de ejecución de una operación simple
    const start = performance.now();
    const arr = new Array(1000).fill(0);
    arr.forEach((_, i) => arr[i] = Math.random());
    const end = performance.now();
    
    // Si toma más tiempo del esperado, posible GC
    return (end - start) > 10;
  }

  /**
   * Medir tiempo de respuesta
   */
  measureResponseTime() {
    const start = performance.now();
    
    // Operación simple para medir responsividad
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }
    
    return performance.now() - start;
  }

  /**
   * Calcular tendencia de memoria
   */
  calculateMemoryTrend() {
    if (this.history.length < 3) return 0;
    
    const recent = this.history.slice(-3);
    const first = recent[0].usagePercentage;
    const last = recent[recent.length - 1].usagePercentage;
    
    return (last - first) / first; // Porcentaje de cambio
  }

  /**
   * Calcular nivel de presión de memoria
   */
  calculatePressureLevel(memoryInfo) {
    const { usagePercentage } = memoryInfo;
    
    // Niveles basados en porcentaje de uso
    if (usagePercentage >= 85) {
      return 'critical';
    } else if (usagePercentage >= 70) {
      return 'warning';
    } else {
      return 'normal';
    }
  }

  /**
   * Agregar información al historial
   */
  addToHistory(memoryInfo) {
    this.history.push({
      ...memoryInfo,
      timestamp: Date.now()
    });
    
    // Mantener tamaño máximo del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Notificar cambio de presión
   */
  notifyPressureChange(newLevel, previousLevel) {
    logger.info('MEMORY_PRESSURE', `Memory pressure changed from ${previousLevel} to ${newLevel}`, {
      memoryInfo: this.memoryInfo,
      usagePercentage: this.memoryInfo.usagePercentage
    });
  }

  /**
   * Manejar long tasks
   */
  handleLongTask(entry) {
    logger.warn('MEMORY_PRESSURE', `Long task detected: ${entry.duration}ms`, {
      startTime: entry.startTime,
      duration: entry.duration
    });
    
    // Si hay muchas long tasks, puede indicar presión de memoria
    this.checkMemoryPressure();
  }

  /**
   * Ejecutar callbacks del nivel actual
   */
  executeCallbacks(level, memoryInfo) {
    const callbacks = this.callbacks[level] || [];
    
    callbacks.forEach(callback => {
      try {
        callback({
          level,
          memoryInfo,
          history: this.history.slice(-10) // Últimos 10 registros
        });
      } catch (error) {
        logger.error('MEMORY_PRESSURE', 'Callback execution failed:', error);
      }
    });
  }

  /**
   * Registrar callback para nivel de presión
   */
  onPressureLevel(level, callback) {
    if (!this.callbacks[level]) {
      this.callbacks[level] = [];
    }
    
    this.callbacks[level].push(callback);
    
    // Retornar función para desregistrar
    return () => {
      const index = this.callbacks[level].indexOf(callback);
      if (index > -1) {
        this.callbacks[level].splice(index, 1);
      }
    };
  }

  /**
   * Obtener estado actual
   */
  getCurrentState() {
    return {
      pressureLevel: this.pressureLevel,
      memoryInfo: this.memoryInfo,
      isMonitoring: this.isMonitoring,
      hasMemoryAPI: this.isMemoryAPIAvailable(),
      historySize: this.history.length
    };
  }

  /**
   * Obtener estadísticas de memoria
   */
  getMemoryStats() {
    if (this.history.length === 0) {
      return null;
    }
    
    const usageValues = this.history.map(h => h.usagePercentage);
    const avgUsage = usageValues.reduce((a, b) => a + b, 0) / usageValues.length;
    const maxUsage = Math.max(...usageValues);
    const minUsage = Math.min(...usageValues);
    
    return {
      averageUsage: avgUsage,
      maxUsage,
      minUsage,
      currentUsage: this.memoryInfo.usagePercentage,
      trend: this.calculateMemoryTrend(),
      samplesCount: this.history.length
    };
  }

  /**
   * Forzar verificación de memoria
   */
  forceCheck() {
    this.checkMemoryPressure();
    return this.getCurrentState();
  }

  /**
   * Configurar intervalo de verificación
   */
  setCheckInterval(interval) {
    this.checkInterval = interval;
    
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Destruir detector
   */
  destroy() {
    this.stopMonitoring();
    this.callbacks = { warning: [], critical: [], normal: [] };
    this.history = [];
  }
}

// Instancia singleton
export const memoryPressureDetector = new MemoryPressureDetector();
export default memoryPressureDetector;