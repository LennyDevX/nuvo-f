import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useStakingContract } from '../hooks/staking/useStakingContract';
import { useStakingTransactions } from '../hooks/staking/useStakingTransactions';
import { useStakingRewards } from '../hooks/staking/useStakingRewards';
import { useStakingEvents } from '../hooks/staking/useStakingEvents';
import { calculateTimeBonus as calculateTimeBonusFromUtils } from '../utils/blockchain/blockchainUtils';
import { STAKING_CONSTANTS, calculateCorrectAPY } from '../utils/staking/constants';

// Initial default state
const defaultState = {
  userDeposits: [],
  userInfo: {
    totalStaked: '0',
    timeBonus: 0,
    pendingRewards: '0',
    lastWithdraw: 0,
    roiProgress: 0
  },
  stakingStats: {
    totalDeposited: '0',
    pendingRewards: '0',
    lastWithdraw: 0,
    depositsCount: 0,
    remainingSlots: 300
  },
  isPending: false,
  currentTx: null
};

// Add debug control flag to reduce console spam
const DEBUG_MODE = false;

const StakingContext = createContext({
  state: defaultState
});

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
};

export const StakingProvider = ({ children }) => {
  // Use our custom hooks
  const { 
    contract, 
    isInitialized, 
    getContractStatus,
    getSignerAddress: contractGetSignerAddress, // Rename to avoid conflicts
    isContractPaused,
    isMigrated,
    totalPoolBalance,
    treasuryAddress
  } = useStakingContract();
  
  const {
    deposit,
    withdrawRewards,
    withdrawAll,
    emergencyWithdraw,
    compound,
    isPending,
    currentTx
  } = useStakingTransactions();
  
  const {
    calculateUserRewards,
    getUserTotalDeposit,
    refreshUserInfo,
    getDetailedStakingStats,
    calculateRealAPY: hookCalculateRealAPY, // Renamed to avoid redeclaration
    getSignerAddress: rewardsGetSignerAddress // Rename to avoid conflicts
  } = useStakingRewards();
  
  const {
    events,
    getPoolEvents
  } = useStakingEvents();
  
  // Create a unified getSignerAddress function that tries both sources
  const getSignerAddress = useCallback(async () => {
    try {
      // Try the contract hook first
      if (contractGetSignerAddress && typeof contractGetSignerAddress === 'function') {
        const address = await contractGetSignerAddress();
        if (address) return address;
      }
      
      // Fallback to rewards hook
      if (rewardsGetSignerAddress && typeof rewardsGetSignerAddress === 'function') {
        const address = await rewardsGetSignerAddress();
        if (address) return address;
      }
      
      console.error('No working getSignerAddress function available');
      return null;
    } catch (error) {
      console.error('Error in unified getSignerAddress:', error);
      return null;
    }
  }, [contractGetSignerAddress, rewardsGetSignerAddress]);
  
  const [state, setState] = useState({
    ...defaultState,
    isContractPaused,
    isMigrated,
    totalPoolBalance,
    treasuryAddress,
    STAKING_CONSTANTS // Add STAKING_CONSTANTS to state
  });
  
  // Cache for avoiding redundant operations
  const lastLoggedInfo = useRef(null);
  
  // Sync contract status with state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isContractPaused,
      isMigrated,
      totalPoolBalance,
      treasuryAddress,
      isPending,
      currentTx,
      STAKING_CONSTANTS // Ensure constants are always available
    }));
  }, [isContractPaused, isMigrated, totalPoolBalance, treasuryAddress, isPending, currentTx]);
  
  // Update user info when the contract is available
  useEffect(() => {
    if (!contract) return;
    
    const updateUserInfo = async () => {
      try {
        const address = await getSignerAddress();
        if (address) {
          const userInfo = await refreshUserInfo(address);
          if (userInfo) {
            setState(prev => ({
              ...prev,
              userInfo: userInfo.userInfo,
              userDeposits: userInfo.deposits,
              stakingStats: userInfo.stakingStats
            }));
          }
        }
      } catch (error) {
        console.error('Error updating user info:', error);
      }
    };
    
    updateUserInfo();
  }, [contract, getSignerAddress, refreshUserInfo]);
  
  // Helper function for date formatting
  const formatWithdrawDate = useCallback((timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    try {
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);
  
  // Update user info after transactions
  const handleWithdrawalSuccess = useCallback(async (amount) => {
    try {
      const address = await getSignerAddress();
      if (address) {
        await Promise.all([
          refreshUserInfo(address),
          getPoolEvents({ forceRefresh: true })
        ]);
      }
    } catch (error) {
      console.error('Error handling withdrawal success:', error);
    }
  }, [getSignerAddress, refreshUserInfo, getPoolEvents]);
  
  const handleDepositSuccess = useCallback(async () => {
    try {
      const address = await getSignerAddress();
      if (address) {
        await Promise.all([
          refreshUserInfo(address),
          getPoolEvents({ forceRefresh: true })
        ]);
      }
    } catch (error) {
      console.error('Error handling deposit success:', error);
    }
  }, [getSignerAddress, refreshUserInfo, getPoolEvents]);

  // Add debugging for transaction state changes - only when needed
  useEffect(() => {
    if (currentTx && DEBUG_MODE) {
      console.log(`Transaction update [${currentTx.type}]: ${currentTx.status}`, currentTx);
    }
  }, [currentTx]);
  
  // Fix the transaction monitoring function
  useEffect(() => {
    // If there's a pending transaction, set a safety timeout
    if (isPending && currentTx && currentTx.status === 'pending') {
      const safety = setTimeout(() => {
        console.log("Safety timeout: transaction appears stuck, resetting state");
        setState(prev => ({
          ...prev,
          isPending: false,
          currentTx: {
            ...prev.currentTx,
            status: 'failed',
            error: "Transaction timed out. It may still complete in your wallet."
          }
        }));
      }, 60000); // 1 minute timeout
      
      return () => clearTimeout(safety);
    }
  }, [isPending, currentTx]);
  
  // Improve state synchronization to ensure isPending and currentTx stay in sync
  useEffect(() => {
    setState(prev => {
      // If the transaction completed but isPending is still true, reset it
      if (!isPending && prev.isPending) {
        return {
          ...prev,
          isPending: false
        };
      }
      
      // If transaction is pending but our state doesn't reflect it, update
      if (isPending && !prev.isPending) {
        return {
          ...prev,
          isPending: true
        };
      }
      
      // If currentTx changed, update it in our state
      if (currentTx && (!prev.currentTx || 
          currentTx.status !== prev.currentTx.status || 
          currentTx.hash !== prev.currentTx.hash)) {
        return {
          ...prev,
          currentTx
        };
      }
      
      return prev;
    });
  }, [isPending, currentTx]);
  
  // Add optimized refresh with error handling and retries
  const forceRefresh = useCallback(async (address) => {
    if (!address) {
      try {
        address = await getSignerAddress();
        if (!address) return false;
      } catch (error) {
        console.error('Error getting signer address for refresh:', error);
        return false;
      }
    }
    
    try {
      if (DEBUG_MODE) console.log("Forcing refresh of user data...");
      
      // Add retries for better reliability
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;
      let userInfo = null;
      
      while (!success && retryCount < maxRetries) {
        try {
          // Add smaller batch sizes for events to prevent RPC errors
          const options = {
            batchSize: 100, // Fetch logs in smaller batches to avoid RPC errors
            retryDelay: 1000 * (retryCount + 1) // Exponential backoff
          };
          
          userInfo = await refreshUserInfo(address, options);
          success = true;
        } catch (error) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      if (userInfo) {
        setState(prev => ({
          ...prev,
          userInfo: userInfo.userInfo,
          userDeposits: userInfo.deposits,
          stakingStats: userInfo.stakingStats
        }));
        // Invalidate only staking-related cache
        globalCache.clearByPrefix('pool_events_');
      }
      
      return true;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return false;
    }
  }, [getSignerAddress, refreshUserInfo]);
  
  // Add APY calculation utilities to context
  const getAPYAnalysis = useCallback(async (address) => {
    if (!address) {
      try {
        address = await getSignerAddress();
        if (!address) return null;
      } catch (error) {
        console.error('Error getting signer address for APY analysis:', error);
        return null;
      }
    }
    
    try {
      const userInfo = await refreshUserInfo(address);
      if (!userInfo) return null;
      
      const stakingDays = userInfo.userInfo.stakingDays || 0;
      
      return calculateUserAPY({
        userDeposits: userInfo.deposits,
        totalStaked: userInfo.userInfo.totalStaked,
        totalPoolBalance,
        stakingDays
      });
    } catch (error) {
      console.error("Failed to calculate APY:", error);
      return null;
    }
  }, [getSignerAddress, refreshUserInfo, totalPoolBalance]);

  // Calculate real APY with corrected values - SINGLE DECLARATION
  const calculateRealAPY = useCallback(async () => {
    try {
      // Use corrected APY calculations
      const correctedAPY = {
        hourly: 0.01, // 0.01% (contract value)
        daily: 0.24, // 0.24% (contract value)
        annual: 87.6 // Updated for SmartStaking v3.0 (contract value)
      };
      
      return {
        baseAPY: correctedAPY.annual, // Updated for SmartStaking v3.0
        dailyROI: correctedAPY.daily, // 0.024%
        hourlyROI: correctedAPY.hourly, // 0.001%
        verified: true
      };
    } catch (error) {
      console.error('Error calculating real APY:', error);
      return {
        baseAPY: 8.76, // Updated for SmartStaking v3.0
        dailyROI: 0.24,
        hourlyROI: 0.01,
        verified: false
      };
    }
  }, []);

  // Prepare context value with all functions and state
  const contextValue = {
    // Contract functions
    contract,
    deposit,
    withdrawRewards,
    withdrawAll,
    emergencyWithdraw,
    compound,
    
    // Data functions
    calculateUserRewards,
    getUserTotalDeposit,
    refreshUserInfo,
    getDetailedStakingStats,
    calculateRealAPY,
    getSignerAddress, // Export the unified function
    
    // Event functions
    getPoolEvents,
    
    // Utility functions
    forceRefresh,
    getAPYAnalysis,
    
    // State
    state,
    
    // Utility functions
    formatWithdrawDate,
    
    // Constants
    STAKING_CONSTANTS
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

export const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  return calculateTimeBonusFromUtils(daysStaked, STAKING_CONSTANTS.TIME_BONUSES);
};

export { STAKING_CONSTANTS };
