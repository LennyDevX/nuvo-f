export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  async get(key, fetchFn, ttl = 60000) {
    const now = Date.now();
    const cached = this.cache.get(key);
    const expiry = this.ttls.get(key);

    if (cached && expiry && now < expiry) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }

  set(key, data, ttl) {
    this.cache.set(key, data);
    this.ttls.set(key, Date.now() + ttl);
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
      this.ttls.delete(key);
    } else {
      this.cache.clear();
      this.ttls.clear();
    }
  }
}

export const globalCache = new CacheManager();
