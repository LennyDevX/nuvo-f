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

    // Usar datos en caché si son válidos
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
        contract.calculateRewards(account).catch(() => ethers.BigNumber.from(0)),
        contract.getContractBalance().catch(() => ethers.BigNumber.from(0)),
        contract.getTotalDeposit(account).catch(() => ethers.BigNumber.from(0)),
        contract.getUserDeposits(account).catch(() => []),
      ]);

      const newData = {
        depositAmount: ethers.utils.formatEther(deposit),
        availableRewards: ethers.utils.formatEther(rewards),
        totalPoolBalance: ethers.utils.formatEther(poolBalance),
        firstDepositTime: deposits[0]
          ? deposits[0].timestamp.toNumber()
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
          const amount = ethers.utils.formatEther(event.args.amount);
          return {
            amount: parseFloat(amount).toString(),
            timestamp: new Date(block.timestamp * 1000).toISOString(),
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

  const handleWithdrawalSuccess = useCallback(
    (amount) => {
      const netAmount = parseFloat(amount);
      if (isNaN(netAmount) || netAmount <= 0) return;

      const timestamp = new Date().toISOString();
      const newWithdrawal = {
        amount: netAmount.toString(),
        timestamp,
        transactionHash: "", // Agrega el hash si está disponible
      };

      setData((prevData) => {
        const updatedHistory = [...prevData.withdrawalHistory, newWithdrawal];
        const newTotalWithdrawn = prevData.totalWithdrawn + netAmount;

        localStorage.setItem(
          `withdrawals_${account}`,
          JSON.stringify(updatedHistory)
        );
        localStorage.setItem(
          `totalWithdrawn_${account}`,
          newTotalWithdrawn.toString()
        );
        localStorage.setItem(`lastWithdrawal_${account}`, timestamp);

        return {
          ...prevData,
          availableRewards: 0,
          withdrawalHistory: updatedHistory,
          totalWithdrawn: newTotalWithdrawn,
        };
      });

      // Actualiza los datos del contrato después de un retiro
      fetchContractData();
    },
    [account, fetchContractData]
  );

  useEffect(() => {
    if (account && provider) {
      fetchWithdrawalEvents();
      fetchContractData();

      // Configura el intervalo de actualización
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
  };
};

export default useContractData;