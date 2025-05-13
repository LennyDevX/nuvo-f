import { useState, useEffect } from 'react';
import { fetchTransactions, formatTimestamp } from '../../utils/blockchain/blockchainUtils';
import useProvider from './useProvider';

export default function useUserTransactions() {
  const { provider, account } = useProvider();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);

  // Refrescar transacciones
  const refreshTransactions = () => {
    setLastUpdated(Date.now());
  };

  useEffect(() => {
    if (!account || !provider) return;

    let isMounted = true;
    setLoading(true);
    
    const getTransactions = async () => {
      try {
        // Use the enhanced fetchTransactions with additional options
        const options = {
          chainId: provider.network?.chainId || 137,
          limit: 50
        };
        
        const txs = await fetchTransactions(account, provider, options);
        
        if (isMounted) {
          // Note: enhanced fetchTransactions already includes formattedDate and description
          setTransactions(txs);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (isMounted) {
          setError("No se pudieron cargar las transacciones");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    getTransactions();
    
    return () => {
      isMounted = false;
    };
  }, [account, provider, lastUpdated]);

  return { transactions, loading, error, refreshTransactions };
}