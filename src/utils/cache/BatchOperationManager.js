/**
 * Gestor de Operaciones en Lote para Cache
 * Agrupa múltiples operaciones de cache en transacciones para mejorar eficiencia
 */

import { logger } from '../debug/logger.js';
import { cacheWorkerManager } from './CacheWorkerManager.js';
import { compressionManager } from './CompressionManager.js';

class BatchOperationManager {
  constructor() {
    this.pendingOperations = new Map(); // batchId -> operations[]
    this.activeBatches = new Map(); // batchId -> batchInfo
    this.completedBatches = [];
    this.config = {
      // Configuración de lotes
      batch: {
        maxSize: 50, // Máximo número de operaciones por lote
        maxWaitTime: 100, // Máximo tiempo de espera en ms
        maxDataSize: 5 * 1024 * 1024, // 5MB máximo por lote
        autoFlushInterval: 50 // Auto-flush cada 50ms
      },
      // Tipos de operación
      operationTypes: {
        GET: 'get',
        SET: 'set',
        DELETE: 'delete',
        CLEAR: 'clear',
        UPDATE: 'update',
        BULK_SET: 'bulk_set',
        BULK_GET: 'bulk_get',
        BULK_DELETE: 'bulk_delete'
      },
      // Prioridades
      priorities: {
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3
      },
      // Configuración de compresión
      compression: {
        enabled: true,
        threshold: 1024, // Comprimir si el lote es > 1KB
        method: 'lz-string'
      }
    };
    
    this.workerManager = cacheWorkerManager;
    this.compressionManager = compressionManager;
    this.batchCounter = 0;
    this.operationCounter = 0;
    
    this.startAutoFlush();
  }

  /**
   * Crear un nuevo lote
   */
  createBatch(options = {}) {
    const batchId = `batch_${++this.batchCounter}_${Date.now()}`;
    const batch = {
      id: batchId,
      operations: [],
      createdAt: Date.now(),
      priority: options.priority || this.config.priorities.MEDIUM,
      autoFlush: options.autoFlush !== false,
      maxSize: options.maxSize || this.config.batch.maxSize,
      maxWaitTime: options.maxWaitTime || this.config.batch.maxWaitTime,
      compression: options.compression !== false,
      metadata: options.metadata || {},
      callbacks: {
        onComplete: options.onComplete,
        onError: options.onError,
        onProgress: options.onProgress
      }
    };
    
    this.pendingOperations.set(batchId, []);
    this.activeBatches.set(batchId, batch);
    
    // Auto-flush si está habilitado
    if (batch.autoFlush) {
      setTimeout(() => {
        if (this.activeBatches.has(batchId)) {
          this.executeBatch(batchId);
        }
      }, batch.maxWaitTime);
    }
    
    logger.debug('BATCH_OPERATIONS', `Batch created: ${batchId}`, {
      priority: batch.priority,
      autoFlush: batch.autoFlush,
      maxSize: batch.maxSize
    });
    
    return batchId;
  }

  /**
   * Agregar operación a un lote
   */
  addOperation(batchId, operation) {
    const batch = this.activeBatches.get(batchId);
    const operations = this.pendingOperations.get(batchId);
    
    if (!batch || !operations) {
      throw new Error(`Batch not found: ${batchId}`);
    }
    
    // Crear operación normalizada
    const normalizedOperation = this.normalizeOperation(operation);
    operations.push(normalizedOperation);
    
    // Verificar si el lote debe ejecutarse
    if (operations.length >= batch.maxSize) {
      this.executeBatch(batchId);
    } else if (this.getBatchDataSize(operations) >= this.config.batch.maxDataSize) {
      this.executeBatch(batchId);
    }
    
    return normalizedOperation.id;
  }

  /**
   * Normalizar operación
   */
  normalizeOperation(operation) {
    const operationId = `op_${++this.operationCounter}_${Date.now()}`;
    
    return {
      id: operationId,
      type: operation.type,
      key: operation.key,
      value: operation.value,
      options: operation.options || {},
      priority: operation.priority || this.config.priorities.MEDIUM,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: operation.maxRetries || 3,
      timeout: operation.timeout || 5000,
      metadata: operation.metadata || {}
    };
  }

  /**
   * Operaciones de conveniencia
   */
  
  // Operación GET en lote
  batchGet(batchId, keys, options = {}) {
    const operations = keys.map(key => ({
      type: this.config.operationTypes.GET,
      key,
      options
    }));
    
    return operations.map(op => this.addOperation(batchId, op));
  }
  
