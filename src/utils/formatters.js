import { formatEther } from 'ethers';

export const formatBalance = (value) => {
  if (!value) return '0.00';
  try {
    // If it's already a decimal number
    if (typeof value === 'number' || (typeof value === 'string' && value.includes('.'))) {
      return parseFloat(value).toFixed(6);
    }
    // If it's Wei value (bigint or string)
    return parseFloat(formatEther(value.toString())).toFixed(6);
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.00';
  }
};
