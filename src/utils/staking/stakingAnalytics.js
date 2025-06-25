import { ethers } from 'ethers';
import { calculateContractBasedAPY, calculateEnhancedUserAPY, calculateUserAPY, calculateBaseAPY, formatAPY } from './apyCalculations';

/**
 * Utility function for safe BigInt/number parsing and formatting
 * @param {*} value - The value to parse
 * @returns {number} Parsed floating point number
 */
export const safeParseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  
  try {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    
    if (typeof value === 'string') {
      // Check if it's a decimal or scientific notation
      if (value.includes('.') || value.includes('e')) {
        return parseFloat(value) || 0;      
      }
      // If it's a whole number string, treat it as wei and convert
      return parseFloat(ethers.formatEther(value)) || 0;
    }
    
    if (typeof value === 'bigint') {
      return parseFloat(ethers.formatEther(value.toString())) || 0;
    }
    
    // Handle objects with toString method
    if (value && typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (stringValue.includes('.') || stringValue.includes('e')) {
        return parseFloat(stringValue) || 0;
      }
      return parseFloat(ethers.formatEther(stringValue)) || 0;
    }
    
    return 0;
  } catch (error) {
    console.error("Error parsing amount:", error, value);
    return 0;
  }
};

/**
 * Calculate time bonus based on staking duration
 * @param {number} daysStaked - Days user has been staking
 * @returns {number} Bonus multiplier (0.01 = 1%)
 */
export const calculateTimeBonus = (daysStaked) => {
  // REALITY FROM CONTRACT: No real bonuses
  // This function only exists for UI compatibility
  return 0; // Always 0 because contract doesn't have bonuses
};

/**
 * Advanced scoring algorithm for staking portfolio
 * @param {Object} stakingData - User's staking data
 * @param {Object} apyAnalysis - APY analysis results
 * @returns {number} Score from 0-100
 */
const calculateAdvancedScore = (stakingData, apyAnalysis) => {
  let score = 0;
  
  // APY Performance Score (40 points max)
  if (apyAnalysis) {
    const apyRatio = apyAnalysis.effectiveAPY / apyAnalysis.baseAPY;
    if (apyRatio >= 1.1) score += 40;      // Excellent: 10%+ above base
    else if (apyRatio >= 1.05) score += 35; // Very Good: 5-10% above base
    else if (apyRatio >= 1.0) score += 30;  // Good: At base APY
    else if (apyRatio >= 0.95) score += 20; // Fair: 5% below base
    else score += 10;                        // Poor: >5% below
  }
  
  // Staking Amount Score (20 points max)
  const totalStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
  if (totalStaked >= 10000) score += 20;
  else if (totalStaked >= 5000) score += 16;
  else if (totalStaked >= 1000) score += 12;
  else if (totalStaked >= 500) score += 8;
  else if (totalStaked >= 100) score += 4;
  
  // Time Commitment Score (20 points max)
  const stakingDays = apyAnalysis?.metrics.stakingDays || 0;
  if (stakingDays >= 365) score += 20;
  else if (stakingDays >= 180) score += 16;
  else if (stakingDays >= 90) score += 12;
  else if (stakingDays >= 30) score += 8;
  else if (stakingDays >= 7) score += 4;
  
  // Strategy Efficiency Score (10 points max)
  const depositCount = stakingData.userDeposits?.length || 0;
  const maxDeposits = stakingData.stakingConstants?.MAX_DEPOSITS_PER_USER || 300;
  const utilizationRatio = depositCount / maxDeposits;
  
  if (utilizationRatio <= 0.2) score += 10;      // Very efficient
  else if (utilizationRatio <= 0.5) score += 8;  // Good efficiency
  else if (utilizationRatio <= 0.8) score += 5;  // Fair efficiency
  else score += 2;                               // Poor efficiency
  
  // Bonus multiplier application (10 points max)
  if (apyAnalysis?.multipliers) {
    const totalBonus = apyAnalysis.multipliers.total;
    if (totalBonus >= 5) score += 10;      // 5%+ total bonus
    else if (totalBonus >= 3) score += 8;  // 3-5% total bonus
    else if (totalBonus >= 1) score += 6;  // 1-3% total bonus
    else if (totalBonus > 0) score += 4;   // Any bonus
  }
  
  return Math.round(Math.max(0, Math.min(100, score)));
};

