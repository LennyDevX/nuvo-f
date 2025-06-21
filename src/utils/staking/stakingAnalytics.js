import { ethers } from 'ethers';

/**
 * Utility function for safe BigInt/number parsing and formatting
 * @param {*} value - The value to parse
 * @returns {number} Parsed floating point number
 */
export const safeParseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  
  try {
    // If already a number string with decimal points or a number
    if ((typeof value === 'string' && value.includes('.')) || typeof value === 'number') {
      return parseFloat(value);
    }
    
    // If it's a BigInt or a string representation of a BigInt (no decimal)
    if (typeof value === 'bigint' || (typeof value === 'string' && !value.includes('.'))) {
      return parseFloat(ethers.formatEther(value.toString()));
    }
    
    // Default fallback
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
  if (daysStaked >= 365) return 0.05; // 5% bonus for 1+ year
  if (daysStaked >= 180) return 0.03; // 3% bonus for 6+ months
  if (daysStaked >= 90) return 0.01; // 1% bonus for 3+ months
  return 0;
};

/**
 * Calculates effective APY with time bonus
 * @param {number} baseApy - Base APY percentage
 * @param {number} daysStaked - Days staked
 * @returns {number} Effective APY percentage
 */
export const calculateEffectiveApy = (baseApy, daysStaked) => {
  const timeBonus = calculateTimeBonus(daysStaked);
  return baseApy + (timeBonus * 100);
};

/**
 * Optimized version of staking portfolio analyzer
 * @param {Object} stakingData - Data about user's staking activity
 * @returns {Object} Analysis results including score and recommendations
 */
