import { logger } from '../debug/logger.js';
import { CacheManager } from './CacheManager.js';
import { cacheMetrics } from './CacheMetrics.js';
import { CACHE_TTL, CLEANUP_CONFIG } from './cacheConfig.js';

// NFT Collection Cache Management System
class NFTCollectionCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = CACHE_TTL.DEFAULT;
    this.METADATA_TTL = CACHE_TTL.NFT_METADATA;
    this.USER_NFTS_TTL = CACHE_TTL.USER_NFTS;
    
    // Registrar en el sistema de métricas
    cacheMetrics.registerCache('nft-collection', {
      maxSize: 100,
      domain: 'nft'
    });
    
    // Limpieza progresiva
    this.setupProgressiveCleanup();
    
    logger.debug('CACHE', 'NFTCollectionCache initialized');
  }

  // Configurar limpieza progresiva
  setupProgressiveCleanup() {
    setInterval(() => {
      this.progressiveCleanup();
    }, CLEANUP_CONFIG.INTERVAL);
  }

  // Limpieza progresiva en lugar de limpieza masiva
  progressiveCleanup() {
    const startTime = Date.now();
    const now = Date.now();
    let cleaned = 0;
    
    // Convertir a array para poder iterar de forma controlada
    const entries = Array.from(this.timestamps.entries());
    
    for (const [key, timestamp] of entries) {
      // Limitar tiempo de ejecución
      if (Date.now() - startTime > CLEANUP_CONFIG.MAX_CLEANUP_TIME) {
        break;
      }
      
      // Limitar número de elementos por lote
      if (cleaned >= CLEANUP_CONFIG.BATCH_SIZE) {
        break;
      }
      
      if (now - timestamp.created > timestamp.ttl) {
        this.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.throttledLog('DEBUG', 'CACHE', `Progressive cleanup removed ${cleaned} expired entries`, null, 30000);
      cacheMetrics.updateMemoryUsage(this.getMemoryUsage());
    }
  }

  // Generate cache key
  generateKey(type, identifier, contractAddress = 'global') {
    return `${type}_${identifier}_${contractAddress}`;
  }

  // Set cache with custom TTL y métricas
  set(key, value, customTTL = null) {
    const startTime = performance.now();
    
    this.cache.set(key, value);
    this.timestamps.set(key, {
      created: Date.now(),
      ttl: customTTL || this.TTL
    });
    
    const responseTime = performance.now() - startTime;
    cacheMetrics.recordSet('nft-collection', this.cache.size);
    
    logger.throttledLog('DEBUG', 'CACHE', `Set cache key: ${key}`, { ttl: customTTL || this.TTL }, 10000);
  }

  // Get from cache with TTL check y métricas
  get(key) {
    const startTime = performance.now();
    
    if (!this.cache.has(key)) {
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordMiss('nft-collection', responseTime);
      return null;
    }
    
    const timestamp = this.timestamps.get(key);
    if (!timestamp) {
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordMiss('nft-collection', responseTime);
      return null;
    }
    
    const now = Date.now();
    if (now - timestamp.created > timestamp.ttl) {
      this.delete(key);
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordMiss('nft-collection', responseTime);
      return null;
    }
    
    const responseTime = performance.now() - startTime;
    cacheMetrics.recordHit('nft-collection', responseTime);
    
    return this.cache.get(key);
  }

  // Delete cache entry con métricas
  delete(key) {
    const deleted = this.cache.delete(key);
    this.timestamps.delete(key);
    
    if (deleted) {
      cacheMetrics.recordDelete('nft-collection', this.cache.size);
      logger.throttledLog('DEBUG', 'CACHE', `Deleted cache key: ${key}`, null, 10000);
    }
    
    return deleted;
  }

  // Clear all cache con métricas
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    cacheMetrics.recordClear('nft-collection');
    
    logger.info('CACHE', 'NFT Collection cache cleared');
  }

  // Clear expired entries
  clearExpired() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp.created > timestamp.ttl) {
        this.delete(key);
      }
    }
  }

  // Cache user NFTs con TTL configurado
  setUserNFTs(userAddress, contractAddress, nfts) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    this.set(key, nfts, CACHE_TTL.USER_NFTS);
  }

  getUserNFTs(userAddress, contractAddress) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    return this.get(key);
  }

  // Cache token metadata con TTL configurado
  setTokenMetadata(tokenURI, metadata) {
    const key = this.generateKey('metadata', tokenURI, 'global');
    this.set(key, metadata, CACHE_TTL.NFT_METADATA);
  }

  getTokenMetadata(tokenURI) {
    const key = this.generateKey('metadata', tokenURI, 'global');
    return this.get(key);
  }

  // Cache individual NFT data con TTL configurado
  setNFTData(contractAddress, tokenId, nftData) {
    const key = this.generateKey('nft_data', tokenId, contractAddress);
    this.set(key, nftData, CACHE_TTL.NFT_DATA);
  }

  getNFTData(contractAddress, tokenId) {
    const key = this.generateKey('nft_data', tokenId, contractAddress);
    return this.get(key);
  }

  // Cache user's created tokens
  setUserCreatedTokens(userAddress, contractAddress, tokens) {
    const key = this.generateKey('user_created', userAddress, contractAddress);
    this.set(key, tokens, this.USER_NFTS_TTL);
  }

  getUserCreatedTokens(userAddress, contractAddress) {
    const key = this.generateKey('user_created', userAddress, contractAddress);
    return this.get(key);
  }

  // Cache user stats con TTL configurado
  setUserStats(userAddress, contractAddress, stats) {
    const key = this.generateKey('user_stats', userAddress, contractAddress);
    this.set(key, stats, CACHE_TTL.USER_STATS);
  }

  getUserStats(userAddress, contractAddress) {
    const key = this.generateKey('user_stats', userAddress, contractAddress);
    return this.get(key);
  }

  // Invalidate specific user data con logging mejorado
  invalidateUserData(userAddress, contractAddress) {
    const patterns = [
      `user_nfts_${userAddress}_${contractAddress}`,
      `user_created_${userAddress}_${contractAddress}`,
      `user_stats_${userAddress}_${contractAddress}`
    ];
    
    let invalidated = 0;
    for (const pattern of patterns) {
      if (this.delete(pattern)) {
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      logger.info('CACHE', `Invalidated ${invalidated} user cache entries`, { userAddress, contractAddress });
    }
  }

  // Invalidate all user NFT data across contracts
  invalidateAllUserData(userAddress) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`_${userAddress}_`)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  // Get cache status for a specific user
  getUserCacheStatus(userAddress, contractAddress) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp) return null;
    
    const now = Date.now();
    const age = now - timestamp.created;
    const remaining = Math.max(0, timestamp.ttl - age);
    
    return {
      cached: true,
      age: Math.round(age / 1000),
      remaining: Math.round(remaining / 1000),
      expired: remaining <= 0,
      createdAt: new Date(timestamp.created).toLocaleTimeString()
    };
  }

  // Obtener uso de memoria estimado con manejo de BigInt
  getMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      try {
        // Función personalizada para manejar BigInt
        const stringifiedValue = JSON.stringify(value, (key, val) => {
          if (typeof val === 'bigint') {
            return val.toString();
          }
          return val;
        });
        totalSize += stringifiedValue.length * 2; // UTF-16
        totalSize += key.length * 2;
      } catch (error) {
        // Si falla la serialización, usar aproximación básica
        console.warn('Failed to serialize NFT cache value for memory calculation:', error);
        totalSize += 200; // Estimación más alta para NFTs (tienen más metadata)
        totalSize += key.length * 2;
      }
    }
    return totalSize;
  }

  // Get cache info for debugging con métricas mejoradas
  getCacheInfo() {
    const metrics = cacheMetrics.getCacheMetrics('nft-collection');
    const memoryUsage = this.getMemoryUsage();
    
    const info = {
      totalEntries: this.cache.size,
      memoryUsage: cacheMetrics.formatBytes(memoryUsage),
      metrics,
      entries: []
    };
    
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      const age = now - timestamp.created;
      const remaining = Math.max(0, timestamp.ttl - age);
      info.entries.push({
        key,
        age: Math.round(age / 1000),
        remaining: Math.round(remaining / 1000),
        expired: remaining <= 0
      });
    }
    
    return info;
  }

  // Batch invalidate metadata for specific tokens
  invalidateTokensMetadata(tokenURIs) {
    for (const uri of tokenURIs) {
      const key = this.generateKey('metadata', uri, 'global');
      this.delete(key);
    }
  }

  // Check if user data needs refresh
  shouldRefreshUserData(userAddress, contractAddress, forceAfterMs = 5 * 60 * 1000) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp) return true;
    
    const now = Date.now();
    return (now - timestamp.created) > forceAfterMs;
  }
}

// Export singleton instance
export const nftCollectionCache = new NFTCollectionCache();

export default nftCollectionCache;
