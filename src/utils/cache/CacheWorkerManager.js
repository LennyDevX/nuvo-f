/**
 * Manager para coordinar operaciones con el Cache Web Worker
 * Proporciona una interfaz Promise-based para operaciones asíncronas
 */

import { logger } from '../debug/logger.js';

class CacheWorkerManager {
  constructor() {
    this.worker = null;
    this.pendingOperations = new Map();
    this.operationId = 0;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Inicializar el Web Worker
   */
  async initialize() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Crear el worker desde el archivo
        this.worker = new Worker(
          new URL('./CacheWorker.js', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (event) => {
          this.handleWorkerMessage(event);
        };

        this.worker.onerror = (error) => {
          logger.error('CACHE_WORKER', 'Worker error:', error);
          reject(error);
        };

        this.isInitialized = true;
        logger.debug('CACHE_WORKER', 'Cache Worker initialized successfully');
        resolve();
      } catch (error) {
        logger.error('CACHE_WORKER', 'Failed to initialize worker:', error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Manejar mensajes del worker
   */
  handleWorkerMessage(event) {
    const { id, success, result, error } = event.data;
    const operation = this.pendingOperations.get(id);

    if (!operation) {
      logger.warn('CACHE_WORKER', `Received response for unknown operation: ${id}`);
      return;
    }

    this.pendingOperations.delete(id);

    if (success) {
      operation.resolve(result);
    } else {
      operation.reject(new Error(error));
    }
  }

  /**
   * Enviar operación al worker
   */
  async sendOperation(type, data, timeout = 30000) {
    await this.initialize();

    const id = ++this.operationId;
    
    return new Promise((resolve, reject) => {
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        this.pendingOperations.delete(id);
        reject(new Error(`Operation ${type} timed out after ${timeout}ms`));
      }, timeout);

      // Guardar operación pendiente
      this.pendingOperations.set(id, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      // Enviar al worker
      this.worker.postMessage({ id, type, data });
    });
  }

  /**
   * Serializar datos de forma asíncrona
   */
  async serializeData(data) {
    try {
      const result = await this.sendOperation('SERIALIZE_DATA', data);
      return result.serialized;
    } catch (error) {
      logger.error('CACHE_WORKER', 'Serialization failed:', error);
      // Fallback a serialización síncrona
      return JSON.stringify(data);
    }
  }

  /**
   * Deserializar datos de forma asíncrona
   */
  async deserializeData(serializedData) {
    try {
      const result = await this.sendOperation('DESERIALIZE_DATA', serializedData);
      return result.deserialized;
    } catch (error) {
      logger.error('CACHE_WORKER', 'Deserialization failed:', error);
      // Fallback a deserialización síncrona
      return JSON.parse(serializedData);
    }
  }

  /**
   * Comprimir datos
   */
  async compressData(data) {
    try {
      const result = await this.sendOperation('COMPRESS_DATA', data);
      return {
        compressed: result.compressed,
        compressionRatio: result.compressionRatio,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize
      };
    } catch (error) {
      logger.error('CACHE_WORKER', 'Compression failed:', error);
      return { compressed: data, compressionRatio: 0 };
    }
  }

  /**
   * Descomprimir datos
   */
  async decompressData(compressedData) {
    try {
      const result = await this.sendOperation('DECOMPRESS_DATA', compressedData);
      return result.decompressed;
    } catch (error) {
      logger.error('CACHE_WORKER', 'Decompression failed:', error);
      return compressedData;
    }
  }

  /**
   * Ejecutar operaciones en lote
   */
  async batchOperations(operations) {
    try {
      const result = await this.sendOperation('BATCH_OPERATIONS', operations);
      return result.results;
    } catch (error) {
      logger.error('CACHE_WORKER', 'Batch operations failed:', error);
      // Fallback a procesamiento secuencial
      return operations.map(op => this.processFallbackOperation(op));
    }
  }

  /**
   * Calcular uso de memoria
   */
  async calculateMemoryUsage(cacheData) {
    try {
      const result = await this.sendOperation('CALCULATE_MEMORY_USAGE', Array.from(cacheData.entries()));
      return {
        totalSize: result.totalSize,
        itemSizes: new Map(result.itemSizes),
        itemCount: result.itemCount
      };
    } catch (error) {
      logger.error('CACHE_WORKER', 'Memory calculation failed:', error);
      // Fallback a cálculo simple
      return this.calculateMemoryUsageFallback(cacheData);
    }
  }

  /**
   * Análisis para smart eviction
   */
  async analyzeSmartEviction(cacheData, accessPatterns) {
    try {
      const result = await this.sendOperation('SMART_EVICTION_ANALYSIS', {
        cacheData: Array.from(cacheData.entries()),
        accessPatterns: Array.from(accessPatterns.entries()),
        currentTime: Date.now()
      });
      return result.evictionCandidates;
    } catch (error) {
      logger.error('CACHE_WORKER', 'Smart eviction analysis failed:', error);
      return [];
    }
  }

  /**
   * Procesamiento fallback para operaciones en lote
   */
  processFallbackOperation(operation) {
    switch (operation.type) {
      case 'serialize':
        return JSON.stringify(operation.data);
      case 'validate':
        return {
          isValid: operation.data && typeof operation.data === 'object',
          hasExpiry: 'expiry' in operation.data,
          isExpired: operation.data.expiry ? Date.now() > operation.data.expiry : false
        };
      default:
        return null;
    }
  }

  /**
   * Cálculo de memoria fallback
   */
  calculateMemoryUsageFallback(cacheData) {
    let totalSize = 0;
    const itemSizes = new Map();

    for (const [key, value] of cacheData) {
      try {
        const serialized = JSON.stringify(value);
        const itemSize = serialized.length * 2;
        const keySize = key.length * 2;
        const totalItemSize = itemSize + keySize;
        
        totalSize += totalItemSize;
        itemSizes.set(key, {
          keySize,
          valueSize: itemSize,
          totalSize: totalItemSize
        });
      } catch (error) {
        // Si falla la serialización, usar estimación
        const estimatedSize = 100;
        totalSize += estimatedSize;
        itemSizes.set(key, {
          keySize: key.length * 2,
          valueSize: estimatedSize,
          totalSize: estimatedSize + (key.length * 2)
        });
      }
    }

    return { totalSize, itemSizes, itemCount: cacheData.size };
  }

  /**
   * Verificar si el worker está disponible
   */
  isWorkerAvailable() {
    return this.isInitialized && this.worker;
  }

  /**
   * Obtener estadísticas del worker
   */
  getWorkerStats() {
    return {
      isInitialized: this.isInitialized,
      pendingOperations: this.pendingOperations.size,
      isAvailable: this.isWorkerAvailable()
    };
  }

  /**
   * Terminar el worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.pendingOperations.clear();
      logger.debug('CACHE_WORKER', 'Cache Worker terminated');
    }
  }
}

// Instancia singleton
export const cacheWorkerManager = new CacheWorkerManager();
export default cacheWorkerManager;