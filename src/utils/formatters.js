import { formatEther } from 'ethers';

/**
 * Formats a balance value with specified decimal precision
 * @param {string|number|bigint} value - The value to format
 * @param {number} [decimals=3] - Number of decimal places to show (default: 3)
 * @returns {string} Formatted balance
 */
export const formatBalance = (value, decimals = 3) => {
  if (!value) return '0.000';
  try {
    let numValue;
    
    // If it's already a decimal number
    if (typeof value === 'number' || (typeof value === 'string' && value.includes('.'))) {
      numValue = parseFloat(value);
    } else {
      // If it's Wei value (bigint or string)
      numValue = parseFloat(formatEther(value.toString()));
    }
    
    // Format the number with the specified decimal places
    return numValue.toFixed(decimals);
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.000';
  }
};

/**
 * Formats a percentage value
 * @param {string|number} value - The value to format
 * @param {number} [decimals=2] - Number of decimal places to show
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value) return '0';
  return parseFloat(value).toFixed(decimals);
};

/**
 * Formats a number with thousand separators and specified decimal precision
 * For larger numbers to improve readability
 * @param {string|number} value - The value to format
 * @param {number} [decimals=3] - Number of decimal places to show
 * @returns {string} Formatted number with thousand separators
 */
export const formatLargeNumber = (value, decimals = 3) => {
  if (!value) return '0.000';
  try {
    const num = parseFloat(value);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    console.error('Error formatting large number:', error);
    return '0.000';
  }
};
