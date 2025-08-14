import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useStakingContract } from './useStakingContract';
import { globalCache } from '../../utils/cache/CacheManager';
import { globalRateLimiter } from '../../utils/performance/RateLimiter';
import { fetchLogsInChunks } from '../../utils/blockchain/blockchainUtils';
import ABI from '../../Abi/SmartStaking.json';

export function useStakingEvents() {
  const { contract, getSignerAddress } = useStakingContract();
  const [eventListeners, setEventListeners] = useState(null);
  const [events, setEvents] = useState({
    deposits: [],
    withdrawals: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshFuncRef = useRef(null);
  const blockCacheRef = useRef({}); // Cache for block timestamps

  // Optimized getPoolEvents with loading/error state and parallelized block fetch
  const getPoolEvents = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    if (!contract || !contract.provider) {
      setLoading(false);
      return { deposits: [], withdrawals: [] };
    }

    const address = await getSignerAddress();
    if (!address) {
      setLoading(false);
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
          setLoading(false);
          return cachedData;
        }
      }

      const events = await globalCache.get(
        cacheKey,
        async () => {
          try {
            const latestBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, latestBlock - 5000);

            const depositTopic = ethers.id("DepositMade(address,uint256,uint256,uint256,uint256)");
            const withdrawalTopic = ethers.id("WithdrawalMade(address,uint256,uint256)");
            const paddedAddress = ethers.zeroPadValue(address, 32).toLowerCase();

            // Fetch logs in parallel with retry/backoff
            const [depositLogs, withdrawalLogs] = await Promise.all([
              fetchWithRetry(() => fetchLogsInChunks(provider, {
                address: CONTRACT_ADDRESS,
                topics: [depositTopic, paddedAddress],
                fromBlock,
                toBlock: latestBlock
              }), 2, 1000),
              fetchWithRetry(() => fetchLogsInChunks(provider, {
                address: CONTRACT_ADDRESS,
                topics: [withdrawalTopic, paddedAddress],
                fromBlock,
                toBlock: latestBlock
              }), 2, 1000)
            ]);

            const iface = new ethers.Interface(ABI.abi);

            // Get unique block numbers for all logs
            const allBlockNumbers = [
              ...new Set([
                ...depositLogs.map(log => log.blockNumber),
                ...withdrawalLogs.map(log => log.blockNumber)
              ])
            ];

            // Fetch all blocks in parallel and cache
            await Promise.all(
              allBlockNumbers.map(async (blockNumber) => {
                if (!blockCacheRef.current[blockNumber]) {
                  const block = await provider.getBlock(blockNumber);
                  if (block) blockCacheRef.current[blockNumber] = block.timestamp;
                }
              })
            );

            // Process deposits
            const processedDeposits = depositLogs.map(log => {
              try {
                const parsedLog = iface.parseLog({
                  topics: log.topics,
                  data: log.data
                });
                const blockTimestamp = blockCacheRef.current[log.blockNumber] || 0;
                return {
                  ...log,
                  args: parsedLog?.args,
                  blockTimestamp,
                  amount: ethers.formatEther(parsedLog?.args?.amount || 0),
                  timestamp: blockTimestamp
                    ? new Date(Number(blockTimestamp) * 1000).toISOString()
                    : null
                };
              } catch (e) {
                console.warn("Failed to parse deposit log", e);
                return log;
              }
            });

            // Process withdrawals
            const processedWithdrawals = withdrawalLogs.map(log => {
              try {
                const parsedLog = iface.parseLog({
                  topics: log.topics,
                  data: log.data
                });
                const blockTimestamp = blockCacheRef.current[log.blockNumber] || 0;
                return {
                  ...log,
                  args: parsedLog?.args,
                  blockTimestamp,
                  amount: ethers.formatEther(parsedLog?.args?.amount || 0),
                  timestamp: blockTimestamp
                    ? new Date(Number(blockTimestamp) * 1000).toISOString()
                    : null
                };
              } catch (e) {
                console.warn("Failed to parse withdrawal log", e);
                return log;
              }
            });

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

      setEvents(prev =>
        prev.deposits !== events.deposits || prev.withdrawals !== events.withdrawals
          ? events
          : prev
      );
      setLoading(false);

      // Prefetch next likely events (prefetching inteligente)
      if (address) {
        setTimeout(() => {
          globalCache.clearByPrefix('pool_events_');
        }, 1000);
      }
      return events;
    } catch (error) {
      setError(error);
      setLoading(false);
      return {
        deposits: [],
        withdrawals: [],
        error: error.message
      };
    }
  }, [contract, getSignerAddress]);

  // Memoized setupListeners to avoid recreation
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
  }, [contract, getSignerAddress, getPoolEvents]);

  // Memoized removeListeners
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

  useEffect(() => {
    if (!contract) return;
    getPoolEvents();
    const cleanup = setupListeners(() => {});
    return () => {
      if (cleanup) cleanup();
    };
  }, [contract, setupListeners, getPoolEvents]);

  return {
    setupListeners,
    removeListeners,
    events,
    getPoolEvents,
    loading,
    error
  };
}