/**
 * Generate intelligent recommendations based on APY analysis and score
 * @param {Object} stakingData - User's staking data
 * @param {Object} apyAnalysis - APY analysis results
 * @param {number} score - Portfolio score
 * @returns {Array} Array of intelligent recommendations
 */
const generateIntelligentRecommendations = (stakingData, apyAnalysis, score) => {
  const recommendations = [];
  const stakingDays = apyAnalysis?.metrics.stakingDays || 0;
  const totalStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
  const depositCount = stakingData.userDeposits?.length || 0;
  const maxDeposits = stakingData.stakingConstants?.MAX_DEPOSITS_PER_USER || 300;
  
  // Critical recommendations (score < 30)
  if (score < 30) {
    if (totalStaked < 100) {
      recommendations.push("🚨 Critical: Increase your stake to at least 100 POL to improve rewards significantly.");
    }
    if (stakingDays < 30) {
      recommendations.push("🚨 Critical: Stake for at least 30 days to establish a solid foundation.");
    }
    if (depositCount > maxDeposits * 0.8) {
      recommendations.push("🚨 Critical: You're using too many deposit slots. Consolidate into larger deposits.");
    }
  }
  
  // Medium priority recommendations (score 30-70)
  else if (score < 70) {
    if (apyAnalysis?.multipliers.timeBonus < 1) {
      const daysToNext = stakingDays < 90 ? 90 - stakingDays : 
                        stakingDays < 180 ? 180 - stakingDays : 365 - stakingDays;
      const nextBonus = stakingDays < 90 ? "1%" : stakingDays < 180 ? "3%" : "5%";
      recommendations.push(`⏰ Stake for ${daysToNext} more days to unlock ${nextBonus} time bonus.`);
    }
    
    if (totalStaked < 1000 && apyAnalysis?.multipliers.volumeBonus === 0) {
      recommendations.push("📈 Consider increasing your stake to 1000+ POL to unlock volume bonuses.");
    }
    
    if (apyAnalysis?.effectiveAPY < apyAnalysis?.baseAPY) {
      recommendations.push("⚡ Your APY is below base rate. Review strategy to maximize bonuses.");
    }
  }
  
  // Optimization recommendations (score 70+)
  else {
    if (stakingDays >= 90 && stakingDays < 180) {
      recommendations.push("🎯 Excellent progress! Continue staking to reach 180 days for 3% bonus.");
    } else if (stakingDays >= 180 && stakingDays < 365) {
      recommendations.push("🎯 Great job! You're on track for the maximum 5% bonus at 365 days.");
    }
    
    if (totalStaked >= 5000 && apyAnalysis?.multipliers.volumeBonus < 2) {
      recommendations.push("💎 Consider staking 10,000+ POL to maximize volume bonuses.");
    }
    
    if (depositCount < maxDeposits * 0.2) {
      recommendations.push("✨ Perfect deposit efficiency! You're maximizing rewards per slot.");
    }
  }
  
  // Universal recommendations
  const pendingRewards = safeParseAmount(stakingData.stakingStats.pendingRewards);
  if (pendingRewards > totalStaked * 0.1) {
    recommendations.push("💰 Consider claiming and re-staking rewards to compound earnings.");
  }
  
  // Advanced strategy recommendations
  if (score >= 80) {
    recommendations.push("🏆 Excellent portfolio! Consider sharing your strategy with the community.");
    if (apyAnalysis?.effectiveAPY > apyAnalysis?.baseAPY * 1.05) {
      recommendations.push("🚀 Outstanding APY optimization! You're earning 5%+ above base rate.");
    }
  }
  
  return recommendations;
};

/**
 * Optimized version of staking portfolio analyzer with improved APY integration
 * @param {Object} stakingData - Data about user's staking activity
 * @returns {Object} Analysis results including score and recommendations
 */
