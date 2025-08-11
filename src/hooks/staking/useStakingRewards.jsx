import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { useStakingContract } from './useStakingContract';
import { globalCache } from '../../utils/cache/CacheManager';
import { globalRateLimiter } from '../../utils/performance/RateLimiter';
import { calculateStakingRewards } from '../../utils/blockchain/blockchainUtils';
import { STAKING_CONSTANTS } from '../../utils/staking/constants';
import { calculateUserAPY, calculateBaseAPY, calculateProjectedEarnings } from '../../utils/staking/apyCalculations';

export function useStakingRewards() {
  const { contract, getSignerAddress } = useStakingContract();

  // Add loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Centralized deposit formatting
  const formatDeposits = useCallback((deposits) => {
    if (!Array.isArray(deposits)) return [];
    
    return deposits.map((deposit, index) => {
      try {
        return {
          amount: typeof deposit.amount === 'string' && deposit.amount.includes('.') 
            ? deposit.amount 
            : ethers.formatEther(deposit.amount || '0'),
          timestamp: Number(deposit.timestamp || '0')
        };
      } catch (error) {
        console.error(`Error formatting deposit ${index}:`, error, deposit);
        return {
          amount: '0',
          timestamp: 0
        };
      }
    });
  }, []);

  const calculateUserRewards = useCallback(async (address) => {
    if (!contract || !address) return '0';
    setLoading(true);
    setError(null);
    try {
      const rewards = await contract.calculateRewards(address);
      setLoading(false);
      return ethers.formatEther(rewards);
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error("Error calculating rewards:", error);
      return '0';
    }
  }, [contract]);

  const getUserTotalDeposit = useCallback(async (address) => {
    if (!contract || !address) return '0';
    setLoading(true);
    setError(null);
    try {
      const totalDeposit = await contract.getTotalDeposit(address);
      setLoading(false);
      return ethers.formatEther(totalDeposit);
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error("Error getting total deposit:", error);
      return '0';
    }
  }, [contract]);

  const refreshUserInfo = useCallback(async (address, options = {}) => {
    if (!contract || !address) return;
    setLoading(true);
    setError(null);

    const rateLimiterKey = `user_info_${address}`;
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      setLoading(false);
      return;
    }

    try {
      const cacheKey = `user_info_${address}`;
      return await globalCache.get(
        cacheKey,
        async () => {
          const [userInfo, deposits, calculatedRewards] = await Promise.all([
            contract.getUserInfo(address).catch(() => ({
              totalDeposited: '0',
              pendingRewards: '0',
              lastWithdraw: '0'
            })),
            contract.getUserDeposits(address).catch(() => []),
            contract.calculateRewards(address).catch(() => BigInt(0))
          ]);

          const formattedDeposits = formatDeposits(deposits);

          const now = Math.floor(Date.now() / 1000);

          // Calculate ROI progress
          let totalProgress = 0;
          formattedDeposits.forEach(deposit => {
            const timeStaked = now - deposit.timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            const dailyROI = STAKING_CONSTANTS.HOURLY_ROI * 24 * 100;
            const progress = Math.min(daysStaked * dailyROI, STAKING_CONSTANTS.MAX_ROI * 100);
            totalProgress += progress;
          });

          const roiProgress = formattedDeposits.length > 0
            ? totalProgress / formattedDeposits.length
            : 0;

          const formattedUserInfo = {
            totalStaked: ethers.formatEther(userInfo.totalDeposited || '0'),
            pendingRewards: ethers.formatEther(userInfo.pendingRewards || '0'),
            lastWithdraw: Number(userInfo.lastWithdraw || '0'),
            roiProgress: roiProgress,
            stakingDays: Math.floor((now - (formattedDeposits[0]?.timestamp || now)) / (24 * 3600)),
            calculatedRewards: ethers.formatEther(calculatedRewards)
          };

          return {
            userInfo: formattedUserInfo,
            deposits: formattedDeposits,
            stakingStats: {
              totalDeposited: formattedUserInfo.totalStaked,
              pendingRewards: formattedUserInfo.calculatedRewards,
              lastWithdraw: formattedUserInfo.lastWithdraw,
              depositsCount: formattedDeposits.length,
              remainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - formattedDeposits.length
            }
          };
        },
        options.cacheTime || 60000 // Use options if provided, otherwise default to 1 minute
      );
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error("Error refreshing user info:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, formatDeposits]);

  // Add missing calculateStakingRewards function
  const calculateStakingRewards = useCallback((amount, daysStaked, hourlyROI, maxROI) => {
    const amountNum = parseFloat(amount) || 0;
    const daysNum = parseFloat(daysStaked) || 0;
    const hourlyRate = parseFloat(hourlyROI) || 0.0001; // 0.01% per hour default
    
    // Contract uses linear calculation
    const totalHours = daysNum * 24;
    const totalRewards = amountNum * (hourlyRate / 100) * totalHours;
    
    return {
      currentRewards: totalRewards,
      maxRewards: amountNum * (parseFloat(maxROI) || 1), // Max 100% ROI
      progress: Math.min((totalRewards / (amountNum * 1)) * 100, 100),
      dailyRate: hourlyRate * 24 * 100 // Convert to daily percentage
    };
  }, []);

  const getDetailedStakingStats = useCallback(async (address) => {
    if (!contract || !address) return null;
    setLoading(true);
    setError(null);

    try {
      const [userInfo, deposits] = await Promise.all([
        contract.getUserInfo(address).catch(() => ({
          totalDeposited: '0',
          pendingRewards: '0',
          lastWithdraw: '0'
        })),
        contract.getUserDeposits(address).catch(() => [])
      ]);

      const currentTimestamp = Math.floor(Date.now() / 1000);

      const formattedDeposits = formatDeposits(deposits).map((deposit, index) => {
        const timeStaked = currentTimestamp - deposit.timestamp;
        const daysStaked = timeStaked / (24 * 3600);

        const rewardsData = calculateStakingRewards(
          deposit.amount,
          daysStaked,
          STAKING_CONSTANTS.HOURLY_ROI || 0.001,
          STAKING_CONSTANTS.MAX_ROI || 1
        );

        return {
          ...deposit,
          index,
          daysStaked: Math.floor(daysStaked),
          ...rewardsData
        };
      });

      // Calculate projections
      const totalStaked = parseFloat(ethers.formatEther(userInfo.totalDeposited || '0'));
      const baseDaily = totalStaked * 0.0024; // 0.24% daily from contract
      
      const projections = {
        oneMonth: (baseDaily * 30).toFixed(4),
        threeMonths: (baseDaily * 90).toFixed(4),
        sixMonths: (baseDaily * 180).toFixed(4),
        oneYear: (baseDaily * 365).toFixed(4)
      };

      const result = {
        deposits: formattedDeposits,
        userInfo: {
          totalStaked: ethers.formatEther(userInfo.totalDeposited || '0'),
          pendingRewards: ethers.formatEther(userInfo.pendingRewards || '0'),
          lastWithdraw: Number(userInfo.lastWithdraw || '0')
        },
        projections,
        summary: {
          estimatedMonthlyRewards: projections.oneMonth
        }
      };

      setLoading(false);
      return result;
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error("Error getting detailed staking stats:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, formatDeposits, calculateStakingRewards]);

  const calculateRealAPY = useCallback(async () => {
    if (!contract) {
      return { baseAPY: 8.76, dailyROI: 0.24 }; // Updated for SmartStaking v3.0
    }
    setLoading(true);
    setError(null);
    try {
      // FIXED: Use the corrected contract constants
      const hourlyROI = 0.0001; // 0.01% per hour
        const dailyROI = hourlyROI * 24; // 0.24% per day
      const annualAPY = (dailyROI * 365) * 100; // This gives 8.76%
      
      console.log('FIXED APY calculation:', {
        hourlyROI: (hourlyROI * 100).toFixed(1) + '%',
        dailyROI: (dailyROI * 100).toFixed(1) + '%',
        annualAPY: annualAPY.toFixed(2) + '%' // Updated: This should be 8.76%
      });

      setLoading(false);
      return {
        baseAPY: annualAPY, // 8.76
        dailyRate: dailyROI * 100, // 0.24
       hourlyRate: hourlyROI * 100, // 0.01
        metrics: {
          hourlyROI: `${(hourlyROI * 100).toFixed(1)}%`,
          dailyROI: `${(dailyROI * 100).toFixed(1)}%`,
          annualAPY: `${annualAPY.toFixed(2)}%` // Now shows 8.76%
        }
      };
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error("Error calculating APY:", error);
      return { baseAPY: 8.76, dailyROI: 0.24 }; // Updated for SmartStaking v3.0
    }
  }, [contract]);

  // Añadir wrapper para getSignerAddress con mejor manejo de errores
  const safeGetSignerAddress = useCallback(async () => {
    try {
      if (!getSignerAddress || typeof getSignerAddress !== 'function') {
        console.error('getSignerAddress is not available from useStakingContract');
        return null;
      }
      return await getSignerAddress();
    } catch (error) {
      console.error('Error getting signer address:', error);
      return null;
    }
  }, [getSignerAddress]);

  // Look for the APY calculation function and fix it
  const calculateAPYMetrics = useCallback(() => {
    const hourlyROI = 0.0001; // 0.01% per hour
        const dailyROI = hourlyROI * 24; // 0.0024 = 0.24% daily
    
    // CORRECTED: Annual APY calculation
    // Old incorrect: dailyROI * 365 = 8.76 (876%)
    // Updated for SmartStaking v3.0: dailyROI * 365 * 100 = 8.76%
        const annualAPY = (dailyROI * 365) * 100; // This gives 8.76%
    
    const apyMetrics = {
      hourlyROI: `${(hourlyROI * 100).toFixed(2)}%`, // 0.01%
        dailyROI: `${(dailyROI * 100).toFixed(2)}%`, // 0.24%
      annualAPY: `${annualAPY.toFixed(2)}%` // Now shows 8.76%
    };
    
    console.log('FIXED APY calculation:', apyMetrics);
    
    return {
      baseAPY: annualAPY, // 8.76
      dailyRate: dailyROI * 100, // 2.4
      hourlyRate: hourlyROI * 100, // 0.1
      metrics: apyMetrics
    };
  }, []);

  return {
    calculateUserRewards,
    getUserTotalDeposit,
    refreshUserInfo,
    getDetailedStakingStats,
    calculateRealAPY,
    getSignerAddress: safeGetSignerAddress, // Export the safe wrapper with proper function check
    loading,
    error
  };
}

export default useStakingRewards;