import { ethers } from 'ethers';
import { STAKING_CONSTANTS } from './constants';

/**
 * Utility for safe number parsing and validation
 * @param {*} value - Value to parse
 * @returns {number} Safe parsed number
 */
export const safeParseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  
  try {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'string') {
      if (value.includes('.')) return parseFloat(value) || 0;
      return parseFloat(ethers.formatEther(value)) || 0;
    }
    if (typeof value === 'bigint') {
      return parseFloat(ethers.formatEther(value.toString())) || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error parsing number:", error, value);
    return 0;
  }
};

/**
 * Calculate time-based bonus multiplier
 * @param {number} daysStaked - Days user has been staking
 * @returns {number} Bonus multiplier (1.0 = no bonus, 1.05 = 5% bonus)
 */
export const calculateTimeBonus = (daysStaked) => {
  if (daysStaked >= 365) return 1.05; // 5% bonus for 1+ year
  if (daysStaked >= 180) return 1.03; // 3% bonus for 6+ months
  if (daysStaked >= 90) return 1.01;  // 1% bonus for 3+ months
  return 1.0; // No bonus
};

/**
 * Calculate volume-based bonus multiplier
 * @param {number} totalStaked - Total amount staked by user
 * @returns {number} Volume bonus multiplier
 */
export const calculateVolumeBonus = (totalStaked) => {
  if (totalStaked >= 10000) return 1.02; // 2% bonus for 10k+ staked
  if (totalStaked >= 5000) return 1.01;  // 1% bonus for 5k+ staked
  if (totalStaked >= 1000) return 1.005; // 0.5% bonus for 1k+ staked
  return 1.0; // No bonus
};

/**
 * Calculate efficiency penalty based on deposit distribution
 * @param {Array} deposits - User's deposit history
 * @param {number} maxDeposits - Maximum allowed deposits
 * @returns {number} Efficiency multiplier (< 1.0 means penalty)
 */
export const calculateEfficiencyMultiplier = (deposits, maxDeposits) => {
  if (!deposits || deposits.length === 0) return 1.0;
  
  const depositCount = deposits.length;
  const utilizationRatio = depositCount / maxDeposits;
  
  // Penalty for too many small deposits (inefficient)
  if (utilizationRatio > 0.8) return 0.95; // 5% penalty
  if (utilizationRatio > 0.6) return 0.98; // 2% penalty
  
  // Optimal range: 20-60% utilization
  return 1.0;
};

/**
 * Calculate compound interest effect
 * @param {number} principal - Initial amount
 * @param {number} rate - Daily rate (as decimal)
 * @param {number} days - Number of days
 * @param {number} maxMultiplier - Maximum ROI multiplier
 * @returns {Object} Compound calculation results
 */
export const calculateCompoundRewards = (principal, rate, days, maxMultiplier = 1.25) => {
  if (principal <= 0 || rate <= 0 || days <= 0) {
    return {
      finalAmount: principal,
      totalRewards: 0,
      effectiveRate: 0,
      reachedMax: false,
      daysToMax: 0
    };
  }
  
  const maxRewards = principal * (maxMultiplier - 1);
  let currentAmount = principal;
  let totalRewards = 0;
  let day = 0;
  let reachedMax = false;
  
  // Calculate compound rewards day by day until max or target days
  while (day < days && !reachedMax) {
    const dailyReward = currentAmount * rate;
    
    if (totalRewards + dailyReward >= maxRewards) {
      totalRewards = maxRewards;
      reachedMax = true;
    } else {
      totalRewards += dailyReward;
      currentAmount += dailyReward;
    }
    day++;
  }
  
  const effectiveRate = days > 0 ? totalRewards / (principal * days) : 0;
  const daysToMax = reachedMax ? day : Math.ceil(maxRewards / (principal * rate));
  
  return {
    finalAmount: principal + totalRewards,
    totalRewards,
    effectiveRate,
    reachedMax,
    daysToMax: Math.min(daysToMax, Math.ceil(maxRewards / (principal * rate)))
  };
};

