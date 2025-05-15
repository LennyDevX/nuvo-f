// src/hooks/useContractData.js
import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useStakingContract } from './useStakingContract';
import { useStakingRewards } from './useStakingRewards';
import { globalRateLimiter } from "../../utils/RateLimiter";
import { globalCache } from "../../utils/CacheManager";

const POLLING_INTERVAL = 30000; // 30 seconds
const CACHE_DURATION = 5000; // 5 seconds
const UPDATE_INTERVAL = 30000; // 30 seconds

const useContractData = (account) => {
  // Use our specialized hooks
  const { contract, isInitialized } = useStakingContract();
  const { refreshUserInfo } = useStakingRewards();

  // State management
  const [data, setData] = useState({
    depositAmount: 0,
    availableRewards: 0,
    totalPoolBalance: 0,
    firstDepositTime: null,
    withdrawalHistory: [],
    totalWithdrawn: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isInitialLoad = useRef(true);
  const mounted = useRef(true);
  const lastFetchTime = useRef(0);
  const fetchTimeout = useRef(null);

  const fetchContractData = useCallback(async (force = false) => {
    if (!contract || !account || !isInitialized) {
      console.log("Missing dependencies:", { contract: !!contract, account, isInitialized });
      return;
    }

    // Use rate limiter to prevent excessive calls
    const rateLimiterKey = `contract_data_${account}`;
    if (!force && !globalRateLimiter.canMakeCall(rateLimiterKey)) {
      console.log("Rate limited, skipping contract data fetch");
      return;
    }

    // Skip if recently fetched (throttle requests)
    const now = Date.now();
    if (!force && now - lastFetchTime.current < UPDATE_INTERVAL / 2) return;

    lastFetchTime.current = now;

    if (!mounted.current) return;
    setLoading(true);

    try {
      // Try to get data from cache first if not forced
      if (!force) {
        const cacheKey = `contractData_${account}`;
        const cachedData = await globalCache.get(cacheKey, null, CACHE_DURATION);
        if (cachedData) {
          console.log("Using cached contract data");
          setData(prev => ({ ...prev, ...cachedData }));
          setLoading(false);
          return;
        }
      }

      // Use our refreshUserInfo function from useStakingRewards
      const userData = await refreshUserInfo(account);
      
      if (userData) {
        const newData = {
          depositAmount: userData.userInfo.totalStaked,
          availableRewards: userData.userInfo.calculatedRewards,
          totalPoolBalance: userData.userInfo.totalPoolBalance || '0',
          firstDepositTime: userData.deposits[0]?.timestamp || null,
          deposits: userData.deposits.map(d => ({
            amount: d.amount,
            timestamp: d.timestamp
          }))
        };

        setData(prevData => ({ ...prevData, ...newData }));

        // Cache the new data
        if (newData && Object.keys(newData).length > 0) {
          const cacheKey = `contractData_${account}`;
          globalCache.set(cacheKey, newData, CACHE_DURATION);
        }
      }

      lastFetchTime.current = Date.now();
      
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setError("Failed to fetch contract data");
    } finally {
      if (force) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [contract, account, isInitialized, refreshUserInfo]);

  // Format utility functions
  const safeValue = (value) => {
    try {
      if (typeof value === 'bigint') return value;
      if (typeof value === 'string') return BigInt(value);
      if (typeof value === 'number') return BigInt(Math.floor(value));
      if (value?._isBigNumber) return BigInt(value.toString());
      return BigInt(0);
    } catch (err) {
      console.warn('Safe value conversion error:', err);
      return BigInt(0);
    }
  };

  const formatAmount = (value) => {
    try {
      const bigIntValue = safeValue(value);
      return ethers.formatEther(bigIntValue.toString());
    } catch (err) {
      console.warn('Format amount error:', err);
      return '0';
    }
  };

  // Fetch withdrawal events
  const fetchWithdrawalEvents = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const filter = contract.filters.WithdrawalMade(account);
      const events = await contract.queryFilter(filter);

      const withdrawals = await Promise.all(
        events.map(async (event) => {
          const block = await contract.provider.getBlock(event.blockNumber);
          const amount = event.args?.amount ? safeValue(event.args.amount) : BigInt(0);
          return {
            netAmount: ethers.formatEther(amount.toString()),
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            transactionHash: event.transactionHash,
          };
        })
      );

      const totalNetWithdrawn = withdrawals.reduce(
        (acc, w) => acc + Number(w.netAmount),
        0
      );

      setData(prevData => ({
        ...prevData,
        withdrawalHistory: withdrawals,
        totalWithdrawn: totalNetWithdrawn,
      }));

      localStorage.setItem(
        `withdrawals_${account}`,
        JSON.stringify(withdrawals)
      );
      localStorage.setItem(`totalWithdrawn_${account}`, totalNetWithdrawn.toString());
    } catch (err) {
      console.error("Error fetching withdrawal events:", err);
      setError("Error al obtener eventos de retiro");
    }
  }, [contract, account]);

  // Handle withdrawal success
  const handleWithdrawalSuccess = useCallback(async (amount) => {
    try {
      await fetchContractData(true);
      
      const netAmount = amount ? ethers.formatEther(amount) : '0';
      const timestamp = new Date().toISOString();

      setData(prevData => {
        const newTotalWithdrawn = prevData.totalWithdrawn + parseFloat(netAmount);
        const newWithdrawal = {
          amount: netAmount,
          timestamp,
          transactionHash: '',
        };

        localStorage.setItem(
          `withdrawals_${account}`,
          JSON.stringify([...prevData.withdrawalHistory, newWithdrawal])
        );
        localStorage.setItem(`totalWithdrawn_${account}`, newTotalWithdrawn.toString());
        localStorage.setItem(`lastWithdrawal_${account}`, timestamp);

        return {
          ...prevData,
          availableRewards: '0',
          withdrawalHistory: [...prevData.withdrawalHistory, newWithdrawal],
          totalWithdrawn: newTotalWithdrawn,
        };
      });

      await Promise.all([
        fetchWithdrawalEvents(),
        fetchContractData(true),
      ]);
    } catch (err) {
      console.error("Error updating data after withdrawal:", err);
    }
  }, [account, fetchContractData, fetchWithdrawalEvents]);

  // Handle deposit success
  const handleDepositSuccess = useCallback(async () => {
    try {
      await fetchContractData(true);
      const cacheKey = `contractData_${account}`;
      globalCache.clear(cacheKey);
    } catch (err) {
      console.error("Error updating after deposit:", err);
      setError("Error updating data after deposit");
    }
  }, [account, fetchContractData]);

  // Setup polling interval
  useEffect(() => {
    mounted.current = true;

    if (account && contract) {
      fetchContractData(true);

      const pollData = () => {
        fetchTimeout.current = setTimeout(() => {
          fetchContractData();
          pollData();
        }, POLLING_INTERVAL);
      };

      pollData();
    }

    return () => {
      mounted.current = false;
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [account, contract, fetchContractData]);

  return {
    ...data,
    loading: loading && isInitialLoad.current,
    error,
    fetchContractData,
    isInitialLoad: isInitialLoad.current,
    handleWithdrawalSuccess,
    handleDepositSuccess,
  };
};

export default useContractData;