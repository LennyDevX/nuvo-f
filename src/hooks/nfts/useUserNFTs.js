import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNFTs } from '../../utils/blockchain/blockchainUtils';
import { WalletContext } from '../../context/WalletContext';
import { useContext } from 'react';
import useProvider from '../blockchain/useProvider';

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 5 * 60 * 1000;

export const useUserNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const { account, walletConnected } = useContext(WalletContext);
  const { provider } = useProvider();

  // Contract address from your .env
  const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

  // Performance optimization refs
  const cacheRef = useRef(new Map());
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const loadUserNFTs = useCallback(async (reset = false) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('Already loading NFTs, skipping duplicate call');
      return;
    }

    if (!account || !walletConnected || !provider) {
      console.log('Missing requirements:', { account, walletConnected, provider: !!provider });
      setNfts([]);
      setLoading(false);
      return;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log("🚀 Loading user NFTs for account:", account);

      // Add delay to ensure provider is fully ready
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check if component is still mounted
      if (!mountedRef.current) return;

      const options = {
        limit: 100, // Increase limit to ensure we get all NFTs
        contractAddress: CONTRACT_ADDRESS,
        chainId: 137,
        includeMetadata: true,
        includeListing: true
      };

      const userNFTs = await fetchNFTs(account, provider, options);
      
      // Check if component is still mounted after async operation
      if (!mountedRef.current) return;
      
      // Ensure userNFTs is always an array and log the results
      const nftsArray = Array.isArray(userNFTs) ? userNFTs : [];
      
      console.log(`📊 Loaded ${nftsArray.length} NFTs for user:`, nftsArray.map(nft => ({
        id: nft.id,
        name: nft.name,
        image: nft.image
      })));

      // Only update state if component is still mounted
      if (mountedRef.current) {
        if (reset) {
          setNfts(nftsArray);
          setTotalCount(nftsArray.length);
          setHasMore(false);
          console.log(`✅ NFT state updated: ${nftsArray.length} NFTs set`);
        } else {
          setNfts(prev => {
            // Merge with existing, avoiding duplicates
            const existingIds = new Set(prev.map(nft => nft.id || nft.tokenId));
            const newNfts = nftsArray.filter(nft => !existingIds.has(nft.id || nft.tokenId));
            const combined = [...prev, ...newNfts];
            console.log(`🔄 NFT state merged: ${prev.length} existing + ${newNfts.length} new = ${combined.length} total`);
            return combined;
          });
          setHasMore(nftsArray.length >= 20);
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('NFT loading was aborted');
        return;
      }

      console.error('❌ Error loading user NFTs:', err);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setError(err.message || 'Error loading NFTs');
        // Ensure nfts is always an array even on error
        if (reset) {
          setNfts([]);
        }
      }
    } finally {
      if (mountedRef.current) {
        isLoadingRef.current = false;
        setLoading(false);
      }
    }
  }, [account, walletConnected, provider, CONTRACT_ADDRESS]);

  // Load more NFTs (pagination) - now mostly unused since we load all at once
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || isLoadingRef.current) return;
    await loadUserNFTs(false);
  }, [hasMore, loading, loadUserNFTs]);

  // Refresh NFTs (reload first page)
  const refreshNFTs = useCallback(async () => {
    // Clear cache
    cacheRef.current.clear();
    
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset loading state
    isLoadingRef.current = false;
    
    setNfts([]);
    await loadUserNFTs(true);
  }, [loadUserNFTs]);

  // Initial load with better timing
  useEffect(() => {
    // Reset mounted ref
    mountedRef.current = true;

    // Add delay to ensure all context is properly initialized
    const timeoutId = setTimeout(() => {
      if (account && provider && walletConnected && mountedRef.current) {
        loadUserNFTs(true);
      } else {
        setNfts([]);
        setHasMore(false);
        setTotalCount(0);
        setLoading(false);
      }
    }, 200); // Small delay to ensure provider is ready

    return () => {
      clearTimeout(timeoutId);
    };
  }, [account, provider, walletConnected]); // Remove loadUserNFTs from dependencies to prevent infinite loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      isLoadingRef.current = false;
      
      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear cache
      cacheRef.current.clear();
    };
  }, []);

  return {
    nfts: Array.isArray(nfts) ? nfts : [],
    loading,
    error,
    hasMore,
    totalCount,
    loadUserNFTs,
    loadMore,
    refresh: refreshNFTs
  };
};

export default useUserNFTs;