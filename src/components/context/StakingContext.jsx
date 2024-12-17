import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import useProvider from '../hooks/useProvider';
import ABI from '../../Abi/StakingContract.json';

// Mover las constantes fuera del componente
export const STAKING_CONSTANTS = {
  HOURLY_ROI: 0.0001, // 0.01%
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

const defaultState = {
  contract: null,
  isContractPaused: false,
  isMigrated: false,
  newContractAddress: null,
  uniqueUsersCount: 0,
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
  STAKING_CONSTANTS: {
    HOURLY_ROI: 0.0001,
    MAX_ROI: 1.25,
    COMMISSION: 0.06,
    MAX_DEPOSIT: 10000,
    MIN_DEPOSIT: 5,
    MAX_DEPOSITS_PER_USER: 300,
    BASIS_POINTS: 10000,
    TIME_BONUSES: {
      YEAR: { days: 365, bonus: 0.05 },
      HALF_YEAR: { days: 180, bonus: 0.03 },
      QUARTER: { days: 90, bonus: 0.01 }
    }
  }
});

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
};

export const StakingProvider = ({ children }) => {
  const provider = useProvider();
  const [state, setState] = useState(defaultState);
  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;

  useEffect(() => {
    if (provider && CONTRACT_ADDRESS) {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      setState(prev => ({ ...prev, contract }));
      
      // Initial contract status fetch
      getContractStatus(contract);
    }
  }, [provider]);

  const getSignedContract = async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
  };

  const deposit = async (amount) => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.deposit({
        value: amount,
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  const withdrawRewards = async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdraw();
      await tx.wait();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  const withdrawAll = async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdrawAll();
      await tx.wait();
      
      // Refresh state after withdrawal
      await getContractStatus();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  // Helper functions
  const refreshUserInfo = async (address) => {
    if (!state.contract || !address) return;
    try {
      const [userInfoResponse, depositsResponse] = await Promise.all([
        state.contract.getUserInfo(address).then(info => ({
          totalDeposited: info.totalDeposited.toString(),
          pendingRewards: info.pendingRewards.toString(),
          lastWithdraw: Number(info.lastWithdraw || 0)
        })).catch(() => ({
          totalDeposited: '0',
          pendingRewards: '0',
          lastWithdraw: 0
        })),
        state.contract.getUserDeposits(address).then(deps => 
          deps.map(d => ({
            amount: d.amount.toString(),
            timestamp: Number(d.timestamp)
          }))
        ).catch(() => [])
      ]);

      const timeBonus = calculateTimeBonus((depositsResponse[0]?.timestamp || 0) * 1000);
      const roiProgress = calculateROIProgress(depositsResponse);

      setState(prev => ({
        ...prev,
        userInfo: {
          totalStaked: userInfoResponse.totalDeposited,
          timeBonus,
          pendingRewards: userInfoResponse.pendingRewards,
          lastWithdraw: userInfoResponse.lastWithdraw,
          roiProgress
        },
        userDeposits: depositsResponse,
        stakingStats: {
          totalDeposited: userInfoResponse.totalDeposited,
          pendingRewards: userInfoResponse.pendingRewards,
          lastWithdraw: userInfoResponse.lastWithdraw,
          depositsCount: depositsResponse.length,
          remainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - depositsResponse.length
        }
      }));
    } catch (error) {
      console.error('Error refreshing user info:', error);
      setState(prev => ({
        ...prev,
        userInfo: defaultState.userInfo,
        stakingStats: defaultState.stakingStats
      }));
    }
  };

  // Update getContractStatus to accept contract parameter
  const getContractStatus = async (contractInstance = state.contract) => {
    if (!contractInstance) return;
    try {
      const [paused, migrated, treasury, balance] = await Promise.all([
        contractInstance.paused(),
        contractInstance.migrated(),
        contractInstance.treasury(),
        contractInstance.getContractBalance()
      ]);
      setState(prev => ({
        ...prev,
        isContractPaused: paused,
        isMigrated: migrated,
        treasuryAddress: treasury,
        totalPoolBalance: balance.toString()
      }));
    } catch (error) {
      console.error('Error getting contract status:', error);
    }
  };

  // Format date helper function
  const formatWithdrawDate = useCallback((timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    try {
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  const calculateROIProgress = useCallback((deposits) => {
    if (!deposits || deposits.length === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    
    const progress = deposits.reduce((acc, deposit) => {
      const timeStaked = now - Number(deposit.timestamp);
      const hourlyProgress = (timeStaked / 3600) * STAKING_CONSTANTS.HOURLY_ROI;
      return acc + Math.min(hourlyProgress, STAKING_CONSTANTS.MAX_ROI);
    }, 0);

    return (progress / deposits.length) * 100;
  }, []);

  const contextValue = {
    state,
    setState,
    STAKING_CONSTANTS,
    deposit,
    withdrawRewards,
    withdrawAll,        // Add withdrawAll to context
    refreshUserInfo,
    getContractStatus,
    formatWithdrawDate,  // Add this to context
    calculateROIProgress // Add this to context
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

// Funciones de utilidad para cálculos
const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) return STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) return STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) return STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus;
  return 0;
};

const calculateRewards = (deposits) => {
  return deposits.reduce((total, deposit) => {
    const timeStaked = Date.now() / 1000 - deposit.timestamp;
    const baseReward = deposit.amount * STAKING_CONSTANTS.HOURLY_ROI * (timeStaked / 3600);
    const timeBonus = calculateTimeBonus(timeStaked);
    const maxReward = deposit.amount * STAKING_CONSTANTS.MAX_ROI;
    let reward = baseReward * (1 + timeBonus);
    return total + Math.min(reward, maxReward);
  }, 0);
};

// Funciones del contrato
const contractFunctions = {
  async deposit(amount) {
    // ...existing deposit logic...
  },

  async withdrawRewards() {
    // ...existing withdraw logic...
  },

  async withdrawAll() {
    // ...existing withdrawAll logic...
  },

  async emergencyWithdraw() {
    // ...existing emergencyWithdraw logic...
  },

  // Nuevas funciones
  async refreshUserInfo(address) {
    if (!state.contract || !address) return;
    try {
      const userInfo = await state.contract.getUserInfo(address);
      const deposits = await state.contract.getUserDeposits(address);
      setState(prev => ({
        ...prev,
        userInfo,
        userDeposits: deposits,
        stakingStats: {
          ...prev.stakingStats,
          totalDeposited: userInfo.totalDeposited.toString(),
          pendingRewards: userInfo.pendingRewards.toString(),
          lastWithdraw: userInfo.lastWithdraw.toNumber(),
          depositsCount: deposits.length,
          remainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - deposits.length
        }
      }));
    } catch (error) {
      console.error('Error refreshing user info:', error);
    }
  },

  async getContractStatus() {
    if (!state.contract) return;
    try {
      const [paused, migrated, treasury, balance] = await Promise.all([
        state.contract.paused(),
        state.contract.migrated(),
        state.contract.treasury(),
        state.contract.getContractBalance()
      ]);
      setState(prev => ({
        ...prev,
        isContractPaused: paused,
        isMigrated: migrated,
        treasuryAddress: treasury,
        totalPoolBalance: balance.toString()
      }));
    } catch (error) {
      console.error('Error getting contract status:', error);
    }
  }
};
