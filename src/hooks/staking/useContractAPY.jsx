import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStakingContract } from './useStakingContract';
import { globalCache } from '../../utils/cache/CacheManager';

export function useContractAPY() {
  const { contract, getSignerAddress } = useStakingContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener constantes reales del contrato
  const getContractConstants = useCallback(async () => {
    if (!contract) return null;
    
    try {
      const cacheKey = 'contract_constants';
      return await globalCache.get(cacheKey, async () => {
        // Constantes actualizadas del nuevo contrato SmartStaking v3.0
        const constants = {
          HOURLY_ROI: 0.0001, // 0.01% por hora (HOURLY_ROI_PERCENTAGE = 100 basis points)
          DAILY_ROI: 0.0024, // 0.24% diario (0.01% * 24)
          ANNUAL_ROI: 8.76, // 8.76% anual (0.24% * 365) - CORREGIDO para nuevo contrato
          MAX_ROI_MULTIPLIER: 1.25, // 125% máximo ROI
          COMMISSION_RATE: 0.06, // 6% comisión
          MIN_DEPOSIT: ethers.parseEther('5'), // 5 POL mínimo
          MAX_DEPOSIT: ethers.parseEther('10000'), // 10,000 POL máximo
          MAX_DEPOSITS_PER_USER: 300,
          PRECISION: 10000 // Para cálculos de precisión
        };
        return constants;
      }, 3600000); // Cache por 1 hora
    } catch (error) {
      console.error('Error getting contract constants:', error);
      return null;
    }
  }, [contract]);

  // Calcular recompensas usando la función del contrato
  const calculateContractRewards = useCallback(async (userAddress) => {
    if (!contract || !userAddress) return '0';
    
    setLoading(true);
    setError(null);
    
    try {
      const rewards = await contract.calculateRewards(userAddress);
      setLoading(false);
      return ethers.formatEther(rewards);
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error('Error calculating contract rewards:', error);
      return '0';
    }
  }, [contract]);

  // Obtener información completa del usuario desde el contrato
  const getContractUserInfo = useCallback(async (userAddress) => {
    if (!contract || !userAddress) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const cacheKey = `contract_user_info_${userAddress}`;
      const result = await globalCache.get(cacheKey, async () => {
        const [userInfo, deposits, totalDeposit, calculatedRewards] = await Promise.all([
          contract.getUserInfo(userAddress),
          contract.getUserDeposits(userAddress),
          contract.getTotalDeposit(userAddress),
          contract.calculateRewards(userAddress)
        ]);

        return {
          userInfo: {
            totalDeposited: ethers.formatEther(userInfo.totalDeposited),
            pendingRewards: ethers.formatEther(userInfo.pendingRewards),
            lastWithdraw: Number(userInfo.lastWithdraw)
          },
          deposits: deposits.map(deposit => ({
            amount: ethers.formatEther(deposit.amount),
            timestamp: Number(deposit.timestamp)
          })),
          totalDeposit: ethers.formatEther(totalDeposit),
          calculatedRewards: ethers.formatEther(calculatedRewards)
        };
      }, 30000); // Cache por 30 segundos

      setLoading(false);
      return result;
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error('Error getting contract user info:', error);
      return null;
    }
  }, [contract]);

  // Calcular APY real basado en el contrato
  const calculateRealTimeAPY = useCallback(async (userAddress) => {
    if (!contract || !userAddress) return null;
    
    try {
      const [constants, userInfo] = await Promise.all([
        getContractConstants(),
        getContractUserInfo(userAddress)
      ]);

      if (!constants || !userInfo) return null;

      const currentTime = Math.floor(Date.now() / 1000);
      let totalWeightedRewards = 0;
      let totalWeightedPrincipal = 0;
      let totalTimeStaked = 0;

      // Calcular APY basado en cada depósito individual
      userInfo.deposits.forEach(deposit => {
        const timeStaked = currentTime - deposit.timestamp;
        const hoursStaked = timeStaked / 3600;
        const principal = parseFloat(deposit.amount);
        
        // Calcular recompensas esperadas según el contrato
        const expectedRewards = principal * constants.HOURLY_ROI * hoursStaked;
        const maxRewards = principal * (constants.MAX_ROI_MULTIPLIER - 1);
        const actualRewards = Math.min(expectedRewards, maxRewards);
        
        totalWeightedRewards += actualRewards;
        totalWeightedPrincipal += principal;
        totalTimeStaked += timeStaked;
      });

      if (totalWeightedPrincipal === 0 || totalTimeStaked === 0) {
        return {
          currentAPY: 0,
          projectedAPY: constants.ANNUAL_ROI,
          dailyRate: constants.DAILY_ROI,
          totalRewards: 0,
          efficiency: 0
        };
      }

      const avgTimeStaked = totalTimeStaked / userInfo.deposits.length;
      const avgDaysStaked = avgTimeStaked / (24 * 3600);
      
      // APY actual basado en recompensas reales
      const actualAPY = avgDaysStaked > 0 ? 
        (totalWeightedRewards / totalWeightedPrincipal) * (365 / avgDaysStaked) * 100 : 0;

      // APY proyectado considerando límites del contrato
      const projectedDailyRewards = totalWeightedPrincipal * constants.DAILY_ROI;
      const projectedAPY = Math.min(constants.ANNUAL_ROI, actualAPY);

      // Eficiencia comparativa
      const efficiency = actualAPY > 0 ? (actualAPY / constants.ANNUAL_ROI) * 100 : 0;

      return {
        currentAPY: actualAPY,
        projectedAPY: projectedAPY,
        dailyRate: constants.DAILY_ROI * 100,
        totalRewards: totalWeightedRewards,
        efficiency: Math.min(efficiency, 100),
        avgDaysStaked: Math.floor(avgDaysStaked),
        maxPossibleAPY: constants.ANNUAL_ROI,
        contractRewards: parseFloat(userInfo.calculatedRewards)
      };
    } catch (error) {
      console.error('Error calculating real-time APY:', error);
      return null;
    }
  }, [contract, getContractConstants, getContractUserInfo]);

  // Proyectar ganancias futuras
  const projectFutureEarnings = useCallback(async (userAddress, days = 30) => {
    try {
      const [constants, userInfo] = await Promise.all([
        getContractConstants(),
        getContractUserInfo(userAddress)
      ]);

      if (!constants || !userInfo) return null;

      const totalPrincipal = parseFloat(userInfo.totalDeposit);
      const dailyRate = constants.DAILY_ROI;
      
      // Calcular proyecciones para diferentes períodos
      const projections = {
        daily: totalPrincipal * dailyRate,
        weekly: totalPrincipal * dailyRate * 7,
        monthly: totalPrincipal * dailyRate * 30,
        quarterly: totalPrincipal * dailyRate * 90,
        yearly: totalPrincipal * dailyRate * 365
      };

      // Aplicar límite máximo de ROI
      const maxTotalRewards = totalPrincipal * (constants.MAX_ROI_MULTIPLIER - 1);
      
      Object.keys(projections).forEach(period => {
        projections[period] = Math.min(projections[period], maxTotalRewards);
      });

      return {
        ...projections,
        maxPossibleRewards: maxTotalRewards,
        principalAmount: totalPrincipal,
        dailyRate: dailyRate * 100,
        reachesMaxIn: Math.ceil(maxTotalRewards / (totalPrincipal * dailyRate))
      };
    } catch (error) {
      console.error('Error projecting future earnings:', error);
      return null;
    }
  }, [getContractConstants, getContractUserInfo]);

  return {
    calculateContractRewards,
    getContractUserInfo,
    calculateRealTimeAPY,
    projectFutureEarnings,
    getContractConstants,
    loading,
    error
  };
}
