// src/hooks/useContractData.js
import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import useProvider from "./useProvider";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hora

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

  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || "";

  const fetchContractData = useCallback(async () => {
    if (!provider || !account) return;

    const now = Date.now();
    const cacheKey = `contractData_${account}`;

    if (
      cache.current[cacheKey] &&
      now - cache.current[cacheKey].timestamp < CACHE_DURATION
    ) {
      setData((prevData) => ({ ...prevData, ...cache.current[cacheKey].data }));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);

      const [rewards, poolBalance, deposit, deposits] = await Promise.all([
        contract.calculateRewards(account).catch(() => ethers.parseEther("0")),
        contract.getContractBalance().catch(() => ethers.parseEther("0")),
        contract.getTotalDeposit(account).catch(() => ethers.parseEther("0")),
        contract.getUserDeposits(account).catch(() => []),
      ]);

      const newData = {
        depositAmount: ethers.formatEther(deposit || "0"),
        availableRewards: ethers.formatEther(rewards || "0"),
        totalPoolBalance: ethers.formatEther(poolBalance || "0"),
        firstDepositTime: deposits?.[0]?.timestamp 
          ? Number(deposits[0].timestamp)
          : null,
      };

      setData((prevData) => ({ ...prevData, ...newData }));
      cache.current[cacheKey] = { data: newData, timestamp: now };
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setError("Error al obtener datos del contrato");
    } finally {
      setLoading(false);
    }
  }, [provider, account]);

  const fetchWithdrawalEvents = useCallback(async () => {
    if (!provider || !account) return;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      const filter = contract.filters.WithdrawalMade(account);
      const events = await contract.queryFilter(filter);

      const withdrawals = await Promise.all(
        events.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          const amount = ethers.formatEther(event.args.amount || "0");
          return {
            amount: amount,
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            transactionHash: event.transactionHash,
          };
        })
      );

      const total = withdrawals.reduce(
        (acc, w) => acc + parseFloat(w.amount),
        0
      );

      setData((prevData) => ({
        ...prevData,
        withdrawalHistory: withdrawals,
        totalWithdrawn: total,
      }));

      localStorage.setItem(
        `withdrawals_${account}`,
        JSON.stringify(withdrawals)
      );
      localStorage.setItem(`totalWithdrawn_${account}`, total.toString());
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

  useEffect(() => {
    if (account && provider) {
      fetchWithdrawalEvents();
      fetchContractData();

      intervalRef.current = setInterval(() => {
        fetchContractData();
      }, UPDATE_INTERVAL);

      return () => {
        clearInterval(intervalRef.current);
      };
    }
  }, [account, provider, fetchContractData, fetchWithdrawalEvents]);

  return {
    ...data,
    loading,
    error,
    fetchContractData,
    handleWithdrawalSuccess,
    handleDepositSuccess,
  };
};

export default useContractData;