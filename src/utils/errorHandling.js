/**
 * Parses blockchain transaction errors into user-friendly messages
 * @param {Error} error - The error object from the transaction
 * @returns {Object} An object containing the parsed error information
 */
export const parseTransactionError = (error) => {
  // Default error info
  const defaultError = {
    status: 'error',
    message: 'An unknown error occurred with the transaction.',
    code: 'UNKNOWN_ERROR',
    originalError: error
  };
  
  if (!error) return defaultError;

  // Convert error to string for pattern matching
  const errorString = error.toString();
  const errorMessage = error.message || '';
  const errorInfo = error.info || {};
  const errorReason = errorInfo.reason || '';
  
  // User rejected transaction
  if (
    errorString.includes('user rejected') || 
    errorMessage.includes('user rejected') ||
    errorString.includes('User denied') ||
    errorMessage.includes('User denied') ||
    errorReason === 'rejected'
  ) {
    return {
      status: 'rejected',
      message: 'You canceled the transaction. No fees were charged.',
      code: 'USER_REJECTED',
      originalError: error
    };
  }
  
  // Insufficient funds
  if (
    errorString.includes('insufficient funds') || 
    errorMessage.includes('insufficient funds')
  ) {
    return {
      status: 'error',
      message: 'Not enough MATIC to complete this transaction. Check your wallet balance.',
      code: 'INSUFFICIENT_FUNDS',
      originalError: error
    };
  }
  
  // Gas price related errors
  if (
    errorString.includes('gas') && 
    (errorString.includes('price') || errorString.includes('limit'))
  ) {
    return {
      status: 'error',
      message: 'Gas estimation error. Try setting a higher gas limit.',
      code: 'GAS_ERROR',
      originalError: error
    };
  }
  
  // Nonce too low (transaction already processed)
  if (errorString.includes('nonce')) {
    return {
      status: 'error',
      message: 'Transaction already processed or nonce issue. Please try again.',
      code: 'NONCE_ERROR',
      originalError: error
    };
  }
  
  // Network error
  if (
    errorString.includes('network') || 
    errorString.includes('disconnected') ||
    errorString.includes('connection')
  ) {
    return {
      status: 'error',
      message: 'Blockchain network connection error. Check your internet connection.',
      code: 'NETWORK_ERROR',
      originalError: error
    };
  }
  
  // Contract error (most likely a revert)
  if (errorString.includes('execution reverted')) {
    // Extract custom error message if available
    const revertMatch = errorString.match(/execution reverted:(.*)/i);
    const revertReason = revertMatch ? revertMatch[1].trim() : '';
    
    return {
      status: 'error',
      message: revertReason || 'Transaction reverted by the contract. Check parameters.',
      code: 'CONTRACT_ERROR',
      originalError: error
    };
  }
  
  // Default error with original message
  return {
    status: 'error',
    message: `Error: ${errorMessage.slice(0, 100)}`, // Limit message length
    code: 'UNKNOWN_ERROR',
    originalError: error
  };
};
