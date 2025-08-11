/**
 * Parses blockchain transaction errors into user-friendly messages
 * @param {Error} error - The error object from the transaction
 * @returns {Object} An object containing the parsed error information
 */
export const parseTransactionError = (error) => {
  // Default error info
  const defaultError = {
    status: 'error',
    message: 'Something unexpected happened. Please try again.',
    code: 'UNKNOWN_ERROR',
    originalError: error
  };
  
  if (!error) return defaultError;

  // Convert error to string for pattern matching
  const errorString = error.toString().toLowerCase();
  const errorMessage = (error.message || '').toLowerCase();
  const errorInfo = error.info || {};
  const errorReason = (errorInfo.reason || '').toLowerCase();
  const errorCode = error.code;
  
  // Enhanced user rejection detection patterns
  const userRejectionPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'cancelled by user',
    'rejected by user',
    'transaction was rejected',
    'user rejected transaction',
    'user denied transaction signature',
    'metamask tx signature: user denied',
    'request rejected',
    'transaction rejected',
    'action_rejected',
    'user_rejected',
    'denied by user',
    'user canceled',
    'user cancellation',
    'wallet_requestpermissions_rejected',
    'user rejected the request',
    'user denied the transaction'
  ];

  const isUserRejection = userRejectionPatterns.some(pattern =>
    errorString.includes(pattern) || 
    errorMessage.includes(pattern) || 
    errorReason.includes(pattern)
  ) || errorCode === 4001; // MetaMask rejection code

  if (isUserRejection) {
    return {
      status: 'rejected',
      message: 'You cancelled the transaction in your wallet. No fees were charged.',
      code: 'USER_REJECTED',
      originalError: error
    };
  }
  
  // Insufficient funds - enhanced detection
  const insufficientFundsPatterns = [
    'insufficient funds',
    'insufficient balance',
    'not enough',
    'insufficient matic',
    'insufficient pol',
    'insufficient gas',
    'balance too low'
  ];

  const isInsufficientFunds = insufficientFundsPatterns.some(pattern =>
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );

  if (isInsufficientFunds) {
    return {
      status: 'error',
      message: 'Not enough MATIC in your wallet to complete this transaction. Please add more MATIC for gas fees.',
      code: 'INSUFFICIENT_FUNDS',
      originalError: error
    };
  }
  
  // Gas related errors - enhanced detection
  const gasErrorPatterns = [
    'gas required exceeds',
    'out of gas',
    'gas estimation failed',
    'gas limit',
    'gas price',
    'intrinsic gas too low',
    'transaction underpriced'
  ];

  const isGasError = gasErrorPatterns.some(pattern =>
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );

  if (isGasError) {
    return {
      status: 'error',
      message: 'Gas estimation failed. The network might be congested. Try increasing the gas limit or waiting a few minutes.',
      code: 'GAS_ERROR',
      originalError: error
    };
  }
  
  // Nonce errors - enhanced detection
  const nonceErrorPatterns = [
    'nonce too low',
    'nonce too high',
    'invalid nonce',
    'nonce has already been used',
    'replacement transaction underpriced'
  ];

  const isNonceError = nonceErrorPatterns.some(pattern =>
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );

  if (isNonceError) {
    return {
      status: 'error',
      message: 'Transaction order conflict detected. Please try again - your wallet will automatically fix this.',
      code: 'NONCE_ERROR',
      originalError: error
    };
  }
  
  // Network/Connection errors - enhanced detection
  const networkErrorPatterns = [
    'network error',
    'connection error',
    'disconnected',
    'timeout',
    'failed to fetch',
    'network request failed',
    'could not detect network',
    'rpc error',
    'json-rpc error'
  ];

  const isNetworkError = networkErrorPatterns.some(pattern =>
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );

  if (isNetworkError) {
    return {
      status: 'error',
      message: 'Network connection issue. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      originalError: error
    };
  }
  
  // Contract execution errors - enhanced detection
  const contractErrorPatterns = [
    'execution reverted',
    'contract call failed',
    'transaction reverted',
    'call exception',
    'revert',
    'contract execution error'
  ];

  const isContractError = contractErrorPatterns.some(pattern =>
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );

  if (isContractError) {
    // Extract custom error message if available
    const revertMatch = errorString.match(/execution reverted:?\s*(.+?)(?:\s|$)/i);
    const customReason = revertMatch ? revertMatch[1].trim().replace(/['"]/g, '') : '';
    
    // Check for specific contract balance issues
    const contractBalancePatterns = [
      'insufficient contract balance',
      'insufficient pool balance',
      'contract has insufficient funds',
      'pool has insufficient funds',
      'not enough funds in contract',
      'contract balance too low'
    ];
    
    const isContractBalanceError = contractBalancePatterns.some(pattern =>
      errorString.includes(pattern) || errorMessage.includes(pattern) || customReason.toLowerCase().includes(pattern)
    );
    
    if (isContractBalanceError) {
      return {
        status: 'error',
        message: 'The staking contract currently has insufficient funds to process your withdrawal. Please try again later or contact support.',
        code: 'INSUFFICIENT_CONTRACT_BALANCE',
        originalError: error
      };
    }
    
    return {
      status: 'error',
      message: customReason || 'The smart contract rejected this transaction. Please check your inputs and try again.',
      code: 'CONTRACT_ERROR',
      originalError: error
    };
  }

  // Wallet not connected
  const walletErrorPatterns = [
    'wallet not connected',
    'no provider',
    'provider not found',
    'wallet is locked',
    'please connect wallet'
  ];

  const isWalletError = walletErrorPatterns.some(pattern =>
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );

  if (isWalletError) {
    return {
      status: 'error',
      message: 'Please connect your wallet and try again.',
      code: 'WALLET_ERROR',
      originalError: error
    };
  }

  // Return default error for anything we couldn't categorize
  return defaultError;
};

// Enhanced helper function specifically for user rejection detection
export const isUserRejection = (error) => {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = error.code;
  
  // Check error code first (most reliable)
  if (errorCode === 4001 || errorCode === 'ACTION_REJECTED') {
    return true;
  }
  
  // Enhanced patterns for user rejection
  const rejectionPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'cancelled by user',
    'rejected by user',
    'transaction was rejected',
    'user rejected transaction',
    'user denied transaction signature',
    'metamask tx signature: user denied',
    'request rejected',
    'transaction rejected',
    'action_rejected',
    'user_rejected',
    'denied by user',
    'user canceled',
    'user cancellation',
    'wallet_requestpermissions_rejected',
    'user rejected the request',
    'user denied the transaction'
  ];

  return rejectionPatterns.some(pattern => 
    errorString.includes(pattern) || errorMessage.includes(pattern)
  );
};