/**
 * Calculate base APY from contract constants
 * @param {Object} constants - Staking constants from contract
 * @returns {Object} Base APY calculations
 */
export const calculateBaseAPY = (constants = STAKING_CONSTANTS) => {
  const hourlyROI = constants.HOURLY_ROI || 0.0001; // 0.01% per hour
  const maxROI = constants.MAX_ROI || 1.25;
  const dailyRate = hourlyROI * 24; // 0.0024 = 0.24% daily
  
  // Correct APY calculation: 0.24% daily = 8.76% annual
  // dailyRate is already in decimal (0.0024), so multiply by 365 and convert to percentage
  const annualROI = dailyRate * 365; // This gives 0.0876 (8.76% in decimal)
  const correctedAPY = annualROI * 100; // Convert to percentage: 8.76%
  
  // Capped APY considering max ROI limit
  const daysToMax = Math.ceil((maxROI - 1) / dailyRate);
  const cappedAPY = daysToMax >= 365 ? correctedAPY : ((maxROI - 1) * (365 / daysToMax)) * 100;
  
  return {
    simpleAPY: correctedAPY,
    cappedAPY: Math.min(cappedAPY, correctedAPY),
    dailyRate: dailyRate * 100, // 0.24%
    hourlyRate: hourlyROI * 100, // 0.01%
    maxROI,
    daysToMax
  };
};

/**
 * Calculate user's effective APY considering all factors
 * @param {Object} userData - User's staking data
 * @param {Object} constants - Staking constants
 * @returns {Object} Comprehensive APY analysis
 */
export const calculateUserAPY = (userData, constants = STAKING_CONSTANTS) => {
  const {
    userDeposits = [],
    totalStaked = 0,
    totalWithdrawn = 0,
    rewardsClaimed = 0,
    stakingDays = 0
  } = userData;
  
  const safeStaked = safeParseNumber(totalStaked);
  const safeWithdrawn = safeParseNumber(totalWithdrawn);
  const safeClaimed = safeParseNumber(rewardsClaimed);
  
  // Get base APY
  const baseAPY = calculateBaseAPY(constants);
  
  // Calculate multipliers
  const timeBonus = calculateTimeBonus(stakingDays);
  const volumeBonus = calculateVolumeBonus(safeStaked);
  const efficiencyMultiplier = calculateEfficiencyMultiplier(
    userDeposits, 
    constants.MAX_DEPOSITS_PER_USER
  );
  
  // Calculate withdrawal penalty
  const totalValue = safeStaked + safeWithdrawn;
  const holdRatio = totalValue > 0 ? safeStaked / totalValue : 1;
  const withdrawalPenalty = holdRatio < 0.8 ? 0.95 : 1.0; // 5% penalty for high withdrawal ratio
  
  // Calculate final multiplier
  const finalMultiplier = timeBonus * volumeBonus * efficiencyMultiplier * withdrawalPenalty;
  
  // Apply multiplier to base APY
  const effectiveAPY = baseAPY.cappedAPY * finalMultiplier;
  
  // Calculate actual returns if user has been staking
  let actualAPY = 0;
  if (stakingDays > 0 && safeStaked > 0) {
    const annualizedReturns = (safeClaimed / safeStaked) * (365 / stakingDays);
    actualAPY = annualizedReturns * 100;
  }
  
  return {
    baseAPY: baseAPY.cappedAPY,
    effectiveAPY,
    actualAPY,
    projectedAPY: Math.min(effectiveAPY, baseAPY.cappedAPY * 1.1), // Cap at 110% of base
    multipliers: {
      timeBonus: (timeBonus - 1) * 100,
      volumeBonus: (volumeBonus - 1) * 100,
      efficiencyMultiplier: (efficiencyMultiplier - 1) * 100,
      withdrawalPenalty: (withdrawalPenalty - 1) * 100,
      total: (finalMultiplier - 1) * 100
    },
    metrics: {
      dailyRate: baseAPY.dailyRate * finalMultiplier,
      monthlyRate: baseAPY.dailyRate * finalMultiplier * 30,
      holdRatio: holdRatio * 100,
      stakingDays,
      totalValue: safeStaked + safeClaimed,
      roi: safeStaked > 0 ? (safeClaimed / safeStaked) * 100 : 0
    },
    recommendations: generateAPYRecommendations({
      timeBonus,
      volumeBonus,
      efficiencyMultiplier,
      withdrawalPenalty,
      stakingDays,
      depositCount: userDeposits.length,
      maxDeposits: constants.MAX_DEPOSITS_PER_USER
    })
  };
};

