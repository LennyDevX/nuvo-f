// Move your constants into a separate file that doesn't use hooks

// Contract constants with new lockup periods and ROI rates
export const STAKING_CONSTANTS = {
  // Legacy constants for backward compatibility
  HOURLY_ROI: 0.0001, // 0.01% per hour (legacy) - matches contract
  DAILY_ROI: 0.0024, // 0.24% daily (legacy) - matches contract
  ANNUAL_ROI: 87.6, // 87.6% annual (legacy) - matches contract
  MAX_ROI: 1.25, // 125% maximum ROI
  COMMISSION_RATE: 0.06, // 6% commission
  MIN_DEPOSIT: 5, // 5 POL minimum
  MAX_DEPOSIT: 10000, // 10,000 POL maximum
  MAX_DEPOSITS_PER_USER: 300,
  PRECISION: 10000,
  
  // New lockup periods and ROI rates (from smart contract)
  LOCKUP_PERIODS: {
    FLEXIBLE: {
      days: 0,
      lockupDuration: 0, // Explicitly set to 0 for flexible staking
      label: 'Flexible',
      roiPerHour: 100, // 0.01% per hour (matches contract HOURLY_ROI_PERCENTAGE)
      roiPercentage: 0.0001, // 0.0001 decimal = 0.01% for 87.6% APY
      bonus: 0, // No bonus for flexible staking
      description: 'Flexible staking - withdraw anytime without penalties. Perfect for users who want maximum flexibility.'
    },
    DAYS_30: {
      days: 30,
      lockupDuration: 30,
      label: '30 Days',
      roiPerHour: 120, // 0.012% per hour (matches contract ROI_30_DAYS_LOCKUP)
      roiPercentage: 0.00012, // 0.00012 decimal = 0.012% per hour for ~105.12% APY
      bonus: 0.5, // 0.5% bonus
      description: 'Short-term staking with quick returns'
    },
    DAYS_90: {
      days: 90,
      lockupDuration: 90,
      label: '90 Days', 
      roiPerHour: 160, // 0.016% per hour (matches contract ROI_90_DAYS_LOCKUP)
      roiPercentage: 0.00016, // 0.00016 decimal = 0.016% per hour for ~140.16% APY
      bonus: 1.0, // 1% bonus
      description: 'Medium-term staking with balanced rewards'
    },
    DAYS_180: {
      days: 180,
      lockupDuration: 180,
      label: '180 Days',
      roiPerHour: 200, // 0.02% per hour (matches contract ROI_180_DAYS_LOCKUP)
      roiPercentage: 0.0002, // 0.0002 decimal = 0.02% per hour for ~175.2% APY
      bonus: 2.0, // 2% bonus
      description: 'Long-term staking with higher returns'
    },
    DAYS_365: {
      days: 365,
      lockupDuration: 365,
      label: '365 Days',
      roiPerHour: 300, // 0.03% per hour (matches contract ROI_365_DAYS_LOCKUP)
      roiPercentage: 0.0003, // 0.0003 decimal = 0.03% per hour for ~262.8% APY
      bonus: 5.0, // 5% bonus
      description: 'Maximum rewards for committed stakers'
    }
  }
};

// APY calculation helper with contract values
export const calculateCorrectAPY = () => {
  const hourlyROI = STAKING_CONSTANTS.HOURLY_ROI;
  const dailyROI = hourlyROI * 24;
  // Contract formula: 0.01% hourly * 24 hours * 365 days = 87.6%
  const annualAPY = dailyROI * 365 * 100; // This gives 87.6%
  
  return {
    hourly: hourlyROI * 100, // 0.01%
    daily: dailyROI * 100, // 0.24%
    annual: annualAPY // 87.6%
  };
};

// Alternative calculation method for verification
export const verifyAPYCalculation = () => {
  // Method 1: Direct calculation (contract values)
  const method1 = 0.0001 * 24 * 365 * 100; // 87.6%
  
  // Method 2: Step by step
  const hourlyRate = 0.01; // 0.01% per hour (contract value)
  const dailyRate = hourlyRate * 24; // 0.24% per day
  const method2 = dailyRate * 365; // 87.6% per year
  
  console.log('APY Verification:', {
    method1: `${method1}%`,
    method2: `${method2}%`,
    match: method1 === method2
  });
  
  return method1;
};

// Add any other constants your app needs here
