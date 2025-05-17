import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import useProvider from './useProvider';
// Updated imports to use new utilities and paths
import { globalCache } from '../../utils/cache/CacheManager';
import { dedupRequest } from '../../utils/performance/RateLimiter';
import { trackApiCall } from '../../utils/blockchain/apiMonitor';

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
  // lastFetchedRef is no longer needed due to getOptimizedData and dedupRequest
  const isMounted = useRef(true);

  // Create memoized formatNumber function to prevent recreations
  const formatNumber = useMemo(() => (value) => {
    if (!value && value !== 0) return '0'; // Handle 0 correctly
    return parseFloat(ethers.formatEther(value));
  }, []);

  // Helper function to fetch individual data points; returns data or throws error.
  // Memoized because it's used in fetchTokenData's useCallback.
  const fetchIndividualDataFromContract = useCallback(async (contract) => {
    if (!contract) throw new Error("Contract not provided to fetchIndividualDataFromContract");

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
    let success = false;

    for (const { key, method } of dataPoints) {
      try {
        const result = await contract[method]();
        if (key === 'burnProgress') {
          collectedData[key] = Number(result); // Assumes result is a number or BigNumber convertible to number
        } else {
          collectedData[key] = formatNumber(result);
        }
        success = true;
      } catch (err) {
        console.warn(`Failed to fetch ${method}:`, err);
      }
    }

    if (success) {
      const baseData = { ...DEFAULT_DATA }; // Start with defaults
      const finalData = { ...baseData, ...collectedData };
      // Recalculate circulatingSupply if totalSupply was fetched
      if (collectedData.totalSupply !== undefined) {
        finalData.circulatingSupply = collectedData.totalSupply;
      }
      return finalData;
    }
    
    throw new Error("Failed to fetch any individual token data points.");
  }, [formatNumber]);


  const fetchTokenData = useCallback(async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null); // Clear previous errors at the start of a new fetch attempt

    // Key for getOptimizedData (dedupRequest, trackApiCall, and cache)
    const dataFetchKey = `token_data_${contractAddress}`;

    try {
      const coreFetchFn = async () => {
        if (!provider || !contractAddress || !isInitialized) {
          if (import.meta.env.DEV) {
            console.log("Provider not available or not initialized, using mock data");
            return { ...DEFAULT_DATA }; // Return a copy
          }
          throw new Error("Provider not available");
        }

        if (!ethers.isAddress(contractAddress)) {
          if (import.meta.env.DEV) {
            console.log("Invalid contract address, using mock data");
            return { ...DEFAULT_DATA }; // Return a copy
          }
          throw new Error("Invalid contract address format");
        }

        const contract = new ethers.Contract(contractAddress, TOKEN_ABI, provider);

        try {
          const stats = await contract.getTokenStats();
          return {
            maxSupply: formatNumber(stats.maxSupply),
            totalSupply: formatNumber(stats.currentSupply),
            targetSupply: formatNumber(stats.targetFinalSupply),
            totalBurned: formatNumber(stats.totalBurned),
            burnTarget: formatNumber(stats.burnTarget),
            burnProgress: Number(stats.currentBurnProgress),
            remainingToBurn: formatNumber(stats.currentRemainingToBurn),
            circulatingSupply: formatNumber(stats.currentSupply)
          };
        } catch (statsError) {
          console.warn("getTokenStats failed, falling back to individual calls:", statsError);
          try {
            return await fetchIndividualDataFromContract(contract);
          } catch (individualError) {
            if (import.meta.env.DEV) {
              console.log("Individual fetch failed, using default data in development mode:", individualError);
              return { ...DEFAULT_DATA }; // Return a copy
            }
            // Re-throw the error from individual fetch if not in DEV mode or if it's critical
            throw new Error(`Failed to fetch token data: ${individualError.message}`);
          }
        }
      };

      const data = await getOptimizedData(dataFetchKey, coreFetchFn);
      
      if (isMounted.current) {
        setTokenData(data);
        // setError(null); // Already cleared at the beginning
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error fetching token data:", err);
        setError(err.message || "Error fetching token data");
        // Optionally, set to DEFAULT_DATA on error, especially in DEV
        if (import.meta.env.DEV) {
            console.log("Setting token data to default due to error in DEV mode.");
            setTokenData({ ...DEFAULT_DATA }); // Set to a copy of default data
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [provider, contractAddress, isInitialized, formatNumber, fetchIndividualDataFromContract]);

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