/**
 * Generate recommendations to improve APY
 * @param {Object} factors - APY calculation factors
 * @returns {Array} Array of recommendation strings
 */
const generateAPYRecommendations = (factors) => {
  const recommendations = [];
  
  if (factors.timeBonus === 1.0) {
    if (factors.stakingDays < 90) {
      recommendations.push(`Stake for ${90 - factors.stakingDays} more days to unlock 1% time bonus`);
    }
  } else if (factors.timeBonus < 1.05) {
    const nextMilestone = factors.stakingDays < 180 ? 180 : 365;
    const bonus = factors.stakingDays < 180 ? 3 : 5;
    recommendations.push(`Continue staking to reach ${nextMilestone} days for ${bonus}% bonus`);
  }
  
  if (factors.volumeBonus === 1.0) {
    recommendations.push("Increase stake amount to unlock volume bonuses");
  }
  
  if (factors.efficiencyMultiplier < 1.0) {
    recommendations.push("Consider consolidating deposits to improve efficiency");
  }
  
  if (factors.withdrawalPenalty < 1.0) {
    recommendations.push("Avoid frequent withdrawals to maintain optimal APY");
  }
  
  if (factors.depositCount >= factors.maxDeposits * 0.8) {
    recommendations.push("You're near the deposit limit. Consider larger individual deposits");
  }
  
  return recommendations;
};

/**
 * Calculate projected earnings over time periods
 * @param {number} principal - Amount staked
 * @param {number} effectiveAPY - User's effective APY (as percentage)
 * @param {Object} constants - Staking constants
 * @returns {Object} Projected earnings
 */
export const calculateProjectedEarnings = (principal, effectiveAPY, constants = STAKING_CONSTANTS) => {
  const safePrincipal = safeParseNumber(principal);
  const dailyRate = (effectiveAPY / 100) / 365;
  const maxMultiplier = constants.MAX_ROI || 1.25;
  
  const periods = [7, 30, 90, 180, 365];
  const projections = {};
  
  periods.forEach(days => {
    const result = calculateCompoundRewards(safePrincipal, dailyRate, days, maxMultiplier);
    projections[`${days}days`] = {
      rewards: result.totalRewards,
      total: result.finalAmount,
      apy: (result.totalRewards / safePrincipal) * (365 / days) * 100,
      reachedMax: result.reachedMax
    };
  });
  
  return projections;
};

/**
 * Format APY for display
 * @param {number} apy - APY value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted APY string
 */
export const formatAPY = (apy, decimals = 1) => {
  if (isNaN(apy) || apy === null || apy === undefined) return '0.0%';
  return `${Number(apy).toFixed(decimals)}%`;
};

/**
 * Get APY status and color coding
 * @param {number} apy - APY value
 * @param {number} baseAPY - Base APY for comparison
 * @returns {Object} Status information
 */
export const getAPYStatus = (apy, baseAPY) => {
  const ratio = apy / baseAPY;
  
  if (ratio >= 1.1) return { status: 'excellent', color: 'text-green-400' };
  if (ratio >= 1.05) return { status: 'very-good', color: 'text-blue-400' };
  if (ratio >= 1.0) return { status: 'good', color: 'text-purple-400' };
  if (ratio >= 0.95) return { status: 'fair', color: 'text-yellow-400' };
  return { status: 'poor', color: 'text-red-400' };
};

