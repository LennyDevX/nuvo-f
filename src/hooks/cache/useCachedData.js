import { useState, useEffect } from 'react';
import { cacheData, getCachedData } from '../../utils/cacheUtils';
// import { trackApiCall } from '...'; // TODO: Import or define trackApiCall

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
      // Try to get from cache first if not skipping cache
      if (!skipCache) {
        const cachedData = getCachedData(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }
      
      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Cache the result
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
