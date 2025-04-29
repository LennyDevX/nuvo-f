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
 * Analyzes a user's staking portfolio and provides metrics, recommendations and a score
 * @param {Object} stakingData - Data about the user's staking activity
 * @returns {Object} Analysis results including score, recommendations, and metrics
 */
export const analyzeStakingPortfolio = (stakingData) => {
  const {
    userDeposits = [],
    stakingStats = { pendingRewards: '0', totalStaked: '0' },
    totalWithdrawn = 0,
    rewardsClaimed = 0,
    stakingConstants = {
      HOURLY_ROI: 0.0001, // 0.01% hourly
      MAX_ROI: 1.25, // 125%
      MAX_DEPOSITS_PER_USER: 300
    }
  } = stakingData;

  console.log("Analysis input data:", {
    deposits: userDeposits.length,
    totalStaked: stakingStats.totalStaked,
    pendingRewards: stakingStats.pendingRewards,
    totalWithdrawn,
    rewardsClaimed,
    maxDeposits: stakingConstants.MAX_DEPOSITS_PER_USER
  });

  const results = {
    score: 0,
    performanceSummary: "Analysis pending.",
    recommendations: [],
    metrics: {},
  };

  if (!userDeposits || userDeposits.length === 0) {
    results.performanceSummary = "No staking activity found. Start staking to get an analysis.";
    results.recommendations.push("Visit the Staking Dashboard to make your first deposit.");
    return results;
  }

  // --- Safe calculations with error handling ---
  try {
    // Parse values safely
    const totalStaked = safeParseAmount(stakingStats.totalStaked);
    const pendingRewards = safeParseAmount(stakingStats.pendingRewards);
    const depositCount = userDeposits.length;
    const safeWithdrawn = safeParseAmount(totalWithdrawn);
    const safeClaimed = safeParseAmount(rewardsClaimed);
    const hourlyROI = stakingConstants.HOURLY_ROI;
    const dailyROI = hourlyROI * 24; // Calculate daily ROI from hourly
    const maxDeposits = stakingConstants.MAX_DEPOSITS_PER_USER;

    console.log("Parsed values:", {
      totalStaked,
      pendingRewards,
      depositCount,
      safeWithdrawn,
      safeClaimed,
      dailyROI,
      maxDeposits
    });

    // Find first deposit timestamp
    const firstDepositTimestamp = userDeposits.reduce((earliest, deposit) =>
      deposit.timestamp < earliest ? deposit.timestamp : earliest,
      userDeposits[0].timestamp
    );
    const now = Math.floor(Date.now() / 1000);
    const totalTimeStakedSeconds = now - firstDepositTimestamp;
    const totalTimeStakedDays = totalTimeStakedSeconds / (60 * 60 * 24);
    
    // Calculate time bonus based on staking duration
    const timeBonus = calculateTimeBonus(totalTimeStakedDays);
    console.log("Time calculations:", { totalTimeStakedDays, timeBonus });

    // Calculate effective daily ROI with time bonus
    const effectiveDailyROI = dailyROI * (1 + timeBonus);

    // Estimate total earnings (claimed + pending)
    const totalEarnings = safeClaimed + pendingRewards;
    
    // --- Calculate Effective APY ---
    // Method 1: Based on actual returns
    let effectiveAPY = 0;
    if (totalStaked > 0 && totalTimeStakedDays > 0) {
      // Convert daily rate to annual (compounded)
      const dailyReturnRate = totalEarnings / (totalStaked * totalTimeStakedDays);
      effectiveAPY = Math.pow(1 + dailyReturnRate, 365) - 1;
    }
    
    // Method 2: Based on contract definition
    // Calculate the theoretical APY from the daily rate (with compounding)
    const theoreticalAPY = Math.pow(1 + effectiveDailyROI, 365) - 1;
    
    // Use the theoretical APY as a fallback if actual APY calculation is problematic
    if (effectiveAPY <= 0 || !isFinite(effectiveAPY) || isNaN(effectiveAPY)) {
      effectiveAPY = theoreticalAPY;
    }
    
    // Cap at theoretical maximum
    effectiveAPY = Math.min(effectiveAPY, theoreticalAPY * 1.1); // Allow slight overshoot
    
    console.log("APY calculations:", { 
      effectiveAPY, 
      theoreticalAPY, 
      dailyROI, 
      effectiveDailyROI,
      totalEarnings,
      stakingDuration: totalTimeStakedDays
    });

    // Calculate deposit utilization (as percentage of the ACTUAL max deposits from contract)
    const depositUtilization = (depositCount / maxDeposits) * 100;

    // --- Scoring ---
    let score = 0;
    
    // APY score - up to 40 points for reaching theoretical APY
    const apyRatio = effectiveAPY / theoreticalAPY;
    const apyScore = Math.min(apyRatio * 40, 40);
    score += apyScore;
    
    // Staking amount score - up to 20 points
    let stakingAmountScore = 0;
    if (totalStaked > 1000) stakingAmountScore = 20;
    else if (totalStaked > 500) stakingAmountScore = 15;
    else if (totalStaked > 100) stakingAmountScore = 10;
    else if (totalStaked > 50) stakingAmountScore = 5;
    score += stakingAmountScore;
    
    // Time score - up to 20 points
    let timeScore = 0;
    if (totalTimeStakedDays > 365) timeScore = 20;
    else if (totalTimeStakedDays > 180) timeScore = 15;
    else if (totalTimeStakedDays > 90) timeScore = 10;
    else if (totalTimeStakedDays > 30) timeScore = 5;
    score += timeScore;
    
    // Deposit strategy score - up to 10 points
    let strategyScore = 0;
    if (depositUtilization < 20) strategyScore = 10; // Very low utilization is good
    else if (depositUtilization < 50) strategyScore = 7;
    else if (depositUtilization < 80) strategyScore = 5;
    score += strategyScore;
    
    // Withdrawal discipline score - up to 10 points
    let disciplineScore = 0;
    if (totalStaked > 0 || safeWithdrawn > 0) {
      const holdRatio = totalStaked / (totalStaked + safeWithdrawn);
      disciplineScore = Math.min(holdRatio * 10, 10);
    }
    score += disciplineScore;
    
    console.log("Score breakdown:", {
      apyScore,
      stakingAmountScore,
      timeScore,
      strategyScore,
      disciplineScore,
      totalScore: score
    });
    
    results.score = Math.round(Math.max(0, Math.min(100, score))); // Ensure score is 0-100

    // --- Performance Summary ---
    if (results.score >= 80) {
      results.performanceSummary = `Excellent performance! Your effective APY is approximately ${(effectiveAPY * 100).toFixed(1)}%. You're maximizing your staking potential.`;
    } else if (results.score >= 50) {
      results.performanceSummary = `Good performance. Your effective APY is around ${(effectiveAPY * 100).toFixed(1)}%. There might be opportunities to optimize further.`;
    } else {
      results.performanceSummary = `Potential for improvement. Your effective APY is around ${(effectiveAPY * 100).toFixed(1)}%, compared to a theoretical maximum of ${(theoreticalAPY * 100).toFixed(1)}%. See recommendations below.`;
    }

    // --- Generate tailored recommendations ---
    if (depositUtilization >= 80 && depositCount < maxDeposits) {
      results.recommendations.push(`You're using ${depositCount} of ${maxDeposits} deposit slots (${depositUtilization.toFixed(0)}%). Consider consolidating smaller deposits if you plan to add more.`);
    } else if (depositCount === maxDeposits) {
      results.recommendations.push(`You've reached the maximum of ${maxDeposits} deposits. Consolidate smaller stakes if you wish to deposit larger amounts.`);
    }

    if (totalStaked < 50 && depositCount < maxDeposits) {
      results.recommendations.push("Your total staked amount is relatively low. Consider increasing your stake to maximize potential rewards.");
    }

    if (totalTimeStakedDays < 90) {
      results.recommendations.push(`You've been staking for ${Math.round(totalTimeStakedDays)} days. Continue staking to unlock time bonuses (starting at 90 days).`);
    } else if (totalTimeStakedDays < 180) {
      results.recommendations.push(`You've unlocked the 90-day bonus (1%)! Keep staking towards the 180-day bonus (3%) for even higher returns.`);
    } else if (totalTimeStakedDays < 365) {
      results.recommendations.push(`Great job reaching the 180-day bonus (3%)! The final 5% bonus unlocks at 365 days.`);
    }

    if (pendingRewards > totalStaked * 0.05) { // If pending rewards > 5% of stake
      results.recommendations.push("You have a significant amount of pending rewards. Consider claiming and potentially re-staking them to compound your earnings (consider gas fees).");
    }

    if (safeWithdrawn > totalStaked * 0.5 && totalStaked > 0) { // If withdrawn more than 50% of current stake
      results.recommendations.push("Frequent or large withdrawals can impact your overall compounding potential. Consider your long-term strategy.");
    }

    // Calculate reinvestment ratio
    const reinvestmentRatio = safeClaimed > 0 ? totalStaked / (safeClaimed + totalStaked) : 1;
    if (reinvestmentRatio < 0.7 && safeClaimed > 0) {
      results.recommendations.push("Consider reinvesting more of your claimed rewards to maximize compounding benefits.");
    }

    // --- Metrics ---
    results.metrics = {
      totalStaked: totalStaked.toFixed(2),
      pendingRewards: pendingRewards.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2),
      effectiveAPY: (effectiveAPY * 100).toFixed(1) + '%',
      theoreticalAPY: (theoreticalAPY * 100).toFixed(1) + '%',
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
      theoreticalAPY: "0.0%",
      daysStaked: 0,
      timeBonus: "0%",
      depositUtilization: "0%",
      totalWithdrawn: "0.00",
      rewardsClaimed: "0.00"
    };
  }

  return results;
};
