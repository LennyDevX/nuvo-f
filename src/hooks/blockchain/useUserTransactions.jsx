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
    console.log('Refreshing transactions...');
    setLastUpdated(Date.now());
  };

  useEffect(() => {
    console.log('useUserTransactions hook running with account:', account ? `${account.substring(0, 8)}...` : 'none');
    if (!account || !provider) {
      console.log('No account or provider available');
      return;
    }

    let isMounted = true;
    setLoading(true);
    
    const getTransactions = async () => {
      try {
        console.log('Fetching transactions from blockchain...');
        // Use the enhanced fetchTransactions with additional options
        const options = {
          chainId: provider.network?.chainId || 137,
          limit: 50
        };
        
        const txs = await fetchTransactions(account, provider, options);
        console.log(`Retrieved ${txs?.length || 0} transactions from blockchain`);
        
        if (isMounted) {
          // Note: enhanced fetchTransactions already includes formattedDate and description
          setTransactions(txs || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (isMounted) {
          setError("No se pudieron cargar las transacciones");
          // Even if there's an error, return empty array to prevent loading forever
          setTransactions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Transaction loading completed');
        }
      }
    };
    
    getTransactions();
    
    return () => {
      console.log('useUserTransactions cleanup');
      isMounted = false;
    };
  }, [account, provider, lastUpdated]);

  return { transactions, loading, error, refreshTransactions };
}