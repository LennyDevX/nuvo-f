import { logger } from '../debug/logger';

const REWARD_RATE = 0.3; // 30% max reward
const COMMISSION_RATE = 0.06; // 6% commission on withdrawals

export const calculateROIProgress = (depositAmount, totalWithdrawn) => {
  try {
    const deposit = typeof depositAmount === 'string' ? parseFloat(depositAmount) : depositAmount;
    // Add back the commission to get the gross withdrawn amount
    const grossWithdrawn = typeof totalWithdrawn === 'string' 
      ? parseFloat(totalWithdrawn) / (1 - COMMISSION_RATE)
      : totalWithdrawn / (1 - COMMISSION_RATE);

    logger.debug('STAKING', 'ROI Calculation completed', {
      depositAmount: deposit,
      netWithdrawn: totalWithdrawn,
      grossWithdrawn,
      commission: COMMISSION_RATE * 100 + '%'
    });

    if (!deposit || isNaN(deposit)) return 0;
    
    const maxPossibleReward = deposit * REWARD_RATE;
    // Use gross withdrawn amount for progress calculation
    const progress = (grossWithdrawn / maxPossibleReward) * 100;
    
    console.log('ROI Progress calculation:', {
      maxPossibleReward,
      grossProgress: progress,
      finalProgress: Math.min(Math.max(progress, 0), 100)
    });
    
    return Math.min(Math.max(progress, 0), 100);
  } catch (error) {
    console.error('ROI Calculation Error:', error);
    return 0;
  }
};

export const calculateTimeBonus = (timestamp) => {
  if (!timestamp) return { bonus: 0, period: 'No bonus' };
  
  const now = Date.now();
  const timestampMs = Number(timestamp) * 1000;
  const daysStaked = Math.floor((now - timestampMs) / (1000 * 60 * 60 * 24));

  if (daysStaked >= 365) return { bonus: 5, period: '1 Year+' };
  if (daysStaked >= 180) return { bonus: 3, period: '6 Months+' };
  if (daysStaked >= 90) return { bonus: 1, period: '3 Months+' };
  
  return { bonus: 0, period: 'Less than 3 months' };
};

export const calculateMaxReward = (depositAmount) => {
  const deposit = parseFloat(depositAmount || 0);
  return deposit * REWARD_RATE;
};
