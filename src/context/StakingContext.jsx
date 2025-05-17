import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStakingContract } from '../hooks/staking/useStakingContract';
import { useStakingTransactions } from '../hooks/staking/useStakingTransactions';
import { useStakingRewards } from '../hooks/staking/useStakingRewards';
import { useStakingEvents } from '../hooks/staking/useStakingEvents';
import { calculateTimeBonus as calculateTimeBonusFromUtils } from '../utils/blockchain/blockchainUtils';
import { STAKING_CONSTANTS } from '../utils/constants';

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
    getSignerAddress, 
    getContractStatus,
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
    isPending,
    currentTx
  } = useStakingTransactions();
  
  const {
    calculateUserRewards,
    getUserTotalDeposit,
    refreshUserInfo,
    getDetailedStakingStats,
    calculateRealAPY
  } = useStakingRewards();
  
  const {
    events,
    getPoolEvents
  } = useStakingEvents();
  
  const [state, setState] = useState({
    ...defaultState,
    isContractPaused,
    isMigrated,
    totalPoolBalance,
    treasuryAddress
  });
  
  // Sync contract status with state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isContractPaused,
      isMigrated,
      totalPoolBalance,
      treasuryAddress,
      isPending,
      currentTx
    }));
  }, [isContractPaused, isMigrated, totalPoolBalance, treasuryAddress, isPending, currentTx]);
  
  // Update user info when the contract is available
  useEffect(() => {
    if (!contract) return;
    
    const updateUserInfo = async () => {
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
    const address = await getSignerAddress();
    if (address) {
      await Promise.all([
        refreshUserInfo(address),
        getPoolEvents({ forceRefresh: true })
      ]);
    }
  }, [getSignerAddress, refreshUserInfo, getPoolEvents]);
  
  const handleDepositSuccess = useCallback(async () => {
    const address = await getSignerAddress();
    if (address) {
      await Promise.all([
        refreshUserInfo(address),
        getPoolEvents({ forceRefresh: true })
      ]);
    }
  }, [getSignerAddress, refreshUserInfo, getPoolEvents]);

  // Add debugging for transaction state changes
  useEffect(() => {
    if (currentTx) {
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
  
  // Add a function to manually refresh the user's state
  const forceRefresh = useCallback(async (address) => {
    if (!address) return;
    
    try {
      console.log("Forcing refresh of user data...");
      const userInfo = await refreshUserInfo(address);
      if (userInfo) {
        setState(prev => ({
          ...prev,
          userInfo: userInfo.userInfo,
          userDeposits: userInfo.deposits,
          stakingStats: userInfo.stakingStats
        }));
      }
      return true;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return false;
    }
  }, [refreshUserInfo]);
  
  // Context value with all necessary functions and state
  const contextValue = {
    state: {
      ...state,
      contract,
      events: events
    },
    STAKING_CONSTANTS,
    deposit,
    withdrawRewards,
    withdrawAll,
    refreshUserInfo,
    getContractStatus,
    formatWithdrawDate,
    getSignerAddress,
    calculateUserRewards,
    getUserTotalDeposit,
    emergencyWithdraw,
    getPoolEvents,
    calculateRealAPY,
    getDetailedStakingStats,
    handleWithdrawalSuccess,
    handleDepositSuccess,
    isInitialized,
    forceRefresh
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
