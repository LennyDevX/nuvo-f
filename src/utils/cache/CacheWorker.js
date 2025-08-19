/**
 * Web Worker para operaciones de cache pesadas
 * Maneja serialización, compresión y operaciones complejas sin bloquear el UI
 */

// Importar LZ-string para compresión (se agregará después)
// import LZString from 'lz-string';

class CacheWorker {
  constructor() {
    this.operations = new Map();
    this.setupMessageHandler();
  }

  setupMessageHandler() {
    self.onmessage = (event) => {
      const { id, type, data } = event.data;
      
      try {
        switch (type) {
          case 'SERIALIZE_DATA':
            this.handleSerializeData(id, data);
            break;
          case 'DESERIALIZE_DATA':
            this.handleDeserializeData(id, data);
            break;
          case 'COMPRESS_DATA':
            this.handleCompressData(id, data);
            break;
          case 'DECOMPRESS_DATA':
            this.handleDecompressData(id, data);
            break;
          case 'BATCH_OPERATIONS':
            this.handleBatchOperations(id, data);
            break;
          case 'CALCULATE_MEMORY_USAGE':
            this.handleCalculateMemoryUsage(id, data);
            break;
          case 'SMART_EVICTION_ANALYSIS':
            this.handleSmartEvictionAnalysis(id, data);
            break;
          default:
            this.sendError(id, `Unknown operation type: ${type}`);
        }
      } catch (error) {
        this.sendError(id, error.message);
      }
    };
  }

