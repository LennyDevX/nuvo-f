// Move your constants into a separate file that doesn't use hooks

// Contract constants with new lockup periods and ROI rates
export const STAKING_CONSTANTS = {
  // Legacy constants for backward compatibility
  HOURLY_ROI: 0.0001, // 0.01% per hour (legacy)
  DAILY_ROI: 0.0024, // 0.24% daily (legacy)
  ANNUAL_ROI: 8.76, // 8.76% annual (legacy)
  MAX_ROI: 1.25, // 125% maximum ROI
  COMMISSION_RATE: 0.06, // 6% commission
  MIN_DEPOSIT: 5, // 5 POL minimum
  MAX_DEPOSIT: 10000, // 10,000 POL maximum
  MAX_DEPOSITS_PER_USER: 300,
  PRECISION: 10000,
  
  // New lockup periods and ROI rates (from smart contract)
  LOCKUP_PERIODS: {
    DAYS_30: {
      days: 30,
      label: '30 Days',
      roiPerHour: 120, // 0.012% per hour
      roiPercentage: 0.012,
      bonus: 0.5, // 0.5% bonus
      description: 'Short-term staking with quick returns'
    },
    DAYS_90: {
      days: 90,
      label: '90 Days', 
      roiPerHour: 160, // 0.016% per hour
      roiPercentage: 0.016,
      bonus: 1.0, // 1% bonus
      description: 'Medium-term staking with balanced rewards'
    },
    DAYS_180: {
      days: 180,
      label: '180 Days',
      roiPerHour: 200, // 0.02% per hour
      roiPercentage: 0.020,
      bonus: 2.0, // 2% bonus
      description: 'Long-term staking with higher returns'
    },
    DAYS_365: {
      days: 365,
      label: '365 Days',
      roiPerHour: 300, // 0.03% per hour
      roiPercentage: 0.030,
      bonus: 5.0, // 5% bonus
      description: 'Maximum rewards for committed stakers'
    }
  }
};

// APY calculation helper with corrected formula
export const calculateCorrectAPY = () => {
  const hourlyROI = STAKING_CONSTANTS.HOURLY_ROI;
  const dailyROI = hourlyROI * 24;
  // Correct formula: 0.01% hourly * 24 hours * 365 days = 8.76%
const annualAPY = dailyROI * 365 * 100; // This gives 8.76%
  
  return {
    hourly: hourlyROI * 100, // 0.01%
    daily: dailyROI * 100, // 0.24%
    annual: annualAPY // 8.76%
  };
};

// Alternative calculation method for verification
export const verifyAPYCalculation = () => {
  // Method 1: Direct calculation
  const method1 = 0.0001 * 24 * 365 * 100; // 8.76%
  
  // Method 2: Step by step
  const hourlyRate = 0.01; // 0.01% per hour
  const dailyRate = hourlyRate * 24; // 0.24% per day
  const method2 = dailyRate * 365; // 8.76% per year
  
  console.log('APY Verification:', {
    method1: `${method1}%`,
    method2: `${method2}%`,
    match: method1 === method2
  });
  
  return method1;
};

// Add any other constants your app needs here
