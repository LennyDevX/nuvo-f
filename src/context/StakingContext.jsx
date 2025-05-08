import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from '../hooks/useProvider';
import ABI from '../Abi/StakingContract.json';
import { globalRateLimiter } from '../utils/RateLimiter';
import { globalCache } from '../utils/CacheManager';

// Constants extracted to the top level
export const STAKING_CONSTANTS = {
  HOURLY_ROI: 0.0001, // 0.01% hourly
  MAX_ROI: 1.25, // 125%
  COMMISSION: 0.06, // 6%
  MAX_DEPOSIT: 10000,
  MIN_DEPOSIT: 5,
  MAX_DEPOSITS_PER_USER: 300,
  BASIS_POINTS: 10000,
  TIME_BONUSES: {
    YEAR: { days: 365, bonus: 0.05 }, // 5%
    HALF_YEAR: { days: 180, bonus: 0.03 }, // 3%
    QUARTER: { days: 90, bonus: 0.01 } // 1%
  }
};

// Cache TTL configurations
const CACHE_CONFIG = {
  CONTRACT_STATUS: { ttl: 60000 }, // 1 minute
  POOL_METRICS: { ttl: 300000 }, // 5 minutes
  TREASURY_METRICS: { ttl: 120000 }, // 2 minutes
  USER_INFO: { ttl: 30000 }, // 30 seconds
  POOL_EVENTS: { ttl: 600000 } // 10 minutes
};

// Initial default state
const defaultState = {
  contract: null,
  isContractPaused: false,
  isMigrated: false,
  totalPoolBalance: '0',
  userDeposits: [],
  userInfo: {
    totalStaked: '0',
    timeBonus: 0,
    pendingRewards: '0',
    lastWithdraw: 0,
    roiProgress: 0
  },
  treasuryAddress: null,
  stakingStats: {
    totalDeposited: '0',
    pendingRewards: '0',
    lastWithdraw: 0,
    depositsCount: 0,
    remainingSlots: 300
  },
  isPending: false
};

const StakingContext = createContext({
  state: defaultState,
  STAKING_CONSTANTS
});

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
};

