import { useState, useCallback } from 'react';
import { useStakingContract } from './useStakingContract';

export const useStakingEvents = () => {
  const { contract } = useStakingContract();
  const [events, setEvents] = useState({ deposits: [], withdrawals: [] });

  // Get pool events with improved error handling and pagination
  const getPoolEvents = useCallback(async ({ 
    forceRefresh = false, 
    signal = null,
    batchSize = 200,  // Default batch size (smaller is more reliable but slower)
    maxRetries = 3    // Number of retries for failed requests
  } = {}) => {
    if (!contract) return null;

    try {
      // Get the current block number for filtering
      const currentBlock = await contract.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Look back ~10k blocks
      
      // Use pagination to avoid "method handler crashed" errors
      const fetchLogsInBatches = async (filter) => {
        let allLogs = [];
        let currentFromBlock = fromBlock;
        
        while (currentFromBlock <= currentBlock) {
          const toBlock = Math.min(currentFromBlock + batchSize - 1, currentBlock);
          
          // Apply retry logic for each batch
          let retryCount = 0;
          let batchLogs = [];
          let success = false;
          
          while (!success && retryCount < maxRetries) {
            try {
              // Check if operation was aborted
              if (signal?.aborted) {
                throw new Error('Operation was aborted');
              }
              
              // Get logs for current batch
              batchLogs = await contract.queryFilter({
                ...filter,
                fromBlock: currentFromBlock,
                toBlock
              });
              
              success = true;
            } catch (error) {
              retryCount++;
              
              console.warn(`Error fetching logs for blocks ${currentFromBlock}-${toBlock}. Retry ${retryCount}/${maxRetries}`, error);
              
              if (retryCount >= maxRetries) {
                console.error(`Max retries exceeded for blocks ${currentFromBlock}-${toBlock}:`, error);
                // Continue to next batch instead of failing completely
                break;
              }
              
              // Exponential backoff
              await new Promise(resolve => 
                setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1))
              );
              
              // Maybe try with an even smaller batch if we hit limits
              if (retryCount > 1 && batchSize > 50) {
                batchSize = Math.max(50, Math.floor(batchSize / 2));
                console.log(`Reducing batch size to ${batchSize} blocks`);
              }
            }
          }
          
          // Add successful logs to result
          allLogs = [...allLogs, ...batchLogs];
          
          // Move to next batch
          currentFromBlock = toBlock + 1;
        }
        
        return allLogs;
      };
      
      // Get deposits with pagination
      const deposits = await fetchLogsInBatches(
        contract.filters.Deposit(null, null, null)
      );
      
      // Get withdrawals with pagination
      const withdrawals = await fetchLogsInBatches(
        contract.filters.Withdraw(null, null)
      );
      
      // Process and update state
      setEvents({
        deposits,
        withdrawals
      });
      
      return { deposits, withdrawals };
    } catch (error) {
      console.error("Error getting pool events:", error);
      return { deposits: [], withdrawals: [] };
    }
  }, [contract]);

  return { events, getPoolEvents };
};