  handleSerializeData(id, data) {
    const startTime = performance.now();
    
    try {
      // Serialización personalizada para manejar BigInt y otros tipos especiales
      const serialized = JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') {
          return { __type: 'bigint', value: value.toString() };
        }
        if (value instanceof Date) {
          return { __type: 'date', value: value.toISOString() };
        }
        if (value instanceof Map) {
          return { __type: 'map', value: Array.from(value.entries()) };
        }
        if (value instanceof Set) {
          return { __type: 'set', value: Array.from(value) };
        }
        return value;
      });
      
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        serialized,
        processingTime: endTime - startTime,
        size: serialized.length
      });
    } catch (error) {
      this.sendError(id, `Serialization failed: ${error.message}`);
    }
  }

  handleDeserializeData(id, serializedData) {
    const startTime = performance.now();
    
    try {
      const deserialized = JSON.parse(serializedData, (key, value) => {
        if (value && typeof value === 'object' && value.__type) {
          switch (value.__type) {
            case 'bigint':
              return BigInt(value.value);
            case 'date':
              return new Date(value.value);
            case 'map':
              return new Map(value.value);
            case 'set':
              return new Set(value.value);
            default:
              return value;
          }
        }
        return value;
      });
      
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        deserialized,
        processingTime: endTime - startTime
      });
    } catch (error) {
      this.sendError(id, `Deserialization failed: ${error.message}`);
    }
  }

  handleCompressData(id, data) {
    const startTime = performance.now();
    
    try {
      // Por ahora usamos una compresión simple, después se integrará LZ-string
      const compressed = this.simpleCompress(data);
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        compressed,
        processingTime: endTime - startTime,
        originalSize: data.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / data.length) * 100
      });
    } catch (error) {
      this.sendError(id, `Compression failed: ${error.message}`);
    }
  }

  handleDecompressData(id, compressedData) {
    const startTime = performance.now();
    
    try {
      const decompressed = this.simpleDecompress(compressedData);
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        decompressed,
        processingTime: endTime - startTime
      });
    } catch (error) {
      this.sendError(id, `Decompression failed: ${error.message}`);
    }
  }

  handleBatchOperations(id, operations) {
    const startTime = performance.now();
    const results = [];
    
    try {
      for (const operation of operations) {
        const result = this.processBatchOperation(operation);
        results.push(result);
      }
      
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        results,
        processingTime: endTime - startTime,
        operationsCount: operations.length
      });
    } catch (error) {
      this.sendError(id, `Batch operations failed: ${error.message}`);
    }
  }

  handleCalculateMemoryUsage(id, cacheData) {
    const startTime = performance.now();
    
    try {
      let totalSize = 0;
      const itemSizes = new Map();
      
      for (const [key, value] of cacheData) {
        const serialized = JSON.stringify(value);
        const itemSize = serialized.length * 2; // UTF-16
        const keySize = key.length * 2;
        const totalItemSize = itemSize + keySize;
        
        totalSize += totalItemSize;
        itemSizes.set(key, {
          keySize,
          valueSize: itemSize,
          totalSize: totalItemSize
        });
      }
      
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        totalSize,
        itemSizes: Array.from(itemSizes.entries()),
        processingTime: endTime - startTime,
        itemCount: cacheData.length
      });
    } catch (error) {
      this.sendError(id, `Memory calculation failed: ${error.message}`);
    }
  }

  handleSmartEvictionAnalysis(id, { cacheData, accessPatterns, currentTime }) {
    const startTime = performance.now();
    
    try {
      const evictionCandidates = [];
      
      for (const [key, value] of cacheData) {
        const pattern = accessPatterns.get(key) || { count: 0, lastAccess: 0, avgInterval: 0 };
        const timeSinceLastAccess = currentTime - pattern.lastAccess;
        const size = JSON.stringify(value).length;
        
        // Calcular score de evicción (mayor score = mejor candidato para evicción)
        const score = this.calculateEvictionScore({
          timeSinceLastAccess,
          accessCount: pattern.count,
          size,
          avgInterval: pattern.avgInterval
        });
        
        evictionCandidates.push({
          key,
          score,
          timeSinceLastAccess,
          accessCount: pattern.count,
          size
        });
      }
      
      // Ordenar por score descendente
      evictionCandidates.sort((a, b) => b.score - a.score);
      
      const endTime = performance.now();
      
      this.sendSuccess(id, {
        evictionCandidates,
        processingTime: endTime - startTime
      });
    } catch (error) {
      this.sendError(id, `Smart eviction analysis failed: ${error.message}`);
    }
  }

  calculateEvictionScore({ timeSinceLastAccess, accessCount, size, avgInterval }) {
    // Normalizar valores
    const timeWeight = Math.min(timeSinceLastAccess / (24 * 60 * 60 * 1000), 1); // Max 1 día
    const accessWeight = Math.max(1 - (accessCount / 100), 0); // Menos accesos = mayor peso
    const sizeWeight = Math.min(size / (1024 * 1024), 1); // Max 1MB
    const intervalWeight = avgInterval > 0 ? Math.min(avgInterval / (60 * 60 * 1000), 1) : 0.5; // Max 1 hora
    
    // Combinar pesos (ajustable según necesidades)
    return (timeWeight * 0.4) + (accessWeight * 0.3) + (sizeWeight * 0.2) + (intervalWeight * 0.1);
  }

  processBatchOperation(operation) {
    switch (operation.type) {
      case 'serialize':
        return JSON.stringify(operation.data);
      case 'compress':
        return this.simpleCompress(operation.data);
      case 'validate':
        return this.validateCacheEntry(operation.data);
      default:
        throw new Error(`Unknown batch operation: ${operation.type}`);
    }
  }

  validateCacheEntry(entry) {
    return {
      isValid: entry && typeof entry === 'object',
      hasExpiry: 'expiry' in entry,
      isExpired: entry.expiry ? Date.now() > entry.expiry : false,
      size: JSON.stringify(entry).length
    };
  }

  // Compresión simple (placeholder para LZ-string)
  simpleCompress(data) {
    // Implementación básica - será reemplazada por LZ-string
    return btoa(encodeURIComponent(data));
  }

  simpleDecompress(data) {
    // Implementación básica - será reemplazada por LZ-string
    return decodeURIComponent(atob(data));
  }

  sendSuccess(id, result) {
    self.postMessage({
      id,
      success: true,
      result
    });
  }

  sendError(id, error) {
    self.postMessage({
      id,
      success: false,
      error
    });
  }
}

// Inicializar el worker
new CacheWorker();