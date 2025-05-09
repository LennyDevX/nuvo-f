import { useState, useEffect, useCallback } from 'react';
import { fetchFromIpfs } from '../../utils/ipfsUtils';

/**
 * Custom hook for fetching data from IPFS
 * @param {string} cidOrUrl - IPFS CID or URL
 * @returns {Object} - The fetched data, loading state, error, and retry function
 */
const useIpfsData = (cidOrUrl) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!cidOrUrl) {
      setError(new Error('No IPFS CID or URL provided'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFromIpfs(cidOrUrl);
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        setData(jsonData);
      } else if (contentType && contentType.includes('image/')) {
        const blobUrl = URL.createObjectURL(await response.blob());
        setData({ imageUrl: blobUrl, contentType });
      } else {
        const text = await response.text();
        setData({ content: text, contentType });
      }
    } catch (err) {
      console.error('Error fetching from IPFS:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [cidOrUrl]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (cidOrUrl) {
      fetchData();
    }
  }, [cidOrUrl, retryCount, fetchData]);

  return { data, isLoading, error, retry };
};

export default useIpfsData;