  // Operación SET en lote
  batchSet(batchId, entries, options = {}) {
    const operations = entries.map(([key, value]) => ({
      type: this.config.operationTypes.SET,
      key,
      value,
      options
    }));
    
    return operations.map(op => this.addOperation(batchId, op));
  }
  
  // Operación DELETE en lote
  batchDelete(batchId, keys, options = {}) {
    const operations = keys.map(key => ({
      type: this.config.operationTypes.DELETE,
      key,
      options
    }));
    
    return operations.map(op => this.addOperation(batchId, op));
  }
  
  // Operación UPDATE en lote
  batchUpdate(batchId, updates, options = {}) {
    const operations = updates.map(({ key, value, updateFn }) => ({
      type: this.config.operationTypes.UPDATE,
      key,
      value,
      options: { ...options, updateFn }
    }));
    
    return operations.map(op => this.addOperation(batchId, op));
  }

  /**
   * Ejecutar lote
   */
  async executeBatch(batchId) {
    const batch = this.activeBatches.get(batchId);
    const operations = this.pendingOperations.get(batchId);
    
    if (!batch || !operations || operations.length === 0) {
      return { success: false, error: 'Batch not found or empty' };
    }
    
    // Remover de pendientes
    this.activeBatches.delete(batchId);
    this.pendingOperations.delete(batchId);
    
    const startTime = Date.now();
    
    try {
      logger.info('BATCH_OPERATIONS', `Executing batch: ${batchId}`, {
        operationsCount: operations.length,
        priority: batch.priority,
        dataSize: this.getBatchDataSize(operations)
      });
      
      // Ordenar operaciones por prioridad
      const sortedOperations = this.sortOperationsByPriority(operations);
      
      // Agrupar operaciones por tipo para optimización
      const groupedOperations = this.groupOperationsByType(sortedOperations);
      
      // Ejecutar operaciones agrupadas
      const results = await this.executeGroupedOperations(groupedOperations, batch);
      
      // Procesar resultados
      const executionTime = Date.now() - startTime;
      const batchResult = {
        batchId,
        success: true,
        operationsCount: operations.length,
        executionTime,
        results,
        timestamp: Date.now()
      };
      
      // Registrar lote completado
      this.completedBatches.push(batchResult);
      this.limitCompletedBatches();
      
      // Callback de progreso/completado
      if (batch.callbacks.onProgress) {
        batch.callbacks.onProgress(batchResult);
      }
      if (batch.callbacks.onComplete) {
        batch.callbacks.onComplete(batchResult);
      }
      
      logger.info('BATCH_OPERATIONS', `Batch executed successfully: ${batchId}`, {
        executionTime,
        operationsCount: operations.length,
        successCount: results.filter(r => r.success).length
      });
      
      return batchResult;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult = {
        batchId,
        success: false,
        error: error.message,
        operationsCount: operations.length,
        executionTime,
        timestamp: Date.now()
      };
      
      // Callback de error
      if (batch.callbacks.onError) {
        batch.callbacks.onError(errorResult);
      }
      
      logger.error('BATCH_OPERATIONS', `Batch execution failed: ${batchId}`, error);
      
      return errorResult;
    }
  }

