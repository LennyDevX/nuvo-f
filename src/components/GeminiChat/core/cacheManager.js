export class EnhancedCacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour
    this.cache = new Map();
    this.accessTimes = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + ttl;
    const entry = {
      value,
      expiresAt,
      size: this.calculateSize(value),
      accessCount: 0,
      createdAt: Date.now()
    };

    this.cache.set(key, entry);
    this.accessTimes.set(key, Date.now());
    
    return true;
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    this.accessTimes.set(key, Date.now());
    
    return entry.value;
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  // LRU eviction
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  calculateSize(value) {
    if (typeof value === 'string') {
      return value.length * 2; // Rough estimate for UTF-16
    }
    return JSON.stringify(value).length * 2;
  }

  getStats() {
    const now = Date.now();
    let totalSize = 0;
    let expiredCount = 0;

    for (const [key, entry] of this.cache) {
      totalSize += entry.size;
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalSize,
      expiredCount,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  calculateHitRate() {
    let totalAccess = 0;
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
    }
    return totalAccess / Math.max(this.cache.size, 1);
  }

  estimateMemoryUsage() {
    let usage = 0;
    for (const entry of this.cache.values()) {
      usage += entry.size;
    }
    return usage;
  }

  // Preload popular responses
  preloadCache(popularQueries) {
    return Promise.all(
      popularQueries.map(async query => {
        if (!this.has(query.key)) {
          // Simulate preloading - in real app, fetch from API
          return new Promise(resolve => {
            setTimeout(() => {
              this.set(query.key, query.response, query.ttl || this.defaultTTL);
              resolve();
            }, 10);
          });
        }
      })
    );
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton instance
export const enhancedCache = new EnhancedCacheManager({
  maxSize: 150,
  defaultTTL: 3600000 // 1 hour
});
