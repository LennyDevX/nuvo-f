import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import useProvider from './useProvider';

// Minimal ABI for the NUVO token contract functions we need
const TOKEN_ABI = [
  // Read functions
  "function totalSupply() view returns (uint256)",
  "function cap() view returns (uint256)",
  "function targetSupply() view returns (uint256)",
  "function totalBurnedTokens() view returns (uint256)",
  "function burnProgress() view returns (uint256)",
  "function remainingToBurn() view returns (uint256)",
  "function getBurnTarget() view returns (uint256)",
  "function getTokenStats() view returns (uint256 maxSupply, uint256 currentSupply, uint256 targetFinalSupply, uint256 totalBurned, uint256 burnTarget, uint256 currentBurnProgress, uint256 currentRemainingToBurn)"
];

// Default values from the contract
const DEFAULT_DATA = {
  totalSupply: 1000000,
  maxSupply: 21000000, 
  targetSupply: 10000000, 
  totalBurned: 0,
  burnTarget: 11000000, 
  burnProgress: 0, // 0%
  remainingToBurn: 11000000,
  circulatingSupply: 1000000
};

/**
 * Hook to interact with NUVO token contract data
 * @param {string} contractAddress - The deployed token contract address
 * @param {number} refreshInterval - Optional interval in ms to refresh data
 */
const useTokenData = (contractAddress, refreshInterval = 30000) => {
  const { provider, isInitialized } = useProvider();
  const [tokenData, setTokenData] = useState(DEFAULT_DATA);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedRef = useRef(0);
  const isMounted = useRef(true);

  // Create memoized formatNumber function to prevent recreations
  const formatNumber = useMemo(() => (value) => {
    if (!value) return '0';
    return parseFloat(ethers.formatEther(value));
  }, []);

  // Fetch individual data with memoized implementation
  const fetchIndividualData = useCallback(async (contract) => {
    if (!contract) return false;

    try {
      // Use object structure to make data collection cleaner
      const dataPoints = [
        { key: 'maxSupply', method: 'cap' },
        { key: 'totalSupply', method: 'totalSupply' },
        { key: 'targetSupply', method: 'targetSupply' },
        { key: 'burnTarget', method: 'getBurnTarget' },
        { key: 'totalBurned', method: 'totalBurnedTokens' },
        { key: 'remainingToBurn', method: 'remainingToBurn' },
        { key: 'burnProgress', method: 'burnProgress' }
      ];

      const collectedData = {};

      // Sequential fetching to avoid rate limits
      for (const { key, method } of dataPoints) {
        try {
          const result = await contract[method]();
          collectedData[key] = formatNumber(result);
        } catch (err) {
          console.warn(`Failed to fetch ${method}:`, err);
        }
      }

      // Only update state if we have at least some data and component is still mounted
      if (Object.keys(collectedData).length > 0 && isMounted.current) {
        setTokenData(prev => ({
          ...prev,
          ...collectedData,
          circulatingSupply: collectedData.totalSupply
        }));
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error in fetchIndividualData:", err);
      return false;
    }
  }, [formatNumber]);

  const fetchTokenData = useCallback(async () => {
    // Skip if recently fetched (throttle requests)
    const now = Date.now();
    if (now - lastFetchedRef.current < refreshInterval / 2) return;

    lastFetchedRef.current = now;

    if (!isMounted.current) return;
    setIsLoading(true);

    try {
      if (!provider || !contractAddress || !isInitialized) {
        if (import.meta.env.DEV) {
          console.log("Provider not available or not initialized, using mock data");
          setTokenData(DEFAULT_DATA);
          setError(null);
        } else {
          setError("Provider not available");
        }
        setIsLoading(false);
        return;
      }

      // Validate contract address format
      if (!ethers.isAddress(contractAddress)) {
        if (import.meta.env.DEV) {
          console.log("Invalid contract address, using mock data");
          setTokenData(DEFAULT_DATA);
          setError(null);
        } else {
          setError("Invalid contract address format");
        }
        setIsLoading(false);
        return;
      }

      const contract = new ethers.Contract(contractAddress, TOKEN_ABI, provider);

      // Try to get all stats in one call first
      try {
        const stats = await contract.getTokenStats();

        if (isMounted.current) {
          setTokenData({
            maxSupply: formatNumber(stats.maxSupply),
            totalSupply: formatNumber(stats.currentSupply),
            targetSupply: formatNumber(stats.targetFinalSupply),
            totalBurned: formatNumber(stats.totalBurned),
            burnTarget: formatNumber(stats.burnTarget),
            burnProgress: Number(stats.currentBurnProgress),
            remainingToBurn: formatNumber(stats.currentRemainingToBurn),
            circulatingSupply: formatNumber(stats.currentSupply)
          });
          setError(null);
        }
      } catch (statsError) {
        console.warn("getTokenStats failed, falling back to individual calls:", statsError);

        // If getting all stats fails, try individual calls
        const success = await fetchIndividualData(contract);

        if (!success && !import.meta.env.DEV) {
          throw new Error("Failed to fetch token data via individual methods");
        } else if (!success && import.meta.env.DEV) {
          console.log("Using default data in development mode");
          setTokenData(DEFAULT_DATA);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || "Error fetching token data");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [provider, contractAddress, isInitialized, fetchIndividualData, formatNumber, refreshInterval]);

  // Set up polling with proper cleanup
  useEffect(() => {
    isMounted.current = true;
    fetchTokenData();

    const intervalId = setInterval(fetchTokenData, refreshInterval);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [fetchTokenData, refreshInterval]);

  return {
    tokenData,
    error,
    isLoading,
    refetch: fetchTokenData
  };
};

export default useTokenData;
