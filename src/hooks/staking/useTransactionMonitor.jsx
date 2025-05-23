import { useEffect, useRef, useCallback } from 'react';
import { useStaking } from '../../context/StakingContext';

export const useTransactionMonitor = (currentTx, isPending, onComplete = () => {}) => {
  const { forceRefresh, getSignerAddress } = useStaking();
  const transactionTimerRef = useRef(null);
  const txHashChecked = useRef(false);
  
  // Función para verificar estado de la transacción en la cadena
  const verifyTransactionOnChain = useCallback(async (txHash, provider) => {
    if (!provider || !txHash || txHashChecked.current) return false;
    
    try {
      txHashChecked.current = true;
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt ? { confirmed: true, success: receipt.status === 1 } : null;
    } catch (error) {
      console.error("Error verifying transaction:", error);
      return null;
    }
  }, []);
  
  // Reset de transacción
  const resetTransaction = useCallback(async () => {
    if (!isPending) return;
    
    clearTimeout(transactionTimerRef.current);
    txHashChecked.current = false;
    
    // Notificar completado con reset
    onComplete({ type: 'reset', message: 'Transaction state reset' });
    
    // Actualizar datos del usuario
    const address = await getSignerAddress();
    if (address) {
      await forceRefresh(address);
    }
  }, [isPending, onComplete, getSignerAddress, forceRefresh]);
  
  // Monitoreo de transacción pendiente
  useEffect(() => {
    if (!isPending || !currentTx) {
      clearTimeout(transactionTimerRef.current);
      return;
    }
    
    // Si la transacción está pendiente por más de 2 min, ofrecer reset
    transactionTimerRef.current = setTimeout(() => {
      console.log("Transaction may be stuck, signaling for reset option");
      onComplete({ 
        type: 'timeout', 
        message: 'Transaction taking longer than expected',
        canReset: true
      });
    }, 120000);
    
    return () => clearTimeout(transactionTimerRef.current);
  }, [isPending, currentTx, onComplete]);
  
  return {
    resetTransaction,
    verifyTransactionOnChain
  };
};

export default useTransactionMonitor;
