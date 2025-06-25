/**
 * Cache utilities for persistent data storage
 */

const CACHE_PREFIX = 'nuvo-cache-';
const DEFAULT_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Saves data to localStorage with expiration
 */
export const cacheData = (key, data, expiryMs = DEFAULT_EXPIRY) => {
  try {
    const item = {
      data,
      expiry: Date.now() + expiryMs
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Cache save error:', error);
    return false;
  }
};

/**
 * Retrieves data from cache if it exists and hasn't expired
 */
export const getCachedData = (key) => {
  try {
    const cachedItem = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cachedItem) return null;
    
    const { data, expiry } = JSON.parse(cachedItem);
    
    if (Date.now() > expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};

/**
 * Clears all cached data or specific key
 */
export const clearCache = (key = null) => {
  try {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      // Clear all cached items
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    }
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Prefetches a list of keys using a fetch function and caches them.
 * @param {Array<string>} keys
 * @param {Function} fetchFn
 * @param {number} expiryMs
 */
export const prefetchCacheData = async (keys, fetchFn, expiryMs = DEFAULT_EXPIRY) => {
  for (const key of keys) {
    try {
      const data = await fetchFn(key);
      cacheData(key, data, expiryMs);
    } catch (e) {
      // Ignore prefetch errors
    }
  }
};

/**
 * Clears all cache entries with a given prefix (group invalidation)
 */
export const clearCacheByPrefix = (prefix) => {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(CACHE_PREFIX + prefix))
      .forEach(k => localStorage.removeItem(k));
    return true;
  } catch (error) {
    console.error('Cache clear by prefix error:', error);
    return false;
  }
};
