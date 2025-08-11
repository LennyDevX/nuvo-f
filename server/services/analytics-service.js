import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servicio de Analytics y Métricas Avanzadas
 * Proporciona monitoreo en tiempo real, insights de uso y métricas detalladas
 */
class AnalyticsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byModel: new Map(),
        byEndpoint: new Map(),
        byHour: new Map(),
        byDay: new Map()
      },
      performance: {
        averageResponseTime: 0,
        totalResponseTime: 0,
        slowestRequest: 0,
        fastestRequest: Infinity,
        responseTimeHistory: []
      },
      usage: {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        tokensByModel: new Map(),
        estimatedCost: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        savedTokens: 0,
        savedCost: 0
      },
      embeddings: {
        totalEmbeddings: 0,
        indexesCreated: 0,
        searchesPerformed: 0,
        averageSearchTime: 0
      },
      errors: {
        total: 0,
        byType: new Map(),
        byModel: new Map(),
        recentErrors: []
      },
      realTime: {
        activeRequests: 0,
        requestsPerMinute: 0,
        lastMinuteRequests: [],
        peakConcurrency: 0
      }
    };
    
    this.startTime = Date.now();
    this.listeners = new Set();
    
    // Limpiar datos antiguos cada hora
    setInterval(() => this.cleanupOldData(), 60 * 60 * 1000);
    
    // Calcular métricas en tiempo real cada minuto
    setInterval(() => this.updateRealTimeMetrics(), 60 * 1000);
  }

  /**
   * Registra el inicio de una request
   */
  startRequest(endpoint, model = 'unknown') {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    this.metrics.realTime.activeRequests++;
    this.metrics.realTime.peakConcurrency = Math.max(
      this.metrics.realTime.peakConcurrency,
      this.metrics.realTime.activeRequests
    );
    
    this.metrics.realTime.lastMinuteRequests.push(timestamp);
    
    // Incrementar contadores
    this.metrics.requests.total++;
    this.incrementMapValue(this.metrics.requests.byEndpoint, endpoint);
    this.incrementMapValue(this.metrics.requests.byModel, model);
    
    // Métricas por tiempo
    const hour = new Date(timestamp).getHours();
    const day = new Date(timestamp).toDateString();
    this.incrementMapValue(this.metrics.requests.byHour, hour);
    this.incrementMapValue(this.metrics.requests.byDay, day);
    
    this.notifyListeners('request_started', { requestId, endpoint, model, timestamp });
    
    return { requestId, startTime: timestamp };
  }

  /**
   * Registra el final exitoso de una request
   */
  endRequest(requestData, responseData = {}) {
    const { requestId, startTime } = requestData;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    this.metrics.realTime.activeRequests = Math.max(0, this.metrics.realTime.activeRequests - 1);
    this.metrics.requests.successful++;
    
    // Actualizar métricas de performance
    this.updatePerformanceMetrics(responseTime);
    
    // Actualizar métricas de uso si se proporcionan
    if (responseData.tokensUsed) {
      this.updateUsageMetrics(responseData);
    }
    
    this.notifyListeners('request_completed', {
      requestId,
      responseTime,
      tokensUsed: responseData.tokensUsed || 0,
      success: true
    });
  }

  /**
   * Registra una request fallida
   */
  failRequest(requestData, error) {
    const { requestId, startTime } = requestData;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    this.metrics.realTime.activeRequests = Math.max(0, this.metrics.realTime.activeRequests - 1);
    this.metrics.requests.failed++;
    this.metrics.errors.total++;
    
    // Registrar error
    const errorType = error.name || 'UnknownError';
    this.incrementMapValue(this.metrics.errors.byType, errorType);
    
    // Mantener historial de errores recientes (últimos 100)
    this.metrics.errors.recentErrors.push({
      timestamp: endTime,
      type: errorType,
      message: error.message,
      requestId
    });
    
    if (this.metrics.errors.recentErrors.length > 100) {
      this.metrics.errors.recentErrors.shift();
    }
    
    this.updatePerformanceMetrics(responseTime);
    
    this.notifyListeners('request_failed', {
      requestId,
      responseTime,
      error: errorType,
      message: error.message
    });
  }

  /**
   * Registra uso de caché
   */
  recordCacheHit(savedTokens = 0, savedCost = 0) {
    this.metrics.cache.hits++;
    this.metrics.cache.savedTokens += savedTokens;
    this.metrics.cache.savedCost += savedCost;
    this.updateCacheHitRate();
    
    this.notifyListeners('cache_hit', { savedTokens, savedCost });
  }

  /**
   * Registra miss de caché
   */
  recordCacheMiss() {
    this.metrics.cache.misses++;
    this.updateCacheHitRate();
    
    this.notifyListeners('cache_miss', {});
  }

  /**
   * Registra operación de embeddings
   */
  recordEmbeddingOperation(type, data = {}) {
    switch (type) {
      case 'index_created':
        this.metrics.embeddings.indexesCreated++;
        this.metrics.embeddings.totalEmbeddings += data.count || 0;
        break;
      case 'search_performed':
        this.metrics.embeddings.searchesPerformed++;
        if (data.responseTime) {
          const currentAvg = this.metrics.embeddings.averageSearchTime;
          const totalSearches = this.metrics.embeddings.searchesPerformed;
          this.metrics.embeddings.averageSearchTime = 
            (currentAvg * (totalSearches - 1) + data.responseTime) / totalSearches;
        }
        break;
    }
    
    this.notifyListeners('embedding_operation', { type, data });
  }

  /**
   * Obtiene métricas completas
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      ...this.metrics,
      system: {
        uptime,
        uptimeFormatted: this.formatUptime(uptime),
        startTime: new Date(this.startTime).toISOString(),
        currentTime: new Date().toISOString()
      },
      derived: {
        successRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.successful / this.metrics.requests.total * 100).toFixed(2)
          : 0,
        errorRate: this.metrics.requests.total > 0
          ? (this.metrics.requests.failed / this.metrics.requests.total * 100).toFixed(2)
          : 0,
        averageCostPerRequest: this.metrics.requests.successful > 0
          ? (this.metrics.usage.estimatedCost / this.metrics.requests.successful).toFixed(4)
          : 0,
        tokensPerRequest: this.metrics.requests.successful > 0
          ? Math.round(this.metrics.usage.totalTokens / this.metrics.requests.successful)
          : 0
      }
    };
  }

  /**
   * Obtiene métricas en tiempo real
   */
  getRealTimeMetrics() {
    return {
      activeRequests: this.metrics.realTime.activeRequests,
      requestsPerMinute: this.metrics.realTime.requestsPerMinute,
      peakConcurrency: this.metrics.realTime.peakConcurrency,
      recentErrors: this.metrics.errors.recentErrors.slice(-10),
      cacheHitRate: this.metrics.cache.hitRate,
      averageResponseTime: this.metrics.performance.averageResponseTime
    };
  }

  /**
   * Obtiene insights y recomendaciones
   */
  getInsights() {
    const insights = [];
    const metrics = this.metrics;
    
    // Análisis de performance
    if (metrics.performance.averageResponseTime > 5000) {
      insights.push({
        type: 'warning',
        category: 'performance',
        message: 'Tiempo de respuesta promedio alto (>5s). Considera optimizar consultas o usar caché.',
        value: `${(metrics.performance.averageResponseTime / 1000).toFixed(2)}s`
      });
    }
    
    // Análisis de caché
    if (metrics.cache.hitRate < 30 && metrics.cache.hits + metrics.cache.misses > 50) {
      insights.push({
        type: 'suggestion',
        category: 'cache',
        message: 'Baja tasa de aciertos de caché. Revisa la estrategia de cacheo.',
        value: `${metrics.cache.hitRate.toFixed(1)}%`
      });
    }
    
    // Análisis de errores
    const errorRate = metrics.requests.total > 0 
      ? (metrics.requests.failed / metrics.requests.total * 100) 
      : 0;
    
    if (errorRate > 5) {
      insights.push({
        type: 'alert',
        category: 'errors',
        message: 'Alta tasa de errores detectada. Revisa logs y configuración.',
        value: `${errorRate.toFixed(1)}%`
      });
    }
    
    // Análisis de costos
    if (metrics.usage.estimatedCost > 100) {
      insights.push({
        type: 'info',
        category: 'cost',
        message: 'Uso significativo detectado. Monitorea costos regularmente.',
        value: `$${metrics.usage.estimatedCost.toFixed(2)}`
      });
    }
    
    // Análisis de modelos más usados
    const topModel = this.getTopMapEntry(metrics.requests.byModel);
    if (topModel) {
      insights.push({
        type: 'info',
        category: 'usage',
        message: `Modelo más utilizado: ${topModel.key}`,
        value: `${topModel.value} requests`
      });
    }
    
    return insights;
  }

  /**
   * Exporta métricas a archivo
   */
  async exportMetrics(format = 'json') {
    const metrics = this.getMetrics();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `metrics-export-${timestamp}.${format}`;
    const filepath = path.join(__dirname, '..', 'exports', filename);
    
    // Crear directorio si no existe
    const exportDir = path.dirname(filepath);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    try {
      if (format === 'json') {
        fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));
      } else if (format === 'csv') {
        const csv = this.convertToCSV(metrics);
        fs.writeFileSync(filepath, csv);
      }
      
      return { success: true, filepath, filename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Resetea todas las métricas
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byModel: new Map(),
        byEndpoint: new Map(),
        byHour: new Map(),
        byDay: new Map()
      },
      performance: {
        averageResponseTime: 0,
        totalResponseTime: 0,
        slowestRequest: 0,
        fastestRequest: Infinity,
        responseTimeHistory: []
      },
      usage: {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        tokensByModel: new Map(),
        estimatedCost: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        savedTokens: 0,
        savedCost: 0
      },
      embeddings: {
        totalEmbeddings: 0,
        indexesCreated: 0,
        searchesPerformed: 0,
        averageSearchTime: 0
      },
      errors: {
        total: 0,
        byType: new Map(),
        byModel: new Map(),
        recentErrors: []
      },
      realTime: {
        activeRequests: 0,
        requestsPerMinute: 0,
        lastMinuteRequests: [],
        peakConcurrency: 0
      }
    };
    
    this.startTime = Date.now();
    this.notifyListeners('metrics_reset', {});
  }

  /**
   * Suscribe un listener para eventos en tiempo real
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // === Métodos privados ===

  incrementMapValue(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
  }

  updatePerformanceMetrics(responseTime) {
    this.metrics.performance.totalResponseTime += responseTime;
    this.metrics.performance.averageResponseTime = 
      this.metrics.performance.totalResponseTime / this.metrics.requests.total;
    
    this.metrics.performance.slowestRequest = Math.max(
      this.metrics.performance.slowestRequest,
      responseTime
    );
    
    this.metrics.performance.fastestRequest = Math.min(
      this.metrics.performance.fastestRequest,
      responseTime
    );
    
    // Mantener historial de los últimos 1000 tiempos de respuesta
    this.metrics.performance.responseTimeHistory.push(responseTime);
    if (this.metrics.performance.responseTimeHistory.length > 1000) {
      this.metrics.performance.responseTimeHistory.shift();
    }
  }

  updateUsageMetrics(responseData) {
    const { tokensUsed = 0, inputTokens = 0, outputTokens = 0, model = 'unknown' } = responseData;
    
    this.metrics.usage.totalTokens += tokensUsed;
    this.metrics.usage.inputTokens += inputTokens;
    this.metrics.usage.outputTokens += outputTokens;
    
    this.incrementMapValue(this.metrics.usage.tokensByModel, model);
    
    // Estimación de costo (aproximada)
    const costPerToken = this.getCostPerToken(model);
    this.metrics.usage.estimatedCost += tokensUsed * costPerToken;
  }

  updateCacheHitRate() {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 
      ? (this.metrics.cache.hits / total * 100) 
      : 0;
  }

  updateRealTimeMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    // Filtrar requests del último minuto
    this.metrics.realTime.lastMinuteRequests = 
      this.metrics.realTime.lastMinuteRequests.filter(timestamp => timestamp > oneMinuteAgo);
    
    this.metrics.realTime.requestsPerMinute = this.metrics.realTime.lastMinuteRequests.length;
  }

  cleanupOldData() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Limpiar errores antiguos
    this.metrics.errors.recentErrors = this.metrics.errors.recentErrors
      .filter(error => error.timestamp > oneDayAgo);
    
    // Limpiar datos por día antiguos (mantener últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toDateString();
    for (const [day] of this.metrics.requests.byDay) {
      if (new Date(day) < new Date(thirtyDaysAgo)) {
        this.metrics.requests.byDay.delete(day);
      }
    }
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in analytics listener:', error);
      }
    });
  }

  getCostPerToken(model) {
    // Costos aproximados por token (en USD)
    const costs = {
      'gemini-2.5-flash': 0.000001,
      'gemini-2.0-flash': 0.000001,
      'gemini-1.5-pro': 0.000003,
      'gemini-1.5-flash': 0.0000005,
      'text-embedding-004': 0.0000001
    };
    
    return costs[model] || 0.000001; // Default cost
  }

  getTopMapEntry(map) {
    let topEntry = null;
    let maxValue = 0;
    
    for (const [key, value] of map) {
      if (value > maxValue) {
        maxValue = value;
        topEntry = { key, value };
      }
    }
    
    return topEntry;
  }

  formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  convertToCSV(metrics) {
    // Conversión básica a CSV para métricas principales
    const rows = [
      ['Metric', 'Value'],
      ['Total Requests', metrics.requests.total],
      ['Successful Requests', metrics.requests.successful],
      ['Failed Requests', metrics.requests.failed],
      ['Success Rate (%)', metrics.derived.successRate],
      ['Average Response Time (ms)', metrics.performance.averageResponseTime],
      ['Total Tokens', metrics.usage.totalTokens],
      ['Estimated Cost ($)', metrics.usage.estimatedCost],
      ['Cache Hit Rate (%)', metrics.cache.hitRate],
      ['Active Requests', metrics.realTime.activeRequests],
      ['Uptime', metrics.system.uptimeFormatted]
    ];
    
    return rows.map(row => row.join(',')).join('\n');
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;