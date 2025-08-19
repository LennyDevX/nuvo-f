/**
 * Manager de compresión para el sistema de cache
 * Integra LZ-string para compresión eficiente de datos
 */

import { logger } from '../debug/logger.js';
import { cacheWorkerManager } from './CacheWorkerManager.js';

// Placeholder para LZ-string - se instalará como dependencia
// import LZString from 'lz-string';

class CompressionManager {
  constructor() {
    this.compressionEnabled = true;
    this.compressionThreshold = 1024; // 1KB - solo comprimir datos mayores
    this.compressionStats = {
      totalCompressions: 0,
      totalDecompressions: 0,
      totalBytesSaved: 0,
      averageCompressionRatio: 0,
      compressionTime: 0,
      decompressionTime: 0
    };
    this.compressionMethods = {
      'lz-string': this.useLZString.bind(this),
      'gzip-simulation': this.useGzipSimulation.bind(this),
      'simple': this.useSimpleCompression.bind(this)
    };
    this.currentMethod = 'simple'; // Cambiar a 'lz-string' cuando esté disponible
  }

  /**
   * Comprimir datos automáticamente
   */
  async compress(data, options = {}) {
    const startTime = performance.now();
    
    try {
      // Convertir a string si es necesario
      const stringData = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Verificar si vale la pena comprimir
      if (!this.shouldCompress(stringData, options)) {
        return {
          compressed: stringData,
          isCompressed: false,
          originalSize: stringData.length,
          compressedSize: stringData.length,
          compressionRatio: 0,
          method: 'none'
        };
      }

      // Usar Web Worker para operaciones pesadas si está disponible
      if (cacheWorkerManager.isWorkerAvailable() && stringData.length > 10000) {
        const result = await cacheWorkerManager.compressData(stringData);
        this.updateStats(result, startTime);
        return {
          ...result,
          isCompressed: true,
          method: 'worker'
        };
      }

      // Compresión en el hilo principal
      const result = await this.compressSync(stringData, options);
      this.updateStats(result, startTime);
      
      return {
        ...result,
        isCompressed: true
      };
    } catch (error) {
      logger.error('COMPRESSION', 'Compression failed:', error);
      const stringData = typeof data === 'string' ? data : JSON.stringify(data);
      return {
        compressed: stringData,
        isCompressed: false,
        originalSize: stringData.length,
        compressedSize: stringData.length,
        compressionRatio: 0,
        method: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Descomprimir datos
   */
  async decompress(compressedData, metadata = {}) {
    const startTime = performance.now();
    
    try {
      // Si no está comprimido, devolver tal como está
      if (!metadata.isCompressed) {
        return compressedData;
      }

      // Usar Web Worker si está disponible y los datos son grandes
      if (cacheWorkerManager.isWorkerAvailable() && metadata.method === 'worker') {
        const result = await cacheWorkerManager.decompressData(compressedData);
        this.updateDecompressionStats(startTime);
        return result;
      }

      // Descompresión en el hilo principal
      const result = await this.decompressSync(compressedData, metadata);
      this.updateDecompressionStats(startTime);
      
      return result;
    } catch (error) {
      logger.error('COMPRESSION', 'Decompression failed:', error);
      // Fallback: devolver datos sin descomprimir
      return compressedData;
    }
  }

  /**
   * Compresión síncrona
   */
  async compressSync(data, options = {}) {
    const method = options.method || this.currentMethod;
    const compressionFn = this.compressionMethods[method];
    
    if (!compressionFn) {
      throw new Error(`Unknown compression method: ${method}`);
    }

    return compressionFn(data, 'compress');
  }

  /**
   * Descompresión síncrona
   */
  async decompressSync(data, metadata = {}) {
    const method = metadata.method || this.currentMethod;
    const compressionFn = this.compressionMethods[method];
    
    if (!compressionFn) {
      throw new Error(`Unknown compression method: ${method}`);
    }

    return compressionFn(data, 'decompress');
  }

  /**
   * Usar LZ-string (cuando esté disponible)
   */
  useLZString(data, operation) {
    // TODO: Implementar cuando LZ-string esté instalado
    // if (operation === 'compress') {
    //   const compressed = LZString.compress(data);
    //   return {
    //     compressed,
    //     originalSize: data.length,
    //     compressedSize: compressed.length,
    //     compressionRatio: (1 - compressed.length / data.length) * 100,
    //     method: 'lz-string'
    //   };
    // } else {
    //   return LZString.decompress(data);
    // }
    
    // Fallback temporal
    return this.useSimpleCompression(data, operation);
  }

  /**
   * Simulación de compresión GZIP
   */
  useGzipSimulation(data, operation) {
    if (operation === 'compress') {
      // Simulación simple de compresión
      const compressed = this.runLengthEncode(data);
      return {
        compressed,
        originalSize: data.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / data.length) * 100,
        method: 'gzip-simulation'
      };
    } else {
      return this.runLengthDecode(data);
    }
  }

  /**
   * Compresión simple usando base64 y eliminación de espacios
   */
  useSimpleCompression(data, operation) {
    if (operation === 'compress') {
      // Eliminar espacios innecesarios y comprimir con base64
      const minified = data.replace(/\s+/g, ' ').trim();
      const compressed = btoa(encodeURIComponent(minified));
      
      return {
        compressed,
        originalSize: data.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / data.length) * 100,
        method: 'simple'
      };
    } else {
      return decodeURIComponent(atob(data));
    }
  }

  /**
   * Run Length Encoding simple
   */
  runLengthEncode(data) {
    let encoded = '';
    let count = 1;
    let current = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] === current && count < 9) {
        count++;
      } else {
        encoded += count > 1 ? `${count}${current}` : current;
        current = data[i];
        count = 1;
      }
    }
    
    encoded += count > 1 ? `${count}${current}` : current;
    return encoded;
  }

  /**
   * Run Length Decoding
   */
  runLengthDecode(data) {
    let decoded = '';
    let i = 0;
    
    while (i < data.length) {
      if (i + 1 < data.length && /\d/.test(data[i])) {
        const count = parseInt(data[i]);
        const char = data[i + 1];
        decoded += char.repeat(count);
        i += 2;
      } else {
        decoded += data[i];
        i++;
      }
    }
    
    return decoded;
  }

  /**
   * Determinar si vale la pena comprimir
   */
  shouldCompress(data, options = {}) {
    if (!this.compressionEnabled) return false;
    if (options.forceCompress) return true;
    if (data.length < this.compressionThreshold) return false;
    
    // No comprimir datos ya comprimidos (heurística simple)
    const entropy = this.calculateEntropy(data.substring(0, 1000));
    return entropy > 0.7; // Solo comprimir si hay suficiente redundancia
  }

  /**
   * Calcular entropía simple para determinar compresibilidad
   */
  calculateEntropy(data) {
    const freq = {};
    for (const char of data) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = data.length;
    
    for (const count of Object.values(freq)) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy / Math.log2(256); // Normalizar
  }

  /**
   * Actualizar estadísticas de compresión
   */
  updateStats(result, startTime) {
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    this.compressionStats.totalCompressions++;
    this.compressionStats.totalBytesSaved += (result.originalSize - result.compressedSize);
    this.compressionStats.compressionTime += processingTime;
    
    // Actualizar promedio de ratio de compresión
    const totalRatio = this.compressionStats.averageCompressionRatio * (this.compressionStats.totalCompressions - 1);
    this.compressionStats.averageCompressionRatio = (totalRatio + result.compressionRatio) / this.compressionStats.totalCompressions;
  }

  /**
   * Actualizar estadísticas de descompresión
   */
  updateDecompressionStats(startTime) {
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    this.compressionStats.totalDecompressions++;
    this.compressionStats.decompressionTime += processingTime;
  }

  /**
   * Obtener estadísticas de compresión
   */
  getStats() {
    return {
      ...this.compressionStats,
      averageCompressionTime: this.compressionStats.compressionTime / Math.max(this.compressionStats.totalCompressions, 1),
      averageDecompressionTime: this.compressionStats.decompressionTime / Math.max(this.compressionStats.totalDecompressions, 1),
      currentMethod: this.currentMethod,
      compressionEnabled: this.compressionEnabled,
      compressionThreshold: this.compressionThreshold
    };
  }

  /**
   * Configurar método de compresión
   */
  setCompressionMethod(method) {
    if (this.compressionMethods[method]) {
      this.currentMethod = method;
      logger.debug('COMPRESSION', `Compression method changed to: ${method}`);
    } else {
      logger.warn('COMPRESSION', `Unknown compression method: ${method}`);
    }
  }

  /**
   * Habilitar/deshabilitar compresión
   */
  setCompressionEnabled(enabled) {
    this.compressionEnabled = enabled;
    logger.debug('COMPRESSION', `Compression ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Configurar umbral de compresión
   */
  setCompressionThreshold(threshold) {
    this.compressionThreshold = threshold;
    logger.debug('COMPRESSION', `Compression threshold set to: ${threshold} bytes`);
  }

  /**
   * Resetear estadísticas
   */
  resetStats() {
    this.compressionStats = {
      totalCompressions: 0,
      totalDecompressions: 0,
      totalBytesSaved: 0,
      averageCompressionRatio: 0,
      compressionTime: 0,
      decompressionTime: 0
    };
  }
}

// Instancia singleton
export const compressionManager = new CompressionManager();
export default compressionManager;