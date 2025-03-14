import { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  // Helper to format big numbers
  const formatNumber = (bigNumber) => {
    return parseFloat(ethers.formatEther(bigNumber));
  };

  // Get network information from provider
  const getNetworkInfo = useCallback(async () => {
    if (!provider) return null;
    
    try {
      const network = await provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name
      };
    } catch (err) {
      console.warn("Failed to get network info:", err);
      return null;
    }
  }, [provider]);

  // Fetch individual data points one by one
  const fetchIndividualData = async (contract) => {
    try {
      // Add each method call with error handling
      const safeCall = async (method, fallbackValue) => {
        try {
          if (typeof contract[method] === 'function') {
            return await contract[method]();
          }
          return fallbackValue;
        } catch (err) {
          console.warn(`Error calling ${method}:`, err);
          return fallbackValue;
        }
      };

      // Try to get basic total supply to verify contract
      let totalSupplyBN;
      try {
        totalSupplyBN = await contract.totalSupply();
      } catch (err) {
        console.error("Contract doesn't support totalSupply, likely not an ERC20:", err);
        // In development, return true with default data instead of throwing
        if (import.meta.env.DEV) {
          setTokenData(DEFAULT_DATA);
          return true;
        }
        return false;
      }
      
      // These are custom methods that may not exist
      const capBN = await safeCall('cap', ethers.parseEther('21000000'));
      const targetSupplyBN = await safeCall('targetSupply', ethers.parseEther('10000000'));
      const totalBurnedBN = await safeCall('totalBurnedTokens', ethers.parseEther('0'));
      const burnProgressValue = await safeCall('burnProgress', 0);
      const remainingToBurnBN = await safeCall('remainingToBurn', ethers.parseEther('11000000'));
      const burnTargetBN = await safeCall('getBurnTarget', ethers.parseEther('11000000'));

      // Update state with individual values
      setTokenData({
        totalSupply: formatNumber(totalSupplyBN),
        maxSupply: formatNumber(capBN),
        targetSupply: formatNumber(targetSupplyBN),
        totalBurned: formatNumber(totalBurnedBN),
        burnTarget: formatNumber(burnTargetBN),
        burnProgress: Number(burnProgressValue),
        remainingToBurn: formatNumber(remainingToBurnBN),
        circulatingSupply: formatNumber(totalSupplyBN)
      });
      return true;
    } catch (err) {
      console.warn("Failed to fetch individual token data:", err);
      if (import.meta.env.DEV) {
        setTokenData(DEFAULT_DATA);
        return true;
      }
      return false;
    }
  };

  const fetchTokenData = useCallback(async () => {
    // Early returns for missing dependencies
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

    try {
      setIsLoading(true);
      
      // Get network information
      const network = await getNetworkInfo();
      setNetworkInfo(network);
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, TOKEN_ABI, provider);
      
      // In development, don't validate the ERC20 standard at all
      if (!import.meta.env.DEV) {
        try {
          // Only check totalSupply in production mode
          await contract.totalSupply();
        } catch (basicError) {
          throw new Error("Contract does not implement ERC20 standard");
        }
      }
      
      // Try to get all stats in one call first
      try {
        const stats = await contract.getTokenStats();
        
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
      console.error("Error fetching token data:", err);
      
      if (import.meta.env.DEV) {
        // In development, log the error but don't set it in state
        // This prevents the error UI from showing in dev mode
        console.log("Development mode: Using mock data instead of showing error");
        setTokenData(DEFAULT_DATA);
        setError(null); // Clear any previous errors
      } else {
        // In production, set the error normally
        setError(err.message || "Failed to fetch token data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [provider, contractAddress, isInitialized, getNetworkInfo]);

  useEffect(() => {
    fetchTokenData();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchTokenData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchTokenData, refreshInterval]);

  const refreshData = useCallback(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  return { 
    tokenData, 
    isLoading, 
    error, 
    refreshData, 
    networkInfo, 
    // Is using mock data in development mode
    isUsingMockData: import.meta.env.DEV && error !== null
  };
};

export default useTokenData;
