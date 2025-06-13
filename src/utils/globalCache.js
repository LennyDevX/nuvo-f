/**
 * Global Cache Utility
 * Simple, lightweight caching system for the application
 */

class GlobalCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.maxSize = 1000; // Maximum number of cached items
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Enforce cache size limit
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries (simple LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
    
    return value;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   * @param {string} key - Cache key
   * @returns {boolean} - True if key existed and was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached items
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   * @returns {number} - Number of expired entries removed
   */
  cleanup() {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    return removedCount;
  }

  /**
   * Get or set with a function (memoization pattern)
   * @param {string} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Promise<any>}
   */
  async getOrSet(key, fn, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fn();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }

  /**
   * Set multiple values at once
   * @param {Array} entries - Array of [key, value, ttl] tuples
   */
  setMany(entries) {
    entries.forEach(([key, value, ttl]) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Get multiple values at once
   * @param {Array} keys - Array of cache keys
   * @returns {Array} - Array of values (null for missing/expired keys)
   */
  getMany(keys) {
    return keys.map(key => this.get(key));
  }

  /**
   * Get cache statistics
   * @returns {object}
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;
    let oldestEntry = now;
    let newestEntry = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expired++;
      } else {
        valid++;
      }
      
      if (item.createdAt < oldestEntry) {
        oldestEntry = item.createdAt;
      }
      
      if (item.createdAt > newestEntry) {
        newestEntry = item.createdAt;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize,
      hitRate: valid / (valid + expired) || 0,
      oldestEntry: oldestEntry === now ? null : new Date(oldestEntry),
      newestEntry: newestEntry === 0 ? null : new Date(newestEntry)
    };
  }

  /**
   * Get all keys (for debugging)
   * @returns {Array}
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values (for debugging)
   * @returns {Array}
   */
  values() {
    const now = Date.now();
    return Array.from(this.cache.values())
      .filter(item => now <= item.expiresAt)
      .map(item => item.value);
  }

  /**
   * Export cache data (for persistence)
   * @returns {object}
   */
  export() {
    const data = {};
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now <= item.expiresAt) {
        data[key] = {
          value: item.value,
          expiresAt: item.expiresAt,
          createdAt: item.createdAt
        };
      }
    }
    
    return data;
  }

  /**
   * Import cache data (from persistence)
   * @param {object} data - Exported cache data
   * @returns {number} - Number of items imported
   */
  import(data) {
    const now = Date.now();
    let importedCount = 0;
    
    for (const [key, item] of Object.entries(data)) {
      if (now <= item.expiresAt) {
        this.cache.set(key, item);
        importedCount++;
      }
    }
    
    return importedCount;
  }
}

// Create singleton instance
const globalCache = new GlobalCache();

// Auto cleanup every 5 minutes
setInterval(() => {
  const removed = globalCache.cleanup();
  if (removed > 0) {
    console.log(`Cleaned up ${removed} expired cache entries`);
  }
}, 5 * 60 * 1000);

export default globalCache;
