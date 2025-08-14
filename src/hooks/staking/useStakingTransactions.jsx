import { useState, useCallback, useRef } from 'react';
import { useStakingContract } from './useStakingContract';
import { parseTransactionError, isUserRejection } from '../../utils/errors/errorHandling';
import { StakingDebugLogger, validateTransactionState, formatTransactionError } from '../../utils/staking/debugLogger';

// Timeout constants
const TX_SUCCESS_TIMEOUT = 2000;
const TX_FAIL_TIMEOUT = 3000;

export function useStakingTransactions() {
  const { getSignedContract, getSignerAddress, getContractStatus } = useStakingContract();
  const [isPending, setIsPending] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);
  const [error, setError] = useState(null);
  const pendingRef = useRef(false);

  // Prevent concurrent transactions
  const safeSetIsPending = useCallback((val) => {
    pendingRef.current = val;
    setIsPending(val);
  }, []);

  // Reset transaction state
  const resetTxState = useCallback(() => {
    safeSetIsPending(false);
    setCurrentTx(prev => prev ? { ...prev, status: 'failed', error: 'Transaction manually reset by user' } : null);
    setError(null);
  }, [safeSetIsPending]);

  // Transaction tracking with timeouts
  const trackTransaction = useCallback(async (tx, type) => {
    if (pendingRef.current) return; // Prevent concurrent
    try {
      if (!tx) throw new Error("No transaction to track");
      safeSetIsPending(true);
      setCurrentTx({
        type,
        status: 'pending',
        hash: tx.hash || null,
        error: null
      });
      const receipt = await tx.wait();
      setCurrentTx(prev => ({
        ...prev,
        status: 'confirmed',
        hash: receipt.transactionHash
      }));
      setTimeout(() => {
        safeSetIsPending(false);
      }, TX_SUCCESS_TIMEOUT);
      return receipt;
    } catch (error) {
      setError(error);
      setCurrentTx(prev => ({
        ...prev,
        status: 'failed',
        error: error.message?.includes('user rejected') ? 'Transaction rejected by user' : error.message
      }));
      setTimeout(() => {
        safeSetIsPending(false);
      }, TX_FAIL_TIMEOUT);
      throw error;
    }
  }, [safeSetIsPending]);

  // Generalized transaction executor with concurrency guard
  const executeTransaction = useCallback(async (transactionFn, options = {}) => {
    if (pendingRef.current) {
      return { success: false, error: 'Another transaction is pending' };
    }
    const txType = options.type || 'transaction';
    const updateData = options.updateData || (() => {});
    safeSetIsPending(true);
    setError(null);
    setCurrentTx({
      type: txType,
      status: 'preparing',
      hash: null,
      error: null
    });
    try {
      const contract = await getSignedContract();
      setCurrentTx(prev => ({
        ...prev,
        status: 'awaiting_confirmation'
      }));
      const tx = await transactionFn(contract);
      setCurrentTx(prev => ({
        ...prev,
        status: 'pending',
        hash: tx.hash
      }));
      console.log(`${txType} transaction sent:`, tx.hash);
      const receipt = await tx.wait();
      safeSetIsPending(false);
      setCurrentTx(prev => ({
        ...prev,
        status: receipt.status === 1 ? 'confirmed' : 'failed'
      }));
      const address = await getSignerAddress();
      if (address) {
        await Promise.all([
          getContractStatus(),
          updateData(address)
        ]);
      }
      return {
        success: receipt.status === 1,
        hash: tx.hash,
        receipt
      };
    } catch (error) {
      console.error(`Error in ${txType}:`, error);
      
      // Use the enhanced error parsing
      const parsedError = parseTransactionError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific messages for each transaction type
      if (parsedError.status === 'rejected') {
        switch (txType) {
          case 'deposit':
            errorMessage = 'You cancelled the staking transaction. No worries, your tokens are safe!';
            break;
          case 'withdraw_rewards':
            errorMessage = 'You cancelled claiming your rewards. Your rewards are still there waiting for you!';
            break;
          case 'withdraw_all':
            errorMessage = 'You cancelled the complete withdrawal. Your staked tokens and rewards remain safe.';
            break;
          case 'emergency_withdraw':
            errorMessage = 'You cancelled the emergency withdrawal. Your funds remain staked.';
            break;
          case 'compound':
            errorMessage = 'You cancelled the compound transaction. Your rewards are still available to claim or compound.';
            break;
          default:
            errorMessage = 'Transaction cancelled. Your funds are safe!';
        }
      }
      
      safeSetIsPending(false);
      setCurrentTx(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage
      }));
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [getSignedContract, getSignerAddress, getContractStatus, safeSetIsPending]);

  // Transaction functions with concurrency guard
  const deposit = useCallback(async (amount, lockupDuration = 0) => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        try {
          // Estimate gas first
          const estimatedGas = await contract.deposit.estimateGas(lockupDuration, {
            value: amount
          });
          
          // Add 20% buffer to estimated gas
          const gasLimit = Math.floor(Number(estimatedGas) * 1.2);
          
          return await contract.deposit(lockupDuration, {
            value: amount,
            gasLimit: gasLimit
          });
        } catch (estimateError) {
          console.warn('Gas estimation failed, using fallback:', estimateError);
          // Fallback to higher fixed gas limit if estimation fails
          return await contract.deposit(lockupDuration, {
            value: amount,
            gasLimit: 500000
          });
        }
      },
      { type: 'deposit' }
    );
  }, [executeTransaction]);

  const withdrawRewards = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    
    StakingDebugLogger.logTransaction('withdraw_rewards', 'STARTING');
    
    return executeTransaction(
      async (contract) => {
        try {
          // Validate rewards before attempting withdrawal
          const userAddress = await getSignerAddress();
          if (!userAddress) {
            throw new Error('Unable to get user address. Please ensure your wallet is connected.');
          }
          const [userInfo, calculatedRewards, isPaused] = await Promise.all([
            contract.getUserInfo(userAddress),
            contract.calculateRewards(userAddress),
            contract.paused()
          ]);
          
          StakingDebugLogger.logUserState(userAddress, userInfo, calculatedRewards);
          StakingDebugLogger.logContractState({ isPaused, address: contract.address });
          
          // Validate transaction state
          const validation = validateTransactionState('withdraw_rewards', userInfo, calculatedRewards, { isPaused });
          if (!validation.canProceed) {
            const errorMessage = `Cannot withdraw rewards: ${validation.failureReasons.join(', ')}`;
            StakingDebugLogger.logError('VALIDATION', new Error(errorMessage));
            throw new Error(errorMessage);
          }
          
          if (calculatedRewards.toString() === '0') {
            throw new Error('No rewards available to withdraw');
          }
          
          // Estimate gas first
          StakingDebugLogger.logTransaction('withdraw_rewards', 'ESTIMATING_GAS');
          const estimatedGas = await contract.withdraw.estimateGas();
          
          // Add 20% buffer to estimated gas
          const gasLimit = Math.floor(Number(estimatedGas) * 1.2);
          
          StakingDebugLogger.logGasEstimation('withdraw_rewards', {
            estimated: estimatedGas,
            withBuffer: gasLimit
          });
          
          StakingDebugLogger.logTransaction('withdraw_rewards', 'EXECUTING');
          return await contract.withdraw({
            gasLimit: gasLimit
          });
        } catch (estimateError) {
          StakingDebugLogger.logError('GAS_ESTIMATION', estimateError, { function: 'withdraw_rewards' });
          
          // Check if it's a validation error first
          if (estimateError.message.includes('No rewards') || estimateError.message.includes('NoRewardsAvailable')) {
            throw estimateError;
          }
          
          // Fallback to higher fixed gas limit if estimation fails
          StakingDebugLogger.logTransaction('withdraw_rewards', 'USING_FALLBACK_GAS');
          return await contract.withdraw({
            gasLimit: 400000
          });
        }
      },
      { type: 'withdraw_rewards' }
    );
  }, [executeTransaction, getSignerAddress]);

  const withdrawAll = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        try {
          // Get user info first to validate they have deposits
          const userAddress = await getSignerAddress();
          if (!userAddress) {
            throw new Error('Unable to get user address. Please ensure your wallet is connected.');
          }
          const userInfo = await contract.getUserInfo(userAddress);
          
          if (userInfo.totalDeposited.toString() === '0') {
            throw new Error('No deposits found to withdraw');
          }
          
          // Estimate gas first
          const estimatedGas = await contract.withdrawAll.estimateGas();
          
          // Add 20% buffer to estimated gas
          const gasLimit = Math.floor(Number(estimatedGas) * 1.2);
          
          return await contract.withdrawAll({
            gasLimit: gasLimit
          });
        } catch (estimateError) {
          console.warn('Gas estimation failed for withdrawAll, using fallback:', estimateError);
          
          // Check if it's a validation error first
          if (estimateError.message.includes('No deposits') || estimateError.message.includes('totalDeposited')) {
            throw estimateError;
          }
          
          // Fallback to higher fixed gas limit if estimation fails
          return await contract.withdrawAll({
            gasLimit: 500000
          });
        }
      },
      { type: 'withdraw_all' }
    );
  }, [executeTransaction, getSignerAddress]);

  const emergencyWithdraw = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        try {
          // Estimate gas first
          const estimatedGas = await contract.emergencyUserWithdraw.estimateGas();
          
          // Add 20% buffer to estimated gas
          const gasLimit = Math.floor(Number(estimatedGas) * 1.2);
          
          return await contract.emergencyUserWithdraw({
            gasLimit: gasLimit
          });
        } catch (estimateError) {
          console.warn('Gas estimation failed for emergencyWithdraw, using fallback:', estimateError);
          // Fallback to higher fixed gas limit if estimation fails
          return await contract.emergencyUserWithdraw({
            gasLimit: 400000
          });
        }
      },
      { type: 'emergency_withdraw' }
    );
  }, [executeTransaction]);

  const compound = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    
    StakingDebugLogger.logTransaction('compound', 'STARTING');
    
    return executeTransaction(
      async (contract) => {
        try {
          // Get user address and calculate rewards directly from contract
          const userAddress = await getSignerAddress();
          if (!userAddress) {
            throw new Error('Unable to get user address. Please ensure your wallet is connected.');
          }
          const [userInfo, calculatedRewards, isPaused] = await Promise.all([
            contract.getUserInfo(userAddress),
            contract.calculateRewards(userAddress),
            contract.paused()
          ]);
          
          StakingDebugLogger.logUserState(userAddress, userInfo, calculatedRewards);
          StakingDebugLogger.logContractState({ isPaused, address: contract.address });
          
          // Validate transaction state
          const validation = validateTransactionState('compound', userInfo, calculatedRewards, { isPaused });
          if (!validation.canProceed) {
            const errorMessage = `Cannot compound: ${validation.failureReasons.join(', ')}`;
            StakingDebugLogger.logError('VALIDATION', new Error(errorMessage));
            throw new Error(errorMessage);
          }
          
          if (calculatedRewards.toString() === '0') {
            throw new Error('No rewards available to compound');
          }
          
          // Estimate gas first
          StakingDebugLogger.logTransaction('compound', 'ESTIMATING_GAS');
          const estimatedGas = await contract.compound.estimateGas();
          
          // Add 20% buffer to estimated gas
          const gasLimit = Math.floor(Number(estimatedGas) * 1.2);
          
          StakingDebugLogger.logGasEstimation('compound', {
            estimated: estimatedGas,
            withBuffer: gasLimit
          });
          
          StakingDebugLogger.logTransaction('compound', 'EXECUTING');
          return await contract.compound({
            gasLimit: gasLimit
          });
        } catch (estimateError) {
          StakingDebugLogger.logError('GAS_ESTIMATION', estimateError, { function: 'compound' });
          
          // Check if it's a validation error first
          if (estimateError.message.includes('No rewards') || estimateError.message.includes('NoRewardsAvailable')) {
            throw estimateError;
          }
          
          // Fallback to higher fixed gas limit if estimation fails
          StakingDebugLogger.logTransaction('compound', 'USING_FALLBACK_GAS');
          return await contract.compound({
            gasLimit: 400000
          });
        }
      },
      { type: 'compound' }
    );
  }, [executeTransaction, getSignerAddress]);

  return {
    deposit,
    withdrawRewards,
    withdrawAll,
    emergencyWithdraw,
    compound,
    isPending,
    executeTransaction,
    currentTx,
    txHash: currentTx?.hash,
    resetTxState,
    trackTransaction,
    error
  };
}
