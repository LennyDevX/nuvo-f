import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useStakingContract } from './useStakingContract';
import { globalCache } from '../../utils/cache/CacheManager';
import { globalRateLimiter } from '../../utils/performance/RateLimiter';
import { fetchLogsInChunks } from '../../utils/blockchain/blockchainUtils';
import ABI from '../../Abi/StakingContract.json';

export function useStakingEvents() {
  const { contract, getSignerAddress } = useStakingContract();
  const [eventListeners, setEventListeners] = useState(null);
  const [events, setEvents] = useState({
    deposits: [],
    withdrawals: []
  });
  const refreshFuncRef = useRef(null);

  const setupListeners = useCallback((refreshCallback) => {
    if (!contract || !contract.provider) return;
    
    refreshFuncRef.current = refreshCallback;
    
    try {
      const depositFilter = contract.filters.DepositMade();
      const handleDeposit = async (user, depositId, amount, commission, timestamp) => {
        const currentAddress = await getSignerAddress();
        if (currentAddress && user.toLowerCase() === currentAddress.toLowerCase()) {
          if (refreshFuncRef.current) {
            await refreshFuncRef.current(currentAddress);
          }
          
          // Update local events cache
          await getPoolEvents({ forceRefresh: true });
        }
      };
      
      const withdrawalFilter = contract.filters.WithdrawalMade();
      const handleWithdrawal = async (user, amount, commission) => {
        const currentAddress = await getSignerAddress();
        if (currentAddress && user.toLowerCase() === currentAddress.toLowerCase()) {
          if (refreshFuncRef.current) {
            await refreshFuncRef.current(currentAddress);
          }
          
          // Update local events cache
          await getPoolEvents({ forceRefresh: true });
        }
      };
      
      contract.on(depositFilter, handleDeposit);
      contract.on(withdrawalFilter, handleWithdrawal);
      
      setEventListeners({
        deposit: { filter: depositFilter, handler: handleDeposit },
        withdrawal: { filter: withdrawalFilter, handler: handleWithdrawal }
      });
      
      return () => {
        contract.off(depositFilter, handleDeposit);
        contract.off(withdrawalFilter, handleWithdrawal);
      };
    } catch (error) {
      console.error("Error setting up event listeners:", error);
    }
  }, [contract, getSignerAddress]);

  const removeListeners = useCallback(() => {
    if (!contract || !eventListeners) return;
    
    try {
      if (eventListeners.deposit) {
        contract.off(eventListeners.deposit.filter, eventListeners.deposit.handler);
      }
      if (eventListeners.withdrawal) {
        contract.off(eventListeners.withdrawal.filter, eventListeners.withdrawal.handler);
      }
      
      setEventListeners(null);
    } catch (error) {
      console.error("Error removing event listeners:", error);
    }
  }, [contract, eventListeners]);

  const getPoolEvents = useCallback(async (options = {}) => {
    if (!contract || !contract.provider) {
      return { deposits: [], withdrawals: [] };
    }
    
    const address = await getSignerAddress();
    if (!address) {
      return { deposits: [], withdrawals: [] };
    }
    
    const rateLimiterKey = `pool_events_${address}`;
    const provider = contract.provider;
    const CONTRACT_ADDRESS = await contract.getAddress();
    
    try {
      const cacheKey = `pool_events_${address}`;
      
      if (options.forceRefresh) {
        globalCache.clear(cacheKey);
      } else if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
        const cachedData = globalCache.get(cacheKey);
        if (cachedData) {
          setEvents(cachedData);
          return cachedData;
        }
      }

      const events = await globalCache.get(
        cacheKey,
        async () => {
          try {
            const latestBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, latestBlock - 5000); // ~1 day of blocks
            
            // Define event signatures
            const depositTopic = ethers.id("DepositMade(address,uint256,uint256,uint256,uint256)");
            const withdrawalTopic = ethers.id("WithdrawalMade(address,uint256,uint256)");
            
            // Format address for topic filter
            const paddedAddress = ethers.zeroPadValue(address, 32).toLowerCase();
            
            // Fetch deposit logs
            const depositLogs = await fetchLogsInChunks(provider, {
              address: CONTRACT_ADDRESS,
              topics: [depositTopic, paddedAddress],
              fromBlock,
              toBlock: latestBlock
            });
            
            // Fetch withdrawal logs
            const withdrawalLogs = await fetchLogsInChunks(provider, {
              address: CONTRACT_ADDRESS,
              topics: [withdrawalTopic, paddedAddress],
              fromBlock,
              toBlock: latestBlock
            });
            
            // Parse logs
            const iface = new ethers.Interface(ABI.abi);
            
            // Process deposits
            const processedDeposits = await Promise.all(
              depositLogs.map(async log => {
                try {
                  const parsedLog = iface.parseLog({
                    topics: log.topics,
                    data: log.data
                  });
                  
                  // Get block for timestamp
                  const block = await provider.getBlock(log.blockNumber);
                  
                  return {
                    ...log,
                    args: parsedLog?.args,
                    blockTimestamp: block ? block.timestamp : 0,
                    amount: ethers.formatEther(parsedLog?.args?.amount || 0),
                    timestamp: block ? new Date(Number(block.timestamp) * 1000).toISOString() : null
                  };
                } catch (e) {
                  console.warn("Failed to parse deposit log", e);
                  return log;
                }
              })
            );
            
            // Process withdrawals
            const processedWithdrawals = await Promise.all(
              withdrawalLogs.map(async log => {
                try {
                  const parsedLog = iface.parseLog({
                    topics: log.topics,
                    data: log.data
                  });
                  
                  // Get block for timestamp
                  const block = await provider.getBlock(log.blockNumber);
                  
                  return {
                    ...log,
                    args: parsedLog?.args,
                    blockTimestamp: block ? block.timestamp : 0,
                    amount: ethers.formatEther(parsedLog?.args?.amount || 0),
                    timestamp: block ? new Date(Number(block.timestamp) * 1000).toISOString() : null
                  };
                } catch (e) {
                  console.warn("Failed to parse withdrawal log", e);
                  return log;
                }
              })
            );
            
            const result = { 
              deposits: processedDeposits, 
              withdrawals: processedWithdrawals,
              source: 'blockchain'
            };
            
            return result;
          } catch (error) {
            console.error("Error fetching events:", error);
            return { 
              deposits: [], 
              withdrawals: [],
              error: error.message
            };
          }
        },
        options.forceRefresh ? 0 : 900000 // 15 minutes cache TTL
      );
      
      setEvents(events);
      return events;
    } catch (error) {
      console.error("Error in getPoolEvents:", error);
      return { 
        deposits: [], 
        withdrawals: [],
        error: error.message
      };
    }
  }, [contract, getSignerAddress]);

  useEffect(() => {
    if (!contract) return;
    
    // Load initial events
    getPoolEvents();
    
    // Setup listeners
    const cleanup = setupListeners(() => {
      // This is a placeholder for the refresh callback
      // It will be replaced when setupListeners is called with a real callback
    });
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [contract, setupListeners, getPoolEvents]);

  return {
    setupListeners,
    removeListeners,
    events,
    getPoolEvents
  };
}
