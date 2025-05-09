import { useState, useEffect } from 'react';
import { cacheData, getCachedData } from '../../utils/cacheUtils';

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
