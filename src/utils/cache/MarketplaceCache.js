import { logger } from '../debug/logger';
import { cacheMetrics } from './CacheMetrics';
import { CACHE_TTL, CLEANUP_CONFIG } from './cacheConfig';

// Marketplace Cache Management System
class MarketplaceCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = CACHE_TTL.DEFAULT;
    this.METADATA_TTL = CACHE_TTL.NFT_METADATA;
    this.LISTING_TTL = CACHE_TTL.MARKETPLACE_LISTINGS;
    
    // Registrar en el sistema de métricas
    cacheMetrics.registerCache('marketplace', {
      maxSize: 200,
      domain: 'marketplace'
    });
    
    // Limpieza progresiva
    this.setupProgressiveCleanup();
    
    logger.debug('CACHE', 'MarketplaceCache initialized');
  }

  // Configurar limpieza progresiva
  setupProgressiveCleanup() {
    setInterval(() => {
      this.progressiveCleanup();
    }, CLEANUP_CONFIG.INTERVAL);
  }

  // Limpieza progresiva
  progressiveCleanup() {
    const startTime = Date.now();
    const now = Date.now();
    let cleaned = 0;
    
    const entries = Array.from(this.timestamps.entries());
    
    for (const [key, timestamp] of entries) {
      if (Date.now() - startTime > CLEANUP_CONFIG.MAX_CLEANUP_TIME) {
        break;
      }
      
      if (cleaned >= CLEANUP_CONFIG.BATCH_SIZE) {
        break;
      }
      
      if (now - timestamp.created > timestamp.ttl) {
        this.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.throttledLog('DEBUG', 'CACHE', `Marketplace cleanup removed ${cleaned} expired entries`, null, 30000);
      cacheMetrics.updateMemoryUsage(this.getMemoryUsage());
    }
  }

  // Generate cache key
  generateKey(type, identifier, contractAddress) {
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
    cacheMetrics.recordSet('marketplace', this.cache.size);
    
    logger.throttledLog('DEBUG', 'CACHE', `Set marketplace cache key: ${key}`, { ttl: customTTL || this.TTL }, 10000);
  }

  // Get from cache with TTL check y métricas
  get(key) {
    const startTime = performance.now();
    
    if (!this.cache.has(key)) {
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordMiss('marketplace', responseTime);
      return null;
    }
    
    const timestamp = this.timestamps.get(key);
    if (!timestamp) {
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordMiss('marketplace', responseTime);
      return null;
    }
    
    const now = Date.now();
    if (now - timestamp.created > timestamp.ttl) {
      this.delete(key);
      const responseTime = performance.now() - startTime;
      cacheMetrics.recordMiss('marketplace', responseTime);
      return null;
    }
    
    const responseTime = performance.now() - startTime;
    cacheMetrics.recordHit('marketplace', responseTime);
    
    return this.cache.get(key);
  }

  // Delete cache entry con métricas
  delete(key) {
    const deleted = this.cache.delete(key);
    this.timestamps.delete(key);
    
    if (deleted) {
      cacheMetrics.recordDelete('marketplace', this.cache.size);
      logger.throttledLog('DEBUG', 'CACHE', `Deleted marketplace cache key: ${key}`, null, 10000);
    }
    
    return deleted;
  }

  // Clear all cache con métricas
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    cacheMetrics.recordClear('marketplace');
    
    logger.info('CACHE', 'Marketplace cache cleared');
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

  // Cache marketplace listings con TTL configurado
  setMarketplaceListings(contractAddress, listings) {
    const key = this.generateKey('marketplace_listings', 'all', contractAddress);
    this.set(key, listings, CACHE_TTL.MARKETPLACE_LISTINGS);
  }

  getMarketplaceListings(contractAddress) {
    const key = this.generateKey('marketplace_listings', 'all', contractAddress);
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

  // Cache token listing status con TTL configurado
  setTokenListing(contractAddress, tokenId, listingData) {
    const key = this.generateKey('token_listing', tokenId, contractAddress);
    // Ensure category is normalized when caching
    if (listingData && listingData.category) {
      const { normalizeCategory } = require('../blockchain/blockchainUtils');
      listingData.normalizedCategory = normalizeCategory(listingData.category);
    }
    this.set(key, listingData, CACHE_TTL.TOKEN_LISTING);
  }

  getTokenListing(contractAddress, tokenId) {
    const key = this.generateKey('token_listing', tokenId, contractAddress);
    return this.get(key);
  }

  // Cache stats con TTL configurado
  setMarketplaceStats(contractAddress, stats) {
    const key = this.generateKey('marketplace_stats', 'all', contractAddress);
    this.set(key, stats, CACHE_TTL.MARKETPLACE_STATS);
  }

  getMarketplaceStats(contractAddress) {
    const key = this.generateKey('marketplace_stats', 'all', contractAddress);
    return this.get(key);
  }

  // Invalidate specific data con logging mejorado
  invalidateMarketplace(contractAddress) {
    const patterns = [
      `marketplace_listings_all_${contractAddress}`,
      `marketplace_stats_all_${contractAddress}`
    ];
    
    let invalidated = 0;
    
    // Also invalidate individual token listings
    for (const [key] of this.cache) {
      if (key.includes(`token_listing`) && key.includes(contractAddress)) {
        if (this.delete(key)) {
          invalidated++;
        }
      }
    }
    
    for (const pattern of patterns) {
      if (this.delete(pattern)) {
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      logger.info('CACHE', `Invalidated ${invalidated} marketplace cache entries`, { contractAddress });
    }
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
        console.warn('Failed to serialize marketplace cache value for memory calculation:', error);
        totalSize += 150; // Estimación para datos de marketplace
        totalSize += key.length * 2;
      }
    }
    return totalSize;
  }

  // Get cache info for debugging con métricas mejoradas
  getCacheInfo() {
    const metrics = cacheMetrics.getCacheMetrics('marketplace');
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
}

// Export singleton instance
export const marketplaceCache = new MarketplaceCache();

export default marketplaceCache;
