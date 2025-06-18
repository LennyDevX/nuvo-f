import { useState, useEffect } from 'react';
import { cacheData, getCachedData } from '../../utils/cacheUtils';
// import { trackApiCall } from '...'; // TODO: Import or define trackApiCall

// Helper: fetch with retry/backoff
const fetchWithRetry = async (fetchFn, retries = 2, backoff = 1000) => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fetchFn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
      attempt++;
    }
  }
};

/**
 * Hook for fetching data with localStorage caching
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch }
 */
export default function useCachedData(key, fetchFn, options = {}) {
  const { 
    ttl = 3600000, // 1 hour default
    enabled = true,
    initialData = null
  } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = async (skipCache = false) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      if (!skipCache) {
        const cachedData = getCachedData(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }
      // Retry/backoff
      const freshData = await fetchWithRetry(fetchFn, 2, 1000);
      cacheData(key, freshData, ttl);
      setData(freshData);
      return freshData;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [key, enabled]);
  
  // Function to force refetch
  const refetch = () => fetchData(true);
  
  return { data, loading, error, refetch };
}

/**
 * Hook for fetching blockchain data with localStorage caching and API call tracking.
 * Reuses useCachedData with optimizations for blockchain data.
 * @param {string} key - Cache key (will be prefixed with 'blockchain-')
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Object} options - Configuration options for useCachedData
 * @returns {Object} { data, loading, error, refetch }
 */
export function useBlockchainData(key, fetchFn, options = {}) {
  // Reutiliza el hook pero con optimizaciones para blockchain
  const enhancedFetchFn = async () => {
    // Assuming trackApiCall is defined elsewhere and imported
    // For example: import { trackApiCall } from './apiAnalytics'; 
    try {
      const data = await fetchFn();
      // trackApiCall(key, true); // Uncomment when trackApiCall is available
      console.log(`API call for ${key} successful (simulated track)`); // Placeholder
      return data;
    } catch (error) {
      // trackApiCall(key, false); // Uncomment when trackApiCall is available
      console.error(`API call for ${key} failed (simulated track)`, error); // Placeholder
      throw error;
    }
  };
  
  // Usar el hook existente con la función mejorada
  return useCachedData(`blockchain-${key}`, enhancedFetchFn, {
    ...options,
    // TTL más corto para datos blockchain que cambian frecuentemente
    ttl: options.ttl || 60000 // 1 minuto por defecto para datos blockchain
  });
}

// Prefetch hook
export function usePrefetchCachedData(keys, fetchFn, options = {}) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const key of keys) {
        if (cancelled) break;
        try {
          await fetchWithRetry(() => fetchFn(key), 1, 500);
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, [JSON.stringify(keys), fetchFn]);
}