export const analyzeStakingPortfolio = (stakingData) => {
  // Initialize results object at the beginning
  const results = {
    score: 0,
    performanceSummary: "",
    recommendations: [],
    metrics: {}
  };

  if (!stakingData || !stakingData.userDeposits || stakingData.userDeposits.length === 0) {
    results.score = 0;
    results.performanceSummary = "No staking activity found. Start staking to get an analysis.";
    results.recommendations = ["Visit the Staking Dashboard to make your first deposit."];
    results.metrics = {};
    return results;
  }

  try {
    // Parse values safely
    const totalStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
    const pendingRewards = safeParseAmount(stakingData.stakingStats.pendingRewards);
    const depositCount = stakingData.userDeposits.length;
    const safeWithdrawn = safeParseAmount(stakingData.totalWithdrawn);
    const safeClaimed = safeParseAmount(stakingData.rewardsClaimed);
    
    // Calculate comprehensive APY analysis
    const firstDepositTimestamp = stakingData.userDeposits.reduce((earliest, deposit) =>
      deposit.timestamp < earliest ? deposit.timestamp : earliest,
      stakingData.userDeposits[0].timestamp
    );
    const stakingDays = Math.floor((Date.now() / 1000 - firstDepositTimestamp) / (24 * 3600));
    
    const userData = {
      userDeposits: stakingData.userDeposits,
      totalStaked: stakingData.stakingStats.totalStaked,
      stakingDays,
      totalWithdrawn: safeWithdrawn,
      rewardsClaimed: safeClaimed
    };
    
    const apyAnalysis = calculateUserAPY(userData, stakingData.stakingConstants);
    const baseAPYData = calculateBaseAPY(stakingData.stakingConstants);
    
    // Calculate advanced score using APY analysis
    results.score = calculateAdvancedScore(stakingData, apyAnalysis);
    
    // Enhanced performance summary using APY data
    const apyComparison = apyAnalysis.effectiveAPY / baseAPYData.cappedAPY;
    const totalEarnings = safeClaimed + pendingRewards;
    
    if (results.score >= 80) {
      results.performanceSummary = `🏆 Exceptional performance! Your effective APY of ${formatAPY(apyAnalysis.effectiveAPY)} is ${((apyComparison - 1) * 100).toFixed(1)}% ${apyComparison >= 1 ? 'above' : 'below'} base rate. You've mastered staking optimization!`;
    } else if (results.score >= 60) {
      results.performanceSummary = `📈 Strong performance! Your effective APY of ${formatAPY(apyAnalysis.effectiveAPY)} shows good optimization. With ${stakingDays} days staked, you're building solid returns.`;
    } else if (results.score >= 40) {
      results.performanceSummary = `⚡ Moderate performance. Your APY is ${formatAPY(apyAnalysis.effectiveAPY)}, with room for improvement. Focus on time bonuses and deposit efficiency.`;
    } else {
      results.performanceSummary = `🎯 Early stage portfolio. Your current APY is ${formatAPY(apyAnalysis.effectiveAPY)}. Follow recommendations below to optimize your strategy.`;
    }
    
    // Generate intelligent recommendations
    results.recommendations = generateIntelligentRecommendations(stakingData, apyAnalysis, results.score);
    
    // Enhanced metrics with APY breakdown
    results.metrics = {
      totalStaked: totalStaked.toFixed(2),
      pendingRewards: pendingRewards.toFixed(4),
      totalEarnings: totalEarnings.toFixed(4),
      effectiveAPY: formatAPY(apyAnalysis.effectiveAPY),
      baseAPY: formatAPY(baseAPYData.cappedAPY),
      apyBonus: formatAPY((apyAnalysis.effectiveAPY - baseAPYData.cappedAPY)),
      daysStaked: stakingDays,
      timeBonus: formatAPY(apyAnalysis.multipliers.timeBonus),
      volumeBonus: formatAPY(apyAnalysis.multipliers.volumeBonus),
      efficiencyScore: formatAPY(apyAnalysis.multipliers.efficiencyMultiplier),
      depositUtilization: ((depositCount / (stakingData.stakingConstants?.MAX_DEPOSITS_PER_USER || 300)) * 100).toFixed(0) + '%',
      totalWithdrawn: safeWithdrawn.toFixed(2),
      rewardsClaimed: safeClaimed.toFixed(4),
      holdRatio: formatAPY(apyAnalysis.metrics.holdRatio),
      roi: formatAPY(apyAnalysis.metrics.roi)
    };
    
  } catch (error) {
    console.error("Error in analysis algorithm:", error);
    results.performanceSummary = "An error occurred during analysis. Please try again.";
    results.score = 0;
    results.metrics = {
      totalStaked: "0.00",
      pendingRewards: "0.00",
      totalEarnings: "0.00",
      effectiveAPY: "0.0%",
      baseAPY: "0.0%",
      apyBonus: "0.0%",
      daysStaked: 0,
      timeBonus: "0.0%",
      volumeBonus: "0.0%",
      efficiencyScore: "0.0%",
      depositUtilization: "0%",
      totalWithdrawn: "0.00",
      rewardsClaimed: "0.00",
      holdRatio: "0.0%",
      roi: "0.0%"
    };
  }

  return results;
};

