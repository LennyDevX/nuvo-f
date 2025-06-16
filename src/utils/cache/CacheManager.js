import { logger } from '../debug/logger';

export class CacheManager {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.ttls = new Map();
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      clears: 0
    };
  }

  async get(key, fetchFn, ttl = 60000) {
    const now = Date.now();
    const cached = this.cache.get(key);
    const expiry = this.ttls.get(key);

    // Check if we have a valid cached item
    if (cached && expiry && now < expiry) {
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    
    // If no fetch function provided, just return the cached value or null
    if (!fetchFn) return cached || null;

    // Fetch new data
    try {
      const data = await fetchFn();
      
      // Only cache if we got valid data
      if (data !== undefined && data !== null) {
        this.set(key, data, ttl);
      }
      return data;
    } catch (error) {
      console.error(`Error fetching data for cache key ${key}:`, error);
      
      // If we have stale data, return it as fallback
      if (cached) {
        logger.throttledLog('WARN', 'CACHE', `Returning stale data for ${key} due to fetch error`, null, 30000);
      }
    }
  }

  set(key, data, ttl) {
    this.stats.sets++;
    
    // Implement LRU eviction if cache exceeds max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this._getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.ttls.delete(oldestKey);
      }
    }
    
    this.cache.set(key, data);
    this.ttls.set(key, Date.now() + ttl);
  }

  clear(key) {
    this.stats.clears++;
    
    if (key) {
      this.cache.delete(key);
      this.ttls.delete(key);
    } else {
      this.cache.clear();
      this.ttls.clear();
    }
  }
  
  // Find the key with the oldest expiry time
  _getOldestKey() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, expiry] of this.ttls.entries()) {
      if (expiry < oldestTime) {
        oldestTime = expiry;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
  
  // Clean expired items
  purgeExpired() {
    const now = Date.now();
    for (const [key, expiry] of this.ttls.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttls.delete(key);
      }
    }
  }
  
  // Get statistics about the cache usage
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses || 1)
    };
  }
}

export const globalCache = new CacheManager();

// Automatically clean expired items every minute
setInterval(() => {
  globalCache.purgeExpired();
}, 60000);