/**
 * Calculate APY using contract-based data
 * @param {Object} contractData - Data from contract functions
 * @param {Object} constants - Contract constants
 * @returns {Object} Contract-based APY analysis
 */
export const calculateContractBasedAPY = (contractData, constants = STAKING_CONSTANTS) => {
  const {
    userInfo,
    deposits = [],
    calculatedRewards = '0',
    totalDeposit = '0'
  } = contractData;

  const safeStaked = safeParseNumber(totalDeposit);
  const safeRewards = safeParseNumber(calculatedRewards);
  
  if (safeStaked === 0 || deposits.length === 0) {
    return {
      baseAPY: 8.76, // Updated for SmartStaking v3.0
      effectiveAPY: 0,
      actualAPY: 0,
      contractAPY: 8.76,
      metrics: {
        dailyRate: 0.24,
        hourlyRate: 0.1,
        totalRewards: 0,
        efficiency: 0,
        daysActive: 0
      }
    };
  }

  // Calculate real contract metrics
  const currentTime = Math.floor(Date.now() / 1000);
  const firstDepositTime = Math.min(...deposits.map(d => d.timestamp));
  const daysActive = Math.floor((currentTime - firstDepositTime) / (24 * 3600));
  
  // Real APY based on contract rewards
  const actualAPY = daysActive > 0 ? 
    (safeRewards / safeStaked) * (365 / daysActive) * 100 : 0;

  // Contract APY (constant) - Corrected value
  const contractAPY = 8.76; // 0.01% per hour * 24 * 365 = 8.76%

  // Calculate efficiency
  const theoreticalRewards = safeStaked * (constants.HOURLY_ROI || 0.001) * (daysActive * 24);
  const efficiency = theoreticalRewards > 0 ? (safeRewards / theoreticalRewards) * 100 : 0;

  // Effective APY considering contract limits
  const maxROI = constants.MAX_ROI || 1.25;
  const maxRewards = safeStaked * (maxROI - 1);
  const cappedRewards = Math.min(safeRewards, maxRewards);
  const effectiveAPY = daysActive > 0 ? 
    (cappedRewards / safeStaked) * (365 / daysActive) * 100 : contractAPY;

  return {
    baseAPY: contractAPY,
    effectiveAPY: Math.min(effectiveAPY, contractAPY),
    actualAPY: actualAPY,
    contractAPY: contractAPY,
    metrics: {
      dailyRate: 0.24, // 0.24% daily from contract
      hourlyRate: 0.01, // 0.01% per hour from contract
      totalRewards: safeRewards,
      efficiency: Math.min(efficiency, 100),
      daysActive,
      maxPossibleRewards: maxRewards,
      rewardsCapped: safeRewards >= maxRewards
    },
    contractData: {
      totalDeposited: safeStaked,
      calculatedRewards: safeRewards,
      pendingRewards: safeParseNumber(userInfo?.pendingRewards || '0'),
      lastWithdraw: userInfo?.lastWithdraw || 0,
      depositsCount: deposits.length
    }
  };
};

/**
 * Calculate projected earnings using contract rates
 * @param {number} principal - Amount to stake
 * @param {number} days - Days to project
 * @param {Object} constants - Contract constants
 * @returns {Object} Projected earnings based on contract
 */