export const StakingProvider = ({ children }) => {
  const { provider, isInitialized } = useProvider();
  const [state, setState] = useState(defaultState);
  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
  const refreshTimeoutRef = useRef(null);

  // Helper functions
  const getSignerAddress = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Error getting signer address:", error);
      return null;
    }
  }, []);

  // Get a signed contract instance
  const getSignedContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
  }, [CONTRACT_ADDRESS]);

  // Initialize the contract
  useEffect(() => {
    if (!isInitialized || !provider || !CONTRACT_ADDRESS) return;

    const initializeContract = async () => {
      try {
        // Verify contract exists at address
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at address');
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        contract.provider = provider;
        
        setState(prev => ({ ...prev, contract }));

        // Initial status fetch
        try {
          await getContractStatus(contract);
        } catch (statusError) {
          console.warn("Initial status fetch failed:", statusError);
        }
      } catch (err) {
        console.error("Contract initialization error:", err);
      }
    };

    initializeContract();
  }, [provider, isInitialized, CONTRACT_ADDRESS]);

  // Contract status fetcher with rate limiting and caching
  const getContractStatus = useCallback(async (contractInstance = state.contract) => {
    if (!contractInstance || !provider || !isInitialized) return;
    
    const rateLimiterKey = 'contract_status';
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      return;
    }
    
    try {
      return await globalCache.get(
        'contract_status',
        async () => {
          // Use Promise.all for parallel execution
          const [paused, migrated, treasury, balance] = await Promise.all([
            contractInstance.paused().catch(() => false),
            contractInstance.migrated().catch(() => false), 
            contractInstance.treasury().catch(() => null),
            contractInstance.getContractBalance().catch(() => BigInt(0))
          ]);
          
          const data = {
            isContractPaused: !!paused,
            isMigrated: !!migrated,
            treasuryAddress: treasury,
            totalPoolBalance: balance?.toString() || '0'
          };
          
          setState(prev => ({ ...prev, ...data }));
          return data;
        },
        CACHE_CONFIG.CONTRACT_STATUS.ttl
      );
    } catch (error) {
      console.error("Error getting contract status:", error);
      return null;
    }
  }, [provider, state.contract, isInitialized]);

  // User info fetcher with rate limiting and caching
  const refreshUserInfo = useCallback(async (address) => {
    if (!state.contract || !address) {
      return;
    }

    const rateLimiterKey = `user_info_${address}`;
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      return;
    }
    
    try {
      const cacheKey = `user_info_${address}`;
      return await globalCache.get(
        cacheKey,
        async () => {
          // Use Promise.all for parallel execution
          const [userInfoResponse, depositsResponse] = await Promise.all([
            state.contract.getUserInfo(address),
            state.contract.getUserDeposits(address)
          ]);

          // Format deposits array
          const formattedDeposits = Array.isArray(depositsResponse) 
            ? depositsResponse.map(deposit => ({
                amount: ethers.formatEther(deposit.amount || '0'),
                timestamp: Number(deposit.timestamp || '0')
              }))
            : [];

          const now = Math.floor(Date.now() / 1000);
          
          // Calculate ROI progress for each deposit
          let totalProgress = 0;
          formattedDeposits.forEach(deposit => {
            const timeStaked = now - deposit.timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            const dailyROI = 0.24; // Daily ROI percentage
            const progress = Math.min(daysStaked * dailyROI, 125);
            totalProgress += progress;
          });

          // Average ROI progress across all deposits
          const roiProgress = formattedDeposits.length > 0 
            ? totalProgress / formattedDeposits.length 
            : 0;

          // Format user info
          const formattedUserInfo = {
            totalStaked: ethers.formatEther(userInfoResponse.totalStaked || '0'),
            pendingRewards: ethers.formatEther(userInfoResponse.pendingRewards || '0'),
            lastWithdraw: Number(userInfoResponse.lastWithdraw || '0'),
            roiProgress: roiProgress,
            stakingDays: Math.floor((now - (formattedDeposits[0]?.timestamp || now)) / (24 * 3600))
          };

          // Update state
          setState(prev => ({
            ...prev,
            userInfo: formattedUserInfo,
            userDeposits: formattedDeposits,
            stakingStats: {
              ...prev.stakingStats,
              pendingRewards: formattedUserInfo.pendingRewards,
              lastWithdraw: formattedUserInfo.lastWithdraw,
              depositsCount: formattedDeposits.length,
              remainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - formattedDeposits.length
            }
          }));

          return { userInfo: formattedUserInfo, deposits: formattedDeposits };
        },
        CACHE_CONFIG.USER_INFO.ttl
      );
    } catch (error) {
      console.error("Error in refreshUserInfo:", error);
      return null;
    }
  }, [state.contract]);

  // Deposit function
  const deposit = useCallback(async (amount) => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.deposit({
        value: amount,
        gasLimit: 300000
      });
      
      await tx.wait();
      
      // After deposit completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo]);

  // Withdraw rewards function
  const withdrawRewards = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdraw();
      await tx.wait();
      
      // After withdrawal completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo]);

  // Withdraw all function (principal + rewards)
  const withdrawAll = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdrawAll();
      await tx.wait();
      
      // After withdrawal completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
        await getContractStatus();
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo, getContractStatus]);

  // Format date helper
  const formatWithdrawDate = useCallback((timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    try {
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Context value
  const contextValue = {
    state,
    STAKING_CONSTANTS,
    deposit,
    withdrawRewards,
    withdrawAll,
    refreshUserInfo,
    getContractStatus,
    formatWithdrawDate,
    getSignerAddress
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

// Helper function to calculate time bonus
export const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) 
    return STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) 
    return STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) 
    return STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus;
  return 0;
};
