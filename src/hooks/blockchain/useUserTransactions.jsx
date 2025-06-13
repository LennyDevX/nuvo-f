import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useProvider } from './useProvider';
import { globalCache } from '../../utils/cache/CacheManager';

export const useUserTransactions = (userAddress) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { provider } = useProvider();

  const fetchUserTransactions = useCallback(async () => {
    if (!userAddress || !provider) return;

    setLoading(true);
    setError(null);

    try {
      const cacheKey = `user_transactions_${userAddress}`;
      const cached = globalCache.get(cacheKey);
      
      if (cached) {
        setTransactions(cached);
        setLoading(false);
        return;
      }

      // Get current block
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks

      // Create filter for transactions involving the user
      const transferFilter = {
        topics: [
          ethers.id("Transfer(address,address,uint256)"),
          null, // from (any address)
          ethers.zeroPadValue(userAddress, 32) // to (user address)
        ],
        fromBlock,
        toBlock: currentBlock
      };

      const logs = await provider.getLogs(transferFilter);
      
      const transactionData = await Promise.all(
        logs.slice(0, 50).map(async (log) => { // Limit to 50 recent transactions
          try {
            const tx = await provider.getTransaction(log.transactionHash);
            const receipt = await provider.getTransactionReceipt(log.transactionHash);
            
            return {
              hash: log.transactionHash,
              blockNumber: log.blockNumber,
              from: tx.from,
              to: tx.to,
              value: tx.value ? ethers.formatEther(tx.value) : '0',
              gasUsed: receipt.gasUsed.toString(),
              status: receipt.status,
              timestamp: null // Would need to fetch block for timestamp
            };
          } catch (err) {
            console.warn('Error processing transaction:', err);
            return null;
          }
        })
      );

      const validTransactions = transactionData.filter(Boolean);
      
      // Cache for 5 minutes
      globalCache.set(cacheKey, validTransactions, 5 * 60 * 1000);
      setTransactions(validTransactions);

    } catch (err) {
      console.error('Error fetching user transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userAddress, provider]);

  useEffect(() => {
    fetchUserTransactions();
  }, [fetchUserTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchUserTransactions
  };
};

export default useUserTransactions;