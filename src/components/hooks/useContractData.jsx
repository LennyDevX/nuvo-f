// src/hooks/useContractData.js
import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import useProvider from "./useProvider";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const UPDATE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 1000; // 1 second

const useContractData = (account) => {
  const provider = useProvider();
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

  const cache = useRef({});
  const intervalRef = useRef(null);
  const isInitialLoad = useRef(true);
  const mounted = useRef(true);

  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || "";

  const fetchContractData = useCallback(async (isInitialFetch = false) => {
    if (!provider || !account || !CONTRACT_ADDRESS) return;

    try {
      if (isInitialFetch) setLoading(true);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      
      // Updated safe value handling
      const safeValue = (value) => {
        try {
          // Handle various input types
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

      const safeCall = async (promise, defaultValue = BigInt(0)) => {
        try {
          const result = await promise;
          return safeValue(result);
        } catch (err) {
          console.warn('Safe call error:', err);
          return defaultValue;
        }
      };

      // Format amounts safely
      const formatAmount = (value) => {
        try {
          const bigIntValue = safeValue(value);
          return ethers.formatEther(bigIntValue.toString());
        } catch (err) {
          console.warn('Format amount error:', err);
          return '0';
        }
      };

      // Get contract data with safe handling
      const [rewards, poolBalance, deposit, deposits] = await Promise.all([
        safeCall(contract.calculateRewards(account)),
        safeCall(contract.getContractBalance()),
        safeCall(contract.getTotalDeposit(account)),
        contract.getUserDeposits(account).then(deps => 
          (deps || []).map(d => ({
            amount: safeValue(d.amount),
            timestamp: Number(d.timestamp || 0)
          }))
        ).catch(() => [])
      ]);

      const newData = {
        depositAmount: formatAmount(deposit),
        availableRewards: formatAmount(rewards),
        totalPoolBalance: formatAmount(poolBalance),
        firstDepositTime: deposits[0]?.timestamp || null,
        deposits: deposits.map(d => ({
          amount: formatAmount(d.amount),
          timestamp: d.timestamp
        }))
      };

      setData(prevData => ({ ...prevData, ...newData }));
      
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setError("Failed to fetch contract data");
    } finally {
      if (isInitialFetch) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [provider, account, CONTRACT_ADDRESS]);

  // Update fetchWithdrawalEvents to use safe value handling
  const fetchWithdrawalEvents = useCallback(async () => {
    if (!provider || !account) return;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      const filter = contract.filters.WithdrawalMade(account);
      const events = await contract.queryFilter(filter);

      const withdrawals = await Promise.all(
        events.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
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
  }, [provider, account]);

  const handleWithdrawalSuccess = useCallback(async (amount) => {
    try {
      // Forzar actualización inmediata
      await fetchContractData();
      
      const netAmount = amount ? ethers.formatEther(amount) : '0';
      const timestamp = new Date().toISOString();

      setData(prevData => {
        const newTotalWithdrawn = prevData.totalWithdrawn + parseFloat(netAmount);
        const newWithdrawal = {
          amount: netAmount,
          timestamp,
          transactionHash: '',
        };

        // Actualizar localStorage
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

      // Actualizar eventos y balance
      await Promise.all([
        fetchWithdrawalEvents(),
        fetchContractData(),
      ]);
    } catch (err) {
      console.error("Error updating data after withdrawal:", err);
    }
  }, [account, fetchContractData, fetchWithdrawalEvents]);

  const handleDepositSuccess = useCallback(async () => {
    try {
      await fetchContractData();
      const cacheKey = `contractData_${account}`;
      delete cache.current[cacheKey];
    } catch (err) {
      console.error("Error updating after deposit:", err);
      setError("Error updating data after deposit");
    }
  }, [account, fetchContractData]);

  // Initial data fetch
  useEffect(() => {
    mounted.current = true;

    if (account && provider) {
      fetchContractData(true);

      // Set up interval for updates
      const intervalId = setInterval(() => {
        if (!isInitialLoad.current) {
          fetchContractData(false);
        }
      }, UPDATE_INTERVAL);

      intervalRef.current = intervalId;
    }

    return () => {
      mounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [account, provider, fetchContractData]);

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