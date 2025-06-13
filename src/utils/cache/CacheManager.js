/**
 * Advanced Cache Manager with multiple storage strategies
 * Provides in-memory, localStorage, and sessionStorage caching
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxMemorySize = 1000; // Maximum items in memory cache
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Generate cache key with namespace support
   */
  _generateKey(namespace, key) {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Check if data has expired
   */
  _isExpired(item) {
    return Date.now() > item.expiresAt;
  }

  /**
   * Cleanup expired items from memory cache
   */
  _cleanupMemory() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Enforce memory cache size limit
   */
  _enforceMemoryLimit() {
    if (this.memoryCache.size > this.maxMemorySize) {
      // Remove oldest entries (LRU-style)
      const entries = Array.from(this.memoryCache.entries());
      const sortedEntries = entries.sort((a, b) => a[1].accessedAt - b[1].accessedAt);
      const toRemove = sortedEntries.slice(0, this.memoryCache.size - this.maxMemorySize);
      
      toRemove.forEach(([key]) => {
        this.memoryCache.delete(key);
      });
    }
  }

  /**
   * Set item in cache with multiple storage options
   */
  set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      namespace = '',
      storage = 'memory', // 'memory', 'localStorage', 'sessionStorage'
      compress = false
    } = options;

    const fullKey = this._generateKey(namespace, key);
    const expiresAt = Date.now() + ttl;
    const item = {
      value,
      expiresAt,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      namespace,
      compressed: compress
    };

    try {
      if (storage === 'memory') {
        this.memoryCache.set(fullKey, item);
        this._enforceMemoryLimit();
      } else if (storage === 'localStorage' && typeof window !== 'undefined') {
        const serialized = JSON.stringify(item);
        localStorage.setItem(`cache_${fullKey}`, serialized);
      } else if (storage === 'sessionStorage' && typeof window !== 'undefined') {
        const serialized = JSON.stringify(item);
        sessionStorage.setItem(`cache_${fullKey}`, serialized);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.warn(`Cache set error for key ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * Get item from cache with fallback chain
   */
  get(key, options = {}) {
    const {
      namespace = '',
      storage = 'memory'
    } = options;

    const fullKey = this._generateKey(namespace, key);

    try {
      let item = null;

      // Try memory cache first
      if (storage === 'memory' || storage === 'auto') {
        item = this.memoryCache.get(fullKey);
        
        if (item) {
          if (this._isExpired(item)) {
            this.memoryCache.delete(fullKey);
            item = null;
          } else {
            item.accessedAt = Date.now();
            this.stats.hits++;
            return item.value;
          }
        }
      }

      // Try localStorage if memory cache missed
      if ((storage === 'localStorage' || storage === 'auto') && typeof window !== 'undefined') {
        const stored = localStorage.getItem(`cache_${fullKey}`);
        if (stored) {
          try {
            item = JSON.parse(stored);
            if (this._isExpired(item)) {
              localStorage.removeItem(`cache_${fullKey}`);
              item = null;
            } else {
              this.stats.hits++;
              return item.value;
            }
          } catch (parseError) {
            localStorage.removeItem(`cache_${fullKey}`);
          }
        }
      }

      // Try sessionStorage if others missed
      if ((storage === 'sessionStorage' || storage === 'auto') && typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(`cache_${fullKey}`);
        if (stored) {
          try {
            item = JSON.parse(stored);
            if (this._isExpired(item)) {
              sessionStorage.removeItem(`cache_${fullKey}`);
              item = null;
            } else {
              this.stats.hits++;
              return item.value;
            }
          } catch (parseError) {
            sessionStorage.removeItem(`cache_${fullKey}`);
          }
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.warn(`Cache get error for key ${fullKey}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key, options = {}) {
    return this.get(key, options) !== null;
  }

  /**
   * Delete item from cache
   */
  delete(key, options = {}) {
    const {
      namespace = '',
      storage = 'all'
    } = options;

    const fullKey = this._generateKey(namespace, key);
    let deleted = false;

    try {
      if (storage === 'memory' || storage === 'all') {
        deleted = this.memoryCache.delete(fullKey) || deleted;
      }

      if ((storage === 'localStorage' || storage === 'all') && typeof window !== 'undefined') {
        if (localStorage.getItem(`cache_${fullKey}`)) {
          localStorage.removeItem(`cache_${fullKey}`);
          deleted = true;
        }
      }

      if ((storage === 'sessionStorage' || storage === 'all') && typeof window !== 'undefined') {
        if (sessionStorage.getItem(`cache_${fullKey}`)) {
          sessionStorage.removeItem(`cache_${fullKey}`);
          deleted = true;
        }
      }

      if (deleted) {
        this.stats.deletes++;
      }

      return deleted;
    } catch (error) {
      console.warn(`Cache delete error for key ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * Clear cache by namespace or all
   */
  clear(namespace = null) {
    try {
      if (namespace) {
        // Clear specific namespace
        const prefix = `${namespace}:`;
        
        // Clear memory cache
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            this.memoryCache.delete(key);
          }
        }

        // Clear localStorage
        if (typeof window !== 'undefined') {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`cache_${prefix}`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));

          // Clear sessionStorage
          const sessionKeysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(`cache_${prefix}`)) {
              sessionKeysToRemove.push(key);
            }
          }
          sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
        }
      } else {
        // Clear all caches
        this.memoryCache.clear();
        
        if (typeof window !== 'undefined') {
          // Clear all cache entries from localStorage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));

          // Clear all cache entries from sessionStorage
          const sessionKeysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('cache_')) {
              sessionKeysToRemove.push(key);
            }
          }
          sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
        }
      }

      return true;
    } catch (error) {
      console.warn('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (memoization)
   */
  async getOrSet(key, fn, options = {}) {
    const cached = this.get(key, options);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fn();
      this.set(key, value, options);
      return value;
    } catch (error) {
      console.warn(`Cache getOrSet error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  setMany(items, options = {}) {
    const results = [];
    for (const [key, value] of items) {
      results.push(this.set(key, value, options));
    }
    return results;
  }

  getMany(keys, options = {}) {
    return keys.map(key => this.get(key, options));
  }

  /**
   * Cache statistics
   */
  getStats() {
    this._cleanupMemory();
    
    return {
      ...this.stats,
      memorySize: this.memoryCache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      maxMemorySize: this.maxMemorySize
    };
  }

  /**
   * Export cache data (for debugging or backup)
   */
  export(namespace = null) {
    const data = {};
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (!namespace || key.startsWith(`${namespace}:`)) {
        if (!this._isExpired(item)) {
          data[key] = {
            value: item.value,
            expiresAt: item.expiresAt,
            namespace: item.namespace
          };
        }
      }
    }
    
    return data;
  }

  /**
   * Import cache data
   */
  import(data) {
    try {
      for (const [key, item] of Object.entries(data)) {
        if (!this._isExpired(item)) {
          this.memoryCache.set(key, {
            ...item,
            accessedAt: Date.now()
          });
        }
      }
      return true;
    } catch (error) {
      console.warn('Cache import error:', error);
      return false;
    }
  }

  /**
   * Cleanup expired entries across all storage types
   */
  cleanup() {
    this._cleanupMemory();
    
    if (typeof window !== 'undefined') {
      // Cleanup localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (this._isExpired(item)) {
              keysToRemove.push(key);
            }
          } catch (error) {
            keysToRemove.push(key); // Remove invalid entries
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Cleanup sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const item = JSON.parse(sessionStorage.getItem(key));
            if (this._isExpired(item)) {
              sessionKeysToRemove.push(key);
            }
          } catch (error) {
            sessionKeysToRemove.push(key); // Remove invalid entries
          }
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 10 * 60 * 1000);
}

// Export singleton instance as globalCache for backward compatibility
export const globalCache = cacheManager;

export default cacheManager;

// Named exports for convenience
export const {
  set: setCache,
  get: getCache,
  has: hasCache,
  delete: deleteCache,
  clear: clearCache,
  getOrSet: getOrSetCache,
  getStats: getCacheStats
} = cacheManager;
