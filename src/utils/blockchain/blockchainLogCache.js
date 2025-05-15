/**
 * Utility to manage blockchain log fetching and caching to prevent excessive API calls
 */

// Cache store for log query results
const logQueryCache = new Map();

// Default cache duration - 5 minutes
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// Track ongoing queries to prevent duplicates
const ongoingQueries = new Set();

/**
 * Check if we should fetch logs or use cached results
 * @param {string} key - Cache key (usually address + contract + block range)
 * @param {number} cacheDuration - How long to keep cache valid in ms
 * @returns {boolean} - True if we should fetch new logs, false if using cache
 */
export function shouldFetchLogs(key, cacheDuration = DEFAULT_CACHE_DURATION) {
  // If query is ongoing, don't start another one
  if (ongoingQueries.has(key)) {
    console.log(`[LogCache] Query already in progress for ${key}, skipping`);
    return false;
  }
  
  const cachedItem = logQueryCache.get(key);
  if (cachedItem) {
    const isExpired = Date.now() - cachedItem.timestamp > cacheDuration;
    if (!isExpired) {
      console.log(`[LogCache] Using cached logs for ${key}`);
      return false;
    }
    console.log(`[LogCache] Cache expired for ${key}, will fetch fresh logs`);
  }
  
  return true;
}

/**
 * Cache log query result
 * @param {string} key - Cache key
 * @param {any} result - Query result to cache
 */
export function cacheLogResult(key, result) {
  logQueryCache.set(key, {
    timestamp: Date.now(),
    result
  });
  ongoingQueries.delete(key); // Remove from ongoing queries
}

/**
 * Get cached log query result
 * @param {string} key - Cache key
 * @returns {any|null} - Cached result or null if not found
 */
export function getCachedLogs(key) {
  const cachedItem = logQueryCache.get(key);
  return cachedItem ? cachedItem.result : null;
}

/**
 * Mark log query as in progress
 * @param {string} key - Cache key
 */
export function markLogQueryInProgress(key) {
  ongoingQueries.add(key);
}

/**
 * Clear a specific cached item
 * @param {string} key - Cache key
 */
export function clearLogCache(key) {
  logQueryCache.delete(key);
}

/**
 * Clear all log cache data
 */
export function clearAllLogCache() {
  logQueryCache.clear();
}
