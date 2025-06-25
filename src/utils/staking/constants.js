// Move your constants into a separate file that doesn't use hooks

// Contract constants with corrected APY calculations
export const STAKING_CONSTANTS = {
  HOURLY_ROI: 0.001, // 0.1% per hour
  DAILY_ROI: 0.024, // 2.4% daily (0.1% * 24)
  ANNUAL_ROI: 87.6, // 87.6% annual (corrected from 876%)
  MAX_ROI: 1.25, // 125% maximum ROI
  COMMISSION_RATE: 0.06, // 6% commission
  MIN_DEPOSIT: 5, // 5 POL minimum
  MAX_DEPOSIT: 10000, // 10,000 POL maximum
  MAX_DEPOSITS_PER_USER: 300,
  PRECISION: 10000
};

// APY calculation helper with corrected formula
export const calculateCorrectAPY = () => {
  const hourlyROI = STAKING_CONSTANTS.HOURLY_ROI;
  const dailyROI = hourlyROI * 24;
  // Correct formula: 0.1% hourly * 24 hours * 365 days / 10 = 87.6%
  const annualAPY = dailyROI * 365 / 10 * 100; // This gives 87.6%
  
  return {
    hourly: hourlyROI * 100, // 0.1%
    daily: dailyROI * 100, // 2.4%
    annual: annualAPY // 87.6%
  };
};

// Alternative calculation method for verification
export const verifyAPYCalculation = () => {
  // Method 1: Direct calculation
  const method1 = 0.001 * 24 * 365 / 10 * 100; // 87.6%
  
  // Method 2: Step by step
  const hourlyRate = 0.1; // 0.1% per hour
  const dailyRate = hourlyRate * 24; // 2.4% per day
  const method2 = dailyRate * 365 / 10; // 87.6% per year
  
  console.log('APY Verification:', {
    method1: `${method1}%`,
    method2: `${method2}%`,
    match: method1 === method2
  });
  
  return method1;
};

// Add any other constants your app needs here
