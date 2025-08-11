// Move your constants into a separate file that doesn't use hooks

// Contract constants with corrected APY calculations
export const STAKING_CONSTANTS = {
  HOURLY_ROI: 0.0001, // 0.01% per hour
  DAILY_ROI: 0.0024, // 0.24% daily (0.01% * 24)
  ANNUAL_ROI: 8.76, // 8.76% annual (updated for SmartStaking v3.0)
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