export const calculateContractProjections = (principal, days = 30, constants = STAKING_CONSTANTS) => {
  const safePrincipal = safeParseNumber(principal);
  const hourlyRate = constants.HOURLY_ROI || 0.0001; // 0.01% per hour
  const maxMultiplier = constants.MAX_ROI || 1.25; // 125% maximum
  
  const totalHours = days * 24;
  const totalRewardsUncapped = safePrincipal * hourlyRate * totalHours;
  const maxRewards = safePrincipal * (maxMultiplier - 1);
  const actualRewards = Math.min(totalRewardsUncapped, maxRewards);
  
  const dailyRewards = actualRewards / days;
  const effectiveAPY = days > 0 ? (actualRewards / safePrincipal) * (365 / days) * 100 : 0;
  
  // Calculate when max ROI is reached
  const daysToMaxROI = Math.ceil(maxRewards / (safePrincipal * hourlyRate * 24));
  
  return {
    principal: safePrincipal,
    projectedRewards: actualRewards,
    dailyRewards: dailyRewards,
    totalValue: safePrincipal + actualRewards,
    effectiveAPY: Math.min(effectiveAPY, 8.76), // Cap at 8.76%
    daysToMaxROI: daysToMaxROI,
    reachesMax: days >= daysToMaxROI,
    contractMetrics: {
      hourlyRate: hourlyRate * 100,
       dailyRate: hourlyRate * 24 * 100,
      annualRate: hourlyRate * 24 * 365 * 100 // This will be 8.76
    }
  };
};

/**
 * Enhanced user APY calculation with contract integration
 * @param {Object} userData - User's staking data
 * @param {Object} contractData - Data from contract functions
 * @param {Object} constants - Staking constants
 * @returns {Object} Enhanced APY analysis
 */
export const calculateEnhancedUserAPY = (userData, contractData, constants = STAKING_CONSTANTS) => {
  // Combinar datos del usuario con datos del contrato
  const combinedData = {
    ...userData,
    contractRewards: contractData?.calculatedRewards || '0',
    contractInfo: contractData?.userInfo || {},
    contractDeposits: contractData?.deposits || []
  };

  // Calcular APY base y del contrato
  const baseAPY = calculateBaseAPY(constants);
  const contractAPY = calculateContractBasedAPY(contractData, constants);
  const userAPY = calculateUserAPY(combinedData, constants);

  // Combinar métricas
  const enhancedMetrics = {
    ...userAPY.metrics,
    contractRewards: safeParseNumber(contractData?.calculatedRewards || '0'),
    contractEfficiency: contractAPY.metrics.efficiency,
    variance: Math.abs(userAPY.effectiveAPY - contractAPY.effectiveAPY),
    accuracy: contractAPY.metrics.efficiency > 0 ? 
      Math.min((userAPY.effectiveAPY / contractAPY.effectiveAPY) * 100, 100) : 0
  };

  return {
    ...userAPY,
    contractAPY: contractAPY.contractAPY,
    baseAPY: baseAPY.cappedAPY,
    enhancedMetrics,
    recommendations: [
      ...userAPY.recommendations,
      ...generateContractRecommendations(contractAPY, userAPY)
    ]
  };
};

/**
 * Generate recommendations based on contract vs calculated APY
 * @param {Object} contractAPY - Contract APY data
 * @param {Object} userAPY - User APY data
 * @returns {Array} Contract-specific recommendations
 */
const generateContractRecommendations = (contractAPY, userAPY) => {
  const recommendations = [];
  
  if (contractAPY.metrics.efficiency < 90) {
    recommendations.push("⚠️ Your rewards efficiency is below 90%. Consider optimizing your staking strategy.");
  }
  
  if (contractAPY.metrics.rewardsCapped) {
    recommendations.push("🎯 You've reached maximum ROI on some deposits. Consider making new deposits to continue earning.");
  }
  
  const variance = Math.abs(contractAPY.effectiveAPY - userAPY.effectiveAPY);
  if (variance > 10) {
    recommendations.push("📊 There's a significant variance between projected and actual APY. This might indicate optimal timing for actions.");
  }
  
  if (contractAPY.contractData.depositsCount >= 250) {
    recommendations.push("⚡ You're approaching the maximum deposit limit. Consider consolidating smaller deposits.");
  }
  
  return recommendations;
};
