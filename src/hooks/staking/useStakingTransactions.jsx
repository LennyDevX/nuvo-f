import { useState, useCallback } from 'react';
import { useStakingContract } from './useStakingContract';

export function useStakingTransactions() {
  const { getSignedContract, getSignerAddress, getContractStatus } = useStakingContract();
  const [isPending, setIsPending] = useState(false);
  const [currentTx, setCurrentTx] = useState({
    type: null,
    status: null,
    hash: null,
    error: null
  });

  const executeTransaction = useCallback(async (transactionFn, options = {}) => {
    const txType = options.type || 'transaction';
    const updateData = options.updateData || (() => {});
    
    setIsPending(true);
    setCurrentTx({
      type: txType,
      status: 'preparing',
      hash: null,
      error: null
    });
    
    try {
      // Get contract with signer
      const contract = await getSignedContract();
      
      // Prepare transaction
      setCurrentTx(prev => ({ 
        ...prev, 
        status: 'awaiting_confirmation'
      }));
      
      // Execute the transaction function
      const tx = await transactionFn(contract);
      
      // Transaction sent
      setCurrentTx(prev => ({ 
        ...prev, 
        status: 'pending',
        hash: tx.hash
      }));
      
      console.log(`${txType} transaction sent:`, tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Transaction confirmed
      setIsPending(false);
      setCurrentTx(prev => ({ 
        ...prev, 
        status: receipt.status === 1 ? 'confirmed' : 'failed'
      }));
      
      // After transaction completes, refresh contract status
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
      
      // Parse error for more user-friendly message
      let errorMessage = error.message || 'Transaction failed';
      
      // Check for common wallet error patterns and simplify the message
      if (errorMessage.includes('user rejected') || 
          errorMessage.includes('user denied') || 
          errorMessage.includes('rejected by user') ||
          errorMessage.includes('cancelled by user') ||
          errorMessage.includes('User denied')) {
        errorMessage = 'Transaction cancelled';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet';
      } else if (errorMessage.toLowerCase().includes('gas')) {
        errorMessage = 'Network fee issue';
      } else if (errorMessage.includes('nonce')) {
        errorMessage = 'Transaction sequence error';
      } else if (errorMessage.includes('intrinsic gas')) {
        errorMessage = 'Gas estimation failed';
      } else if (errorMessage.length > 100) {
        // Truncate overly long error messages
        errorMessage = errorMessage.substring(0, 100) + '...';
      }
      
      setIsPending(false);
      setCurrentTx(prev => ({ 
        ...prev, 
        status: 'failed',
        error: errorMessage
      }));
      
      return {
        success: false,
        error: error
      };
    }
  }, [getSignedContract, getSignerAddress, getContractStatus]);

  const deposit = useCallback(async (amount) => {
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
    return executeTransaction(
      async (contract) => {
        return await contract.withdraw();
      },
      { type: 'withdraw_rewards' }
    );
  }, [executeTransaction]);

  const withdrawAll = useCallback(async () => {
    return executeTransaction(
      async (contract) => {
        return await contract.withdrawAll();
      },
      { type: 'withdraw_all' }
    );
  }, [executeTransaction]);

  const emergencyWithdraw = useCallback(async () => {
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
    txHash: currentTx.hash
  };
}
