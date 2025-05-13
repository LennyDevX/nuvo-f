import { useState, useEffect, useCallback } from 'react';
import { fetchTokenMetadata, ipfsToHttp } from '../../utils/blockchain/blockchainUtils';

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
      // Use our enhanced fetchTokenMetadata function that's more robust
      const metadata = await fetchTokenMetadata(cidOrUrl);
      
      // Process image URLs if present
      if (metadata.image) {
        metadata.imageUrl = ipfsToHttp(metadata.image);
      }
      
      setData(metadata);
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
