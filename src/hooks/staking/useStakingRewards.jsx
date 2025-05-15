import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useStakingContract } from './useStakingContract';
import { globalCache } from '../../utils/cache/CacheManager';
import { globalRateLimiter } from '../../utils/performance/RateLimiter';
import { calculateStakingRewards } from '../../utils/blockchain/blockchainUtils';
import { STAKING_CONSTANTS } from '../../utils/constants';

export function useStakingRewards() {
  const { contract, getSignerAddress } = useStakingContract();
  
  const calculateUserRewards = useCallback(async (address) => {
    if (!contract || !address) return '0';
    
    try {
      const rewards = await contract.calculateRewards(address);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error("Error calculating rewards:", error);
      return '0';
    }
  }, [contract]);

  const getUserTotalDeposit = useCallback(async (address) => {
    if (!contract || !address) return '0';
    
    try {
      const totalDeposit = await contract.getTotalDeposit(address);
      return ethers.formatEther(totalDeposit);
    } catch (error) {
      console.error("Error getting total deposit:", error);
      return '0';
    }
  }, [contract]);

  const refreshUserInfo = useCallback(async (address) => {
    if (!contract || !address) {
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
          const [userInfo, deposits, calculatedRewards] = await Promise.all([
            contract.getUserInfo(address).catch(() => ({ 
              totalDeposited: '0', 
              pendingRewards: '0', 
              lastWithdraw: '0' 
            })),
            contract.getUserDeposits(address).catch(() => []),
            contract.calculateRewards(address).catch(() => BigInt(0))
          ]);
          
          // Format deposits
          const formattedDeposits = Array.isArray(deposits) 
            ? deposits.map(deposit => ({
                amount: ethers.formatEther(deposit.amount || '0'),
                timestamp: Number(deposit.timestamp || '0')
              }))
            : [];

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

          // Format user info
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
        60000 // 1 minute cache
      );
    } catch (error) {
      console.error("Error refreshing user info:", error);
      return null;
    }
  }, [contract]);

  const getDetailedStakingStats = useCallback(async (address) => {
    if (!contract || !address) return null;
    
    try {
      // Get user data from contract
      const [userInfo, deposits, provider] = await Promise.all([
        contract.getUserInfo(address).catch(() => ({ 
          totalDeposited: '0', 
          pendingRewards: '0', 
          lastWithdraw: '0' 
        })),
        contract.getUserDeposits(address).catch(() => []),
        contract.provider
      ]);
      
      // Get current timestamp
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Format deposits and calculate stats
      const formattedDeposits = Array.isArray(deposits) 
        ? deposits.map((deposit, index) => {
            const amount = ethers.formatEther(deposit.amount || '0');
            const timestamp = Number(deposit.timestamp || '0');
            const timeStaked = currentTimestamp - timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            
            // Calculate rewards for this deposit
            const rewardsData = calculateStakingRewards(
              amount, 
              daysStaked, 
              STAKING_CONSTANTS.HOURLY_ROI,
              STAKING_CONSTANTS.MAX_ROI
            );
            
            // Calculate time to next bonus
            let nextBonusTime = null;
            let nextBonusPercentage = null;
            
            if (daysStaked < STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) {
              nextBonusTime = STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days - daysStaked;
              nextBonusPercentage = STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus * 100;
            } else if (daysStaked < STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) {
              nextBonusTime = STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days - daysStaked;
              nextBonusPercentage = STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus * 100;
            } else if (daysStaked < STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) {
              nextBonusTime = STAKING_CONSTANTS.TIME_BONUSES.YEAR.days - daysStaked;
              nextBonusPercentage = STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus * 100;
            }
            
            return {
              id: index,
              amount,
              timestamp,
              daysStaked: Math.floor(daysStaked),
              progress: rewardsData.progress,
              estimatedRewards: rewardsData.rewards,
              timeToMaxRewards: Math.max(0, rewardsData.daysToMax - daysStaked),
              nextBonus: nextBonusTime ? {
                days: Math.ceil(nextBonusTime),
                percentage: nextBonusPercentage
              } : null
            };
          })
        : [];
      
      // Calculate totals
      const totalStaked = ethers.formatEther(userInfo.totalDeposited || '0');
      const pendingRewards = ethers.formatEther(userInfo.pendingRewards || '0');
      
      // Calculate average ROI progress
      const totalProgress = formattedDeposits.reduce((sum, dep) => sum + dep.progress, 0);
      const avgProgress = formattedDeposits.length > 0 
        ? totalProgress / formattedDeposits.length 
        : 0;
      
      // Calculate timeBonus based on staking duration
      const oldestDepositTime = formattedDeposits.length > 0 
        ? Math.min(...formattedDeposits.map(d => d.timestamp)) 
        : currentTimestamp;
      
      const stakingDays = Math.floor((currentTimestamp - oldestDepositTime) / (24 * 3600));
      let timeBonus = 1.0; // Base multiplier
      
      if (stakingDays >= STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) {
        timeBonus = 1 + STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus;
      } else if (stakingDays >= STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) {
        timeBonus = 1 + STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus;
      } else if (stakingDays >= STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) {
        timeBonus = 1 + STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus;
      }
      
      // Calculate monthly rewards estimate
      const dailyROI = STAKING_CONSTANTS.HOURLY_ROI * 24;
      const baseMonthlyRewards = parseFloat(totalStaked) * dailyROI * 30;
      const boostedMonthlyRewards = baseMonthlyRewards * timeBonus;
      
      return {
        summary: {
          totalStaked,
          pendingRewards,
          deposits: formattedDeposits.length,
          oldestDeposit: oldestDepositTime,
          newestDeposit: formattedDeposits.length > 0 
            ? Math.max(...formattedDeposits.map(d => d.timestamp)) 
            : 0,
          stakingDays,
          lastWithdraw: Number(userInfo.lastWithdraw || '0'),
          avgProgress,
          currentTimeBonus: timeBonus,
          estimatedMonthlyRewards: boostedMonthlyRewards.toFixed(4)
        },
        deposits: formattedDeposits,
        projections: {
          oneMonth: calculateStakingRewards(totalStaked, 30, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards,
          threeMonths: calculateStakingRewards(totalStaked, 90, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards,
          sixMonths: calculateStakingRewards(totalStaked, 180, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards,
          oneYear: calculateStakingRewards(totalStaked, 365, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards
        }
      };
    } catch (error) {
      console.error("Error getting detailed staking stats:", error);
      return null;
    }
  }, [contract]);

  const calculateRealAPY = useCallback(async () => {
    if (!contract) {
      return { baseAPY: 88, dailyROI: 0.24 }; // Default values
    }

    try {
      // Calculate APY based on the hourly ROI
      const hourlyROI = STAKING_CONSTANTS.HOURLY_ROI;
      const dailyROI = hourlyROI * 24;
      
      // Example calculation for 100 tokens over a year
      const sampleAmount = 100;
      const yearDuration = 365;
      
      const rewardsData = calculateStakingRewards(
        sampleAmount,
        yearDuration,
        STAKING_CONSTANTS.HOURLY_ROI,
        STAKING_CONSTANTS.MAX_ROI
      );
      
      return {
        baseAPY: rewardsData.apy,
        dailyROI: dailyROI * 100, // Convert to percentage
        verified: true,
        maxRewards: rewardsData.maxRewards,
        daysToMax: rewardsData.daysToMax
      };
    } catch (error) {
      console.error("Error calculating APY:", error);
      return { baseAPY: 88, dailyROI: 0.24 };
    }
  }, [contract]);

  return {
    calculateUserRewards,
    getUserTotalDeposit,
    refreshUserInfo,
    getDetailedStakingStats,
    calculateRealAPY
  };
}
