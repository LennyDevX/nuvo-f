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

    // Debounce check
    const now = Date.now();
    const lastFetch = cache.current.lastFetch || 0;
    if (!isInitialFetch && now - lastFetch < DEBOUNCE_DELAY) {
      return;
    }
    cache.current.lastFetch = now;

    try {
      if (isInitialFetch) {
        setLoading(true);
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);

      const [rewards, poolBalance, deposit, deposits, withdrawEvents] = await Promise.all([
        contract.calculateRewards(account).catch(() => '0'),
        contract.getContractBalance().catch(() => '0'),
        contract.getTotalDeposit(account).catch(() => '0'),
        contract.getUserDeposits(account).catch(() => []),
        // Add withdrawal events fetch here
        contract.queryFilter(contract.filters.WithdrawalMade(account))
      ]);

      // Calculate total withdrawn
      const totalWithdrawn = withdrawEvents.reduce((acc, event) => 
        acc + parseFloat(ethers.formatEther(event.args.amount || '0')), 0);

      console.log('Contract Data Fetched:', {
        deposit: ethers.formatEther(deposit.toString()),
        totalWithdrawn
      });

      if (!mounted.current) return;

      const newData = {
        depositAmount: ethers.formatEther(deposit.toString()),
        availableRewards: ethers.formatEther(rewards.toString()),
        totalPoolBalance: ethers.formatEther(poolBalance.toString()),
        firstDepositTime: deposits[0]?.timestamp || null,
        totalWithdrawn,
        deposits: deposits.map(d => ({
          amount: ethers.formatEther(d.amount.toString()),
          timestamp: Number(d.timestamp)
        }))
      };

      setData(prevData => ({ ...prevData, ...newData }));
      if (isInitialFetch) {
        isInitialLoad.current = false;
      }
    } catch (err) {
      console.error("Error fetching contract data:", err);
      if (mounted.current) {
        setError("Failed to fetch contract data");
      }
    } finally {
      if (mounted.current && isInitialFetch) {
        setLoading(false);
      }
    }
  }, [provider, account, CONTRACT_ADDRESS]);

  const fetchWithdrawalEvents = useCallback(async () => {
    if (!provider || !account) return;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      const filter = contract.filters.WithdrawalMade(account);
      const events = await contract.queryFilter(filter);

      const withdrawals = await Promise.all(
        events.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          // This is the net amount (after commission)
          const netAmount = ethers.formatEther(event.args.amount || "0");
          return {
            netAmount,
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            transactionHash: event.transactionHash,
          };
        })
      );

      // Calculate total net withdrawn
      const totalNetWithdrawn = withdrawals.reduce(
        (acc, w) => acc + parseFloat(w.netAmount),
        0
      );

      console.log('Withdrawal totals:', {
        totalNetWithdrawn,
        withdrawalsCount: withdrawals.length
      });

      setData((prevData) => ({
        ...prevData,
        withdrawalHistory: withdrawals,
        totalWithdrawn: totalNetWithdrawn, // This is net amount
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