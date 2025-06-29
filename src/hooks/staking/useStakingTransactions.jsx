import { useState, useCallback, useRef } from 'react';
import { useStakingContract } from './useStakingContract';
import { parseTransactionError, isUserRejection } from '../../utils/errors/errorHandling';

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
            errorMessage = 'You cancelled the withdrawal. Your staked tokens and rewards remain safe.';
            break;
          case 'emergency_withdraw':
            errorMessage = 'You cancelled the emergency withdrawal. Your funds remain staked.';
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
  const deposit = useCallback(async (amount) => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        return await contract.deposit({
          value: amount,
          gasLimit: 300000
        });
      },
      { type: 'deposit' }
    );
  }, [executeTransaction]);

  const withdrawRewards = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        return await contract.withdraw();
      },
      { type: 'withdraw_rewards' }
    );
  }, [executeTransaction]);

  const withdrawAll = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        return await contract.withdrawAll();
      },
      { type: 'withdraw_all' }
    );
  }, [executeTransaction]);

  const emergencyWithdraw = useCallback(async () => {
    if (pendingRef.current) return { success: false, error: 'Another transaction is pending' };
    return executeTransaction(
      async (contract) => {
        return await contract.emergencyUserWithdraw();
      },
      { type: 'emergency_withdraw' }
    );
  }, [executeTransaction]);

  return {
    deposit,
    withdrawRewards,
    withdrawAll,
    emergencyWithdraw,
    isPending,
    executeTransaction,
    currentTx,
    txHash: currentTx?.hash,
    resetTxState,
    trackTransaction,
    error
  };
}