  /**
   * Ordenar operaciones por prioridad
   */
  sortOperationsByPriority(operations) {
    return operations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Agrupar operaciones por tipo
   */
  groupOperationsByType(operations) {
    const groups = {};
    
    operations.forEach(operation => {
      if (!groups[operation.type]) {
        groups[operation.type] = [];
      }
      groups[operation.type].push(operation);
    });
    
    return groups;
  }

  /**
   * Ejecutar operaciones agrupadas
   */
  async executeGroupedOperations(groupedOperations, batch) {
    const allResults = [];
    
    // Ejecutar cada grupo de operaciones
    for (const [type, operations] of Object.entries(groupedOperations)) {
      try {
        const groupResults = await this.executeOperationGroup(type, operations, batch);
        allResults.push(...groupResults);
      } catch (error) {
        // Marcar todas las operaciones del grupo como fallidas
        const failedResults = operations.map(op => ({
          operationId: op.id,
          success: false,
          error: error.message,
          type: op.type,
          key: op.key
        }));
        allResults.push(...failedResults);
      }
    }
    
    return allResults;
  }

  /**
   * Ejecutar grupo de operaciones del mismo tipo
   */
  async executeOperationGroup(type, operations, batch) {
    switch (type) {
      case this.config.operationTypes.GET:
      case this.config.operationTypes.BULK_GET:
        return await this.executeBulkGet(operations, batch);
        
      case this.config.operationTypes.SET:
      case this.config.operationTypes.BULK_SET:
        return await this.executeBulkSet(operations, batch);
        
      case this.config.operationTypes.DELETE:
      case this.config.operationTypes.BULK_DELETE:
        return await this.executeBulkDelete(operations, batch);
        
      case this.config.operationTypes.UPDATE:
        return await this.executeBulkUpdate(operations, batch);
        
      case this.config.operationTypes.CLEAR:
        return await this.executeBulkClear(operations, batch);
        
      default:
        return operations.map(op => ({
          operationId: op.id,
          success: false,
          error: `Unknown operation type: ${type}`,
          type: op.type,
          key: op.key
        }));
    }
  }

  /**
   * Ejecutar GET en lote
   */
  async executeBulkGet(operations, batch) {
    const keys = operations.map(op => op.key);
    
    try {
      // Usar Web Worker para operaciones pesadas
      const results = await this.workerManager.performBatchOperation({
        type: 'bulk_get',
        keys,
        options: { compression: batch.compression }
      });
      
      return operations.map((op, index) => ({
        operationId: op.id,
        success: true,
        data: results[index],
        type: op.type,
        key: op.key
      }));
      
    } catch (error) {
      return operations.map(op => ({
        operationId: op.id,
        success: false,
        error: error.message,
        type: op.type,
        key: op.key
      }));
    }
  }

  /**
   * Ejecutar SET en lote
   */
  async executeBulkSet(operations, batch) {
    const entries = operations.map(op => [op.key, op.value]);
    
    try {
      // Comprimir datos si es necesario
      let processedEntries = entries;
      if (batch.compression && this.shouldCompress(entries)) {
        processedEntries = await this.compressBatchData(entries);
      }
      
      // Usar Web Worker para operaciones pesadas
      const results = await this.workerManager.performBatchOperation({
        type: 'bulk_set',
        entries: processedEntries,
        options: { compression: batch.compression }
      });
      
      return operations.map((op, index) => ({
        operationId: op.id,
        success: results[index],
        type: op.type,
        key: op.key
      }));
      
    } catch (error) {
      return operations.map(op => ({
        operationId: op.id,
        success: false,
        error: error.message,
        type: op.type,
        key: op.key
      }));
    }
  }

  /**
   * Ejecutar DELETE en lote
   */
  async executeBulkDelete(operations, batch) {
    const keys = operations.map(op => op.key);
    
    try {
      const results = await this.workerManager.performBatchOperation({
        type: 'bulk_delete',
        keys,
        options: {}
      });
      
      return operations.map((op, index) => ({
        operationId: op.id,
        success: results[index],
        type: op.type,
        key: op.key
      }));
      
    } catch (error) {
      return operations.map(op => ({
        operationId: op.id,
        success: false,
        error: error.message,
        type: op.type,
        key: op.key
      }));
    }
  }

  /**
   * Ejecutar UPDATE en lote
   */
  async executeBulkUpdate(operations, batch) {
    const results = [];
    
    // Las actualizaciones son más complejas, ejecutar individualmente
    for (const operation of operations) {
      try {
        const updateFn = operation.options.updateFn;
        const currentValue = await this.getCurrentValue(operation.key);
        const newValue = updateFn ? updateFn(currentValue) : operation.value;
        
        const success = await this.setSingleValue(operation.key, newValue);
        
        results.push({
          operationId: operation.id,
          success,
          type: operation.type,
          key: operation.key,
          oldValue: currentValue,
          newValue
        });
        
      } catch (error) {
        results.push({
          operationId: operation.id,
          success: false,
          error: error.message,
          type: operation.type,
          key: operation.key
        });
      }
    }
    
    return results;
  }

  /**
   * Ejecutar CLEAR en lote
   */
  async executeBulkClear(operations, batch) {
    const results = [];
    
    for (const operation of operations) {
      try {
        const success = await this.clearCache(operation.options.pattern);
        
        results.push({
          operationId: operation.id,
          success,
          type: operation.type,
          pattern: operation.options.pattern
        });
        
      } catch (error) {
        results.push({
          operationId: operation.id,
          success: false,
          error: error.message,
          type: operation.type,
          pattern: operation.options.pattern
        });
      }
    }
    
    return results;
  }

  /**
   * Verificar si debe comprimir
   */
  shouldCompress(data) {
    if (!this.config.compression.enabled) return false;
    
    const dataSize = this.estimateDataSize(data);
    return dataSize > this.config.compression.threshold;
  }

  /**
   * Comprimir datos del lote
   */
  async compressBatchData(entries) {
    const compressedEntries = [];
    
    for (const [key, value] of entries) {
      try {
        const compressedValue = await this.compressionManager.compress(value);
        compressedEntries.push([key, compressedValue]);
      } catch (error) {
        // Si falla la compresión, usar valor original
        compressedEntries.push([key, value]);
      }
    }
    
    return compressedEntries;
  }

  /**
   * Obtener tamaño de datos del lote
   */
  getBatchDataSize(operations) {
    return operations.reduce((total, op) => {
      return total + this.estimateOperationSize(op);
    }, 0);
  }

  /**
   * Estimar tamaño de operación
   */
  estimateOperationSize(operation) {
    let size = 0;
    
    if (operation.key) {
      size += operation.key.length * 2; // UTF-16
    }
    
    if (operation.value) {
      size += this.estimateDataSize(operation.value);
    }
    
    return size;
  }

  /**
   * Estimar tamaño de datos
   */
  estimateDataSize(data) {
    try {
      return JSON.stringify(data).length * 2; // UTF-16
    } catch (error) {
      return 100; // Estimación por defecto
    }
  }

  /**
   * Métodos auxiliares para operaciones individuales
   */
  async getCurrentValue(key) {
    // Implementar según el sistema de cache específico
    return null;
  }
  
  async setSingleValue(key, value) {
    // Implementar según el sistema de cache específico
    return true;
  }
  
  async clearCache(pattern) {
    // Implementar según el sistema de cache específico
    return true;
  }

  /**
   * Iniciar auto-flush
   */
  startAutoFlush() {
    setInterval(() => {
      this.autoFlushBatches();
    }, this.config.batch.autoFlushInterval);
  }

  /**
   * Auto-flush de lotes
   */
  autoFlushBatches() {
    const now = Date.now();
    
    for (const [batchId, batch] of this.activeBatches.entries()) {
      if (!batch.autoFlush) continue;
      
      const age = now - batch.createdAt;
      if (age >= batch.maxWaitTime) {
        this.executeBatch(batchId);
      }
    }
  }

  /**
   * Limitar lotes completados
   */
  limitCompletedBatches() {
    const maxHistory = 100;
    if (this.completedBatches.length > maxHistory) {
      this.completedBatches.splice(0, this.completedBatches.length - maxHistory);
    }
  }

  /**
   * Cancelar lote
   */
  cancelBatch(batchId) {
    const batch = this.activeBatches.get(batchId);
    if (!batch) return false;
    
    this.activeBatches.delete(batchId);
    this.pendingOperations.delete(batchId);
    
    logger.info('BATCH_OPERATIONS', `Batch cancelled: ${batchId}`);
    return true;
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const activeBatchesCount = this.activeBatches.size;
    const completedBatchesCount = this.completedBatches.length;
    const totalOperations = Array.from(this.pendingOperations.values())
      .reduce((total, ops) => total + ops.length, 0);
    
    return {
      batches: {
        active: activeBatchesCount,
        completed: completedBatchesCount,
        totalOperations
      },
      performance: {
        avgExecutionTime: this.getAverageExecutionTime(),
        successRate: this.getSuccessRate(),
        compressionSavings: this.compressionManager.getStats()
      },
      recent: this.completedBatches.slice(-10)
    };
  }

  /**
   * Obtener tiempo promedio de ejecución
   */
  getAverageExecutionTime() {
    if (this.completedBatches.length === 0) return 0;
    
    const totalTime = this.completedBatches.reduce((sum, batch) => {
      return sum + (batch.executionTime || 0);
    }, 0);
    
    return totalTime / this.completedBatches.length;
  }

  /**
   * Obtener tasa de éxito
   */
  getSuccessRate() {
    if (this.completedBatches.length === 0) return 0;
    
    const successfulBatches = this.completedBatches.filter(batch => batch.success).length;
    return (successfulBatches / this.completedBatches.length) * 100;
  }

  /**
   * Configurar el sistema
   */
  configure(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      batch: { ...this.config.batch, ...newConfig.batch },
      compression: { ...this.config.compression, ...newConfig.compression }
    };
  }

  /**
   * Resetear el sistema
   */
  reset() {
    // Cancelar todos los lotes activos
    for (const batchId of this.activeBatches.keys()) {
      this.cancelBatch(batchId);
    }
    
    this.completedBatches = [];
    this.batchCounter = 0;
    this.operationCounter = 0;
  }
}

// Instancia singleton
export const batchOperationManager = new BatchOperationManager();
export default batchOperationManager;