export const analyzeStakingPortfolio = (stakingData) => {

  if (!stakingData || !stakingData.userDeposits || stakingData.userDeposits.length === 0) {
    const results = {
      score: 0,
      performanceSummary: "No staking activity found. Start staking to get an analysis.",
      recommendations: ["Visit the Staking Dashboard to make your first deposit."],
      metrics: {}
    };
    return results;
  }

  try {
    // Parse values safely
    const totalStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
    const pendingRewards = safeParseAmount(stakingData.stakingStats.pendingRewards);
    const depositCount = stakingData.userDeposits.length;
    const safeWithdrawn = safeParseAmount(stakingData.totalWithdrawn);
    const safeClaimed = safeParseAmount(stakingData.rewardsClaimed);
    const hourlyROI = stakingData.stakingConstants.HOURLY_ROI;
    const dailyROI = hourlyROI * 24; // Calculate daily ROI from hourly
    const maxDeposits = stakingData.stakingConstants.MAX_DEPOSITS_PER_USER;

    // Find first deposit timestamp
    const firstDepositTimestamp = stakingData.userDeposits.reduce((earliest, deposit) =>
      deposit.timestamp < earliest ? deposit.timestamp : earliest,
      stakingData.userDeposits[0].timestamp
    );
    const now = Math.floor(Date.now() / 1000);
    const totalTimeStakedSeconds = now - firstDepositTimestamp;
    const totalTimeStakedDays = totalTimeStakedSeconds / (60 * 60 * 24);
    
    // Calculate time bonus based on staking duration
    const timeBonus = calculateTimeBonus(totalTimeStakedDays);
    
    // Calculate effective daily ROI with time bonus
    const effectiveDailyROI = dailyROI * (1 + timeBonus);

    // Estimate total earnings (claimed + pending)
    const totalEarnings = safeClaimed + pendingRewards;
    
    // Calculate Effective APY based on contract definition
    // Theoretical APY from daily rate (with compounding)
    const theoreticalAPY = Math.pow(1 + effectiveDailyROI, 365) - 1;
    
    // Calculate deposit utilization (as percentage of max deposits)
    const depositUtilization = (depositCount / maxDeposits) * 100;

    // --- Scoring ---
    let score = 0;
    
    // APY score - up to 40 points
    score += Math.min(40, theoreticalAPY * 32);
    
    // Staking amount score - up to 20 points
    if (totalStaked > 1000) score += 20;
    else if (totalStaked > 500) score += 15;
    else if (totalStaked > 100) score += 10;
    else if (totalStaked > 50) score += 5;
    
    // Time score - up to 20 points
    if (totalTimeStakedDays > 365) score += 20;
    else if (totalTimeStakedDays > 180) score += 15;
    else if (totalTimeStakedDays > 90) score += 10;
    else if (totalTimeStakedDays > 30) score += 5;
    
    // Deposit strategy score - up to 10 points
    if (depositUtilization < 20) score += 10;
    else if (depositUtilization < 50) score += 7;
    else if (depositUtilization < 80) score += 5;
    
    // Withdrawal discipline score - up to 10 points
    if (totalStaked > 0 || safeWithdrawn > 0) {
      const holdRatio = totalStaked / (totalStaked + safeWithdrawn);
      score += Math.min(holdRatio * 10, 10);
    }
    
    results.score = Math.round(Math.max(0, Math.min(100, score))); // Ensure score is 0-100

    // --- Performance Summary ---
    if (results.score >= 80) {
      results.performanceSummary = `Excellent performance! Your effective APY is approximately ${(theoreticalAPY * 100).toFixed(1)}%. You're maximizing your staking potential.`;
    } else if (results.score >= 50) {
      results.performanceSummary = `Good performance. Your effective APY is around ${(theoreticalAPY * 100).toFixed(1)}%. There might be opportunities to optimize further.`;
    } else {
      results.performanceSummary = `Potential for improvement. Your effective APY is around ${(theoreticalAPY * 100).toFixed(1)}%. See recommendations below.`;
    }

    // --- Generate tailored recommendations ---
    if (depositUtilization >= 80 && depositCount < maxDeposits) {
      results.recommendations.push(`You're using ${depositCount} of ${maxDeposits} deposit slots (${depositUtilization.toFixed(0)}%). Consider consolidating smaller deposits.`);
    } else if (depositCount === maxDeposits) {
      results.recommendations.push(`You've reached the maximum of ${maxDeposits} deposits. Consolidate smaller stakes for larger amounts.`);
    }

    if (totalStaked < 50 && depositCount < maxDeposits) {
      results.recommendations.push("Your total staked amount is relatively low. Consider increasing your stake to maximize rewards.");
    }

    if (totalTimeStakedDays < 90) {
      results.recommendations.push(`You've been staking for ${Math.round(totalTimeStakedDays)} days. Continue staking to unlock bonuses at 90 days.`);
    } else if (totalTimeStakedDays < 180) {
      results.recommendations.push(`You've unlocked the 90-day bonus (1%)! Keep staking towards the 180-day bonus (3%).`);
    } else if (totalTimeStakedDays < 365) {
      results.recommendations.push(`Great job reaching the 180-day bonus (3%)! The final 5% bonus unlocks at 365 days.`);
    }

    if (pendingRewards > totalStaked * 0.05) {
      results.recommendations.push("Consider claiming and re-staking your rewards to compound your earnings.");
    }

    // --- Metrics ---
    results.metrics = {
      totalStaked: totalStaked.toFixed(2),
      pendingRewards: pendingRewards.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2),
      effectiveAPY: (theoreticalAPY * 100).toFixed(1) + '%',
      daysStaked: Math.round(totalTimeStakedDays),
      timeBonus: (timeBonus * 100).toFixed(0) + '%',
      depositUtilization: depositUtilization.toFixed(0) + '%',
      totalWithdrawn: safeWithdrawn.toFixed(2),
      rewardsClaimed: safeClaimed.toFixed(2)
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
      daysStaked: 0,
      timeBonus: "0%",
      depositUtilization: "0%",
      totalWithdrawn: "0.00",
      rewardsClaimed: "0.00"
    };
  }

  return results;
};
    