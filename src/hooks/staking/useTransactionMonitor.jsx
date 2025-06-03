import { useEffect, useRef, useCallback } from 'react';
import { useStaking } from '../../context/StakingContext';

export const useTransactionMonitor = (currentTx, isPending, onComplete = () => {}) => {
  const { forceRefresh, getSignerAddress } = useStaking();
  const transactionTimerRef = useRef(null);
  const txHashChecked = useRef(false);

  // Verifica el estado de la transacción en la blockchain, solo una vez por ciclo
  const verifyTransactionOnChain = useCallback(
    async (txHash, provider) => {
      if (!provider || !txHash || txHashChecked.current) return false;
      try {
        txHashChecked.current = true;
        const receipt = await provider.getTransactionReceipt(txHash);
        return receipt ? { confirmed: true, success: receipt.status === 1 } : null;
      } catch (error) {
        console.error("Error verifying transaction:", error);
        return null;
      }
    },
    [] // No depende de nada externo
  );

  // Permite resetear el estado de la transacción y refrescar datos
  const resetTransaction = useCallback(
    async () => {
      if (!isPending) return;
      // Limpia el timer si existe
      if (transactionTimerRef.current) {
        clearTimeout(transactionTimerRef.current);
        transactionTimerRef.current = null;
      }
      txHashChecked.current = false;
      onComplete({ type: 'reset', message: 'Transaction state reset' });
      const address = await getSignerAddress();
      if (address) {
        await forceRefresh(address);
      }
    },
    [isPending, onComplete, getSignerAddress, forceRefresh]
  );

  // Monitorea la transacción pendiente y gestiona el timeout
  useEffect(() => {
    // Limpia cualquier timer previo antes de crear uno nuevo
    if (transactionTimerRef.current) {
      clearTimeout(transactionTimerRef.current);
      transactionTimerRef.current = null;
    }

    if (!isPending || !currentTx) {
      txHashChecked.current = false; // Permite reintentos si cambia la tx
      return;
    }

    // Crea un nuevo timer de 2 minutos
    transactionTimerRef.current = setTimeout(() => {
      console.log("Transaction may be stuck, signaling for reset option");
      onComplete({
        type: 'timeout',
        message: 'Transaction taking longer than expected',
        canReset: true
      });
    }, 120000);

    // Limpieza estricta del timer al desmontar o cambiar dependencias
    return () => {
      if (transactionTimerRef.current) {
        clearTimeout(transactionTimerRef.current);
        transactionTimerRef.current = null;
      }
    };
  }, [isPending, currentTx, onComplete]);

  return {
    resetTransaction,
    verifyTransactionOnChain
  };
};

export default useTransactionMonitor;
