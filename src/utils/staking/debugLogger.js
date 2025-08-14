// Debug logger para problemas de staking
export class StakingDebugLogger {
  static isDebugMode = process.env.NODE_ENV === 'development';
  
  static log(category, message, data = null) {
    if (!this.isDebugMode) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[STAKING-${category.toUpperCase()}] ${timestamp}`;
    
    console.group(prefix);
    console.log(message);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }
  
  static logTransaction(type, phase, data = null) {
    this.log('TRANSACTION', `${type.toUpperCase()} - ${phase}`, data);
  }
  
  static logValidation(type, result, data = null) {
    const status = result ? '✅ PASS' : '❌ FAIL';
    this.log('VALIDATION', `${type.toUpperCase()} - ${status}`, data);
  }
  
  static logError(category, error, context = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[STAKING-ERROR-${category.toUpperCase()}] ${timestamp}`;
    
    console.group(prefix);
    console.error('Error:', error);
    if (context) {
      console.log('Context:', context);
    }
    console.trace();
    console.groupEnd();
  }
  
  static logGasEstimation(type, gasData) {
    this.log('GAS', `${type.toUpperCase()} Gas Estimation`, {
      estimated: gasData.estimated?.toString(),
      withBuffer: gasData.withBuffer?.toString(),
      fallback: gasData.fallback?.toString(),
      gasPrice: gasData.gasPrice,
      estimatedCost: gasData.estimatedCost
    });
  }
  
  static logUserState(userAddress, userInfo, calculatedRewards) {
    this.log('USER_STATE', 'Current User State', {
      address: userAddress,
      totalDeposited: userInfo?.totalDeposited?.toString(),
      pendingRewards: userInfo?.pendingRewards?.toString(),
      calculatedRewards: calculatedRewards?.toString(),
      lastWithdraw: userInfo?.lastWithdraw?.toString()
    });
  }
  
  static logContractState(contractData) {
    this.log('CONTRACT_STATE', 'Current Contract State', {
      isPaused: contractData.isPaused,
      contractBalance: contractData.contractBalance?.toString(),
      address: contractData.address
    });
  }
  
  static logButtonState(buttonStates) {
    this.log('UI_STATE', 'Button States', buttonStates);
  }
}

// Helper function para formatear errores de transacción
export function formatTransactionError(error, context = {}) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    code: error?.code || 'UNKNOWN',
    reason: error?.reason || null,
    context
  };
  
  StakingDebugLogger.logError('TRANSACTION', error, errorInfo);
  
  return errorInfo;
}

// Helper function para validar estado antes de transacciones
export function validateTransactionState(type, userInfo, calculatedRewards, contractState) {
  const validations = {
    contractNotPaused: !contractState.isPaused,
    hasRewards: calculatedRewards && calculatedRewards.toString() !== '0',
    hasDeposits: userInfo && userInfo.totalDeposited && userInfo.totalDeposited.toString() !== '0',
    contractHasFunds: contractState.contractBalance && Number(contractState.contractBalance) > 0
  };
  
  let canProceed = true;
  let failureReasons = [];
  
  switch (type) {
    case 'compound':
    case 'withdraw_rewards':
      if (!validations.contractNotPaused) {
        canProceed = false;
        failureReasons.push('Contract is paused');
      }
      if (!validations.hasRewards) {
        canProceed = false;
        failureReasons.push('No rewards available');
      }
      if (!validations.contractHasFunds) {
        canProceed = false;
        failureReasons.push('Contract has insufficient funds');
      }
      break;
      
    case 'withdraw_all':
      if (!validations.contractNotPaused) {
        canProceed = false;
        failureReasons.push('Contract is paused');
      }
      if (!validations.hasDeposits) {
        canProceed = false;
        failureReasons.push('No deposits found');
      }
      break;
  }
  
  StakingDebugLogger.logValidation(type, canProceed, {
    validations,
    failureReasons,
    userInfo: {
      totalDeposited: userInfo?.totalDeposited?.toString(),
      pendingRewards: userInfo?.pendingRewards?.toString()
    },
    calculatedRewards: calculatedRewards?.toString(),
    contractState
  });
  
  return {
    canProceed,
    failureReasons,
    validations
  };
}

export default StakingDebugLogger;