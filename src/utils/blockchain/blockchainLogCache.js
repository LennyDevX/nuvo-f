/**
 * Utility to manage blockchain log fetching and caching to prevent excessive API calls
 */

const inProgressQueries = new Map();
const logCache = new Map();
const LOG_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Add direct exports for standalone functions 
export function getCachedLogs(queryKey) {
  const cachedItem = logCache.get(queryKey);
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.logs;
  }
  return null;
}

// Add the missing markLogQueryInProgress export function
export function markLogQueryInProgress(queryKey, promise) {
  // Add safety check to prevent error when promise is undefined
  if (!promise || typeof promise.finally !== 'function') {
    console.warn(`Invalid promise provided for query ${queryKey}`);
    // Create a resolved promise as fallback
    promise = Promise.resolve([]);
  }
  
  inProgressQueries.set(queryKey, promise);
  return promise.finally(() => {
    inProgressQueries.delete(queryKey);
  });
}

// Add the missing shouldFetchLogs export function
export function shouldFetchLogs(queryKey, options = {}) {
  // Check if we have a valid cache entry
  const cachedItem = logCache.get(queryKey);
  
  // Should fetch if:
  // 1. No cache exists
  // 2. Cache has expired
  // 3. Force refresh is requested via options
  const shouldFetch = 
    !cachedItem || 
    cachedItem.expiry <= Date.now() || 
    options.forceRefresh === true;
    
  return shouldFetch;
}

/**
 * Improved log cache with deduplication and batching
 */
export const logCacheManager = {
  /**
   * Generate a unique key for the query
   */
  getQueryKey(contract, eventFilter, fromBlock, toBlock) {
    const addressPart = contract.address;
    const topicsPart = eventFilter.topics ? eventFilter.topics.join('-') : 'all';
    return `logs_${addressPart}_${topicsPart}_${fromBlock}_${toBlock}`;
  },

  /**
   * Check if a query is already in progress
   */
  isQueryInProgress(queryKey) {
    return inProgressQueries.has(queryKey);
  },

  /**
   * Mark a query as in progress
   */
  markQueryInProgress(queryKey, promise) {
    // Use the standalone function to maintain consistency
    return markLogQueryInProgress(queryKey, promise);
  },

  /**
   * Get cached logs if available
   */
  getCachedLogs(queryKey) {
    const cachedItem = logCache.get(queryKey);
    if (cachedItem && cachedItem.expiry > Date.now()) {
      return cachedItem.logs;
    }
    return null;
  },

  /**
   * Cache logs with expiration
   */
  cacheLogs(queryKey, logs) {
    logCache.set(queryKey, {
      logs,
      expiry: Date.now() + LOG_CACHE_DURATION
    });
    return logs;
  },

  /**
   * Clear cache items if needed (e.g., on wallet changes)
   */
  clearCache() {
    logCache.clear();
  }
};

/**
 * Fetches logs with caching and deduplication
 */
export async function fetchLogsWithCache(contract, eventFilter, fromBlock, toBlock, options = {}) {
  const queryKey = logCacheManager.getQueryKey(contract, eventFilter, fromBlock, toBlock);
  
  // Check cache first
  const cachedLogs = logCacheManager.getCachedLogs(queryKey);
  if (cachedLogs && !options.bypassCache) {
    return cachedLogs;
  }
  
  // Check for in-progress query
  if (logCacheManager.isQueryInProgress(queryKey)) {
    console.log(`[LogCache] Query already in progress for ${queryKey}, waiting for result`);
    return await inProgressQueries.get(queryKey);
  }
  
  // Fetch logs
  const queryPromise = contract.queryFilter(eventFilter, fromBlock, toBlock)
    .then(logs => {
      return logCacheManager.cacheLogs(queryKey, logs);
    })
    .catch(error => {
      console.error(`[LogCache] Error fetching logs: ${error.message}`);
      throw error;
    });
  
  // Store the promise for deduplication
  return logCacheManager.markQueryInProgress(queryKey, queryPromise);
}

/**
 * Cache a log result manually
 * @param {string} cacheKey - Key to identify the cache entry
 * @param {any} result - The result to cache
 * @param {number} expiry - Optional expiry time in milliseconds
 * @returns {any} - The cached result
 */
export function cacheLogResult(cacheKey, result, expiry = LOG_CACHE_DURATION) {
  logCache.set(cacheKey, {
    logs: result,
    expiry: Date.now() + expiry
  });
  return result;
}
