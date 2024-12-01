// InfoAccount.jsx
import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import ABI from "../../Abi/StakingContract.json";
import { WalletContext } from "../context/WalletContext";
import ButtonDeposit from "../web3/ButtonDeposit";
import ButtonWithdraw from "../web3/ButtonWithdraw";
import PolygonLogo from "/PolygonLogo.png";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutos
const cache = {};

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
const RPC_URLS = [
  "https://polygon-mainnet.g.alchemy.com/v2/Oyk0XqXD7K2HQO4bkbDm1w8iZQ6fHulV",
  "https://rpc.ankr.com/polygon",
  "https://polygon-rpc.com",
];

let provider;

const getProvider = async () => {
  if (provider) return provider;
  for (const url of RPC_URLS) {
    try {
      const newProvider = new ethers.providers.JsonRpcProvider(url);
      await newProvider.getBlockNumber();
      provider = newProvider;
      return provider;
    } catch (error) {
      console.warn(`Error connecting to ${url}:`, error);
    }
  }
  throw new Error("All RPC connections failed");
};

function InfoAccount() {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [error, setError] = useState(null);
  const [firstDepositTime, setFirstDepositTime] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPoolBalance, setTotalPoolBalance] = useState(0);
  const [roiProgress, setRoiProgress] = useState(0);

  useEffect(() => {
    setIsConnected(account && network && balance !== null);
  }, [account, network, balance]);

  useEffect(() => {
    if (isConnected) {
      fetchContractData(true);
      const interval = setInterval(() => fetchContractData(true), UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  useEffect(() => {
    if (account) {
      loadWithdrawalHistory();
    }
  }, [account]);

  useEffect(() => {
    calculateROIProgress();
  }, [depositAmount, totalWithdrawn]);

  const loadWithdrawalHistory = async () => {
    try {
      await fetchWithdrawalEvents();
    } catch (error) {
      console.error("Error loading withdrawal history:", error);
      // Fallback to local storage if fetching events fails
      const storedWithdrawals = JSON.parse(localStorage.getItem(`withdrawals_${account}`)) || [];
      const total = storedWithdrawals.reduce((acc, w) => acc + parseFloat(w.amount), 0);
      setWithdrawalHistory(storedWithdrawals);
      setTotalWithdrawn(total);
    }
  };

  const calculateROIProgress = () => {
    if (depositAmount > 0 && totalWithdrawn >= 0) {
      const maxReward = parseFloat(depositAmount) * 1.3;
      const roi = (totalWithdrawn / maxReward) * 100;
      setRoiProgress(Math.min(roi, 130));
    } else {
      setRoiProgress(0);
    }
  };

  const getCachedData = async (key, fetchFn) => {
    const now = Date.now();
    if (cache[key] && now - cache[key].timestamp < CACHE_DURATION) {
      return cache[key].data;
    }
    const data = await fetchFn();
    cache[key] = { data, timestamp: now };
    return data;
  };

  const fetchContractData = async (forceFresh = false) => {
    try {
      setLoading(true);
      const cacheKey = `contractData_${account}`;
      if (forceFresh) {
        delete cache[cacheKey];
      }

      const getData = async () => {
        const provider = await getProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        const [poolBalance, deposit, deposits, rewards] = await Promise.all([
          contract.getContractBalance(),
          contract.getTotalDeposit(account),
          contract.getUserDeposits(account),
          contract.calculateRewards(account),
        ]);
        return { poolBalance, deposit, deposits, rewards };
      };

      const data = await getCachedData(cacheKey, getData);
      setTotalPoolBalance(ethers.utils.formatEther(data.poolBalance));
      setDepositAmount(ethers.utils.formatEther(data.deposit));
      setAvailableRewards(ethers.utils.formatEther(data.rewards));

      if (data.deposits.length > 0) {
        setFirstDepositTime(data.deposits[0].timestamp.toNumber());
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.reason || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

    const fetchWithdrawalEvents = async () => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      const filter = contract.filters.WithdrawalMade(account);
      const events = await contract.queryFilter(filter, 0, "latest");
  
      const newWithdrawals = await Promise.all(
        events.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          return {
            amount: parseFloat(ethers.utils.formatEther(event.args.amount)),
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            transactionHash: event.transactionHash,
          };
        })
      );
  
      const total = newWithdrawals.reduce((acc, w) => acc + w.amount, 0);
  
      setWithdrawalHistory(newWithdrawals);
      setTotalWithdrawn(total);
  
      localStorage.setItem(`withdrawals_${account}`, JSON.stringify(newWithdrawals));
      localStorage.setItem(`totalWithdrawn_${account}`, total.toString());
    } catch (error) {
      console.error("Error fetching withdrawal events:", error);
      setError("Error fetching withdrawal events");
    }
  };

  const handleWithdrawalSuccess = async (amount) => {
    try {
      const netAmount = parseFloat(amount);
      const timestamp = new Date().toISOString();

      const newWithdrawal = {
        amount: netAmount,
        timestamp,
        transactionHash: "",
      };

      const updatedHistory = [...withdrawalHistory, newWithdrawal];
      const newTotal = totalWithdrawn + netAmount;

      Object.keys(cache).forEach((key) => delete cache[key]);

      setWithdrawalHistory(updatedHistory);
      setTotalWithdrawn(newTotal);
      setAvailableRewards(0);

      localStorage.setItem(`withdrawals_${account}`, JSON.stringify(updatedHistory));
      localStorage.setItem(`totalWithdrawn_${account}`, newTotal.toString());
      localStorage.setItem(`lastWithdrawal_${account}`, timestamp);

      calculateROIProgress();

      await fetchContractData(true);
    } catch (err) {
      console.error("Withdrawal update error:", err);
      setError("Error updating withdrawal information");
    }
  };

  const getStakingDuration = () => {
    const now = new Date();
    const lastWithdrawalTime = localStorage.getItem(`lastWithdrawal_${account}`);

    if (lastWithdrawalTime) {
      const lastWithdrawal = new Date(lastWithdrawalTime);
      const hoursElapsed = Math.floor((now - lastWithdrawal) / (1000 * 60 * 60));
      return `${hoursElapsed} hours since last withdrawal`;
    }

    if (firstDepositTime) {
      const depositDate = new Date(firstDepositTime * 1000);
      const hoursElapsed = Math.floor((now - depositDate) / (1000 * 60 * 60));
      return `${hoursElapsed} hours since first deposit`;
    }

    return "No withdrawals yet";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full pt-20 pb-6 md:pt-24"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-white drop-shadow-lg"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Staking Dashboard ✨
          </motion.h1>

          {isConnected ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Staked and ROI Card */}
                <motion.div
                  className="rounded-xl p-6 bg-black/20 backdrop-blur-sm border border-purple-500/20"
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
                >
                  <p className="space-y-2">
                    <strong className="text-purple-400 text-lg">Total Staked</strong>
                    <span className="block text-2xl text-white mt-2">
                      {parseFloat(depositAmount).toFixed(6)}
                      <img src={PolygonLogo} alt="Polygon" className="h-4 w-4 inline ml-2" />
                    </span>
                  </p>
                  <div className="space-y-4 mt-4">
                    <div>
                      <strong className="text-purple-400 text-lg">ROI Progress</strong>
                      <span className="block text-2xl text-white mt-2">
                        {roiProgress.toFixed(2)}%
                        <span className="text-sm text-gray-400 ml-2">of 130% Max ROI</span>
                      </span>
                    </div>
                    <div>
                      <strong className="text-purple-400 text-lg">Base APR</strong>
                      <span className="block text-2xl text-white mt-2">
                        30% <span className="text-sm text-gray-400">yearly</span>
                      </span>
                    </div>
                    <div>
                      <strong className="text-purple-400 text-lg">Daily Returns</strong>
                      <span className="block text-2xl text-white mt-2">
                        {((30 / 365) * parseFloat(depositAmount)).toFixed(6)}
                        <img src={PolygonLogo} alt="Polygon" className="h-4 w-4 inline ml-2" />
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Rewards Card */}
                <motion.div
                  className="rounded-xl m-2 p-6 bg-black/20 backdrop-blur-sm border border-purple-500/20"
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
                >
                  <p className="space-y-2">
                    <strong className="text-purple-400 text-lg">Total Withdrawn</strong>
                    <span className="block text-2xl text-white mt-2">
                      {parseFloat(totalWithdrawn).toFixed(6)}
                      <img src={PolygonLogo} alt="Polygon" className="h-4 w-4 inline ml-2" />
                    </span>
                  </p>
                  <p className="space-y-2">
                    <strong className="text-purple-400 text-lg">Available Rewards</strong>
                    <span className="block text-2xl text-white mt-2">
                      {parseFloat(availableRewards).toFixed(6)}
                      <img src={PolygonLogo} alt="Polygon" className="h-4 w-4 inline ml-2" />
                    </span>
                  </p>
                  <p className="space-y-2">
                    <strong className="text-purple-400 text-lg">Total Pool Balance</strong>
                    <span className="block text-2xl text-white mt-2">
                      {parseFloat(totalPoolBalance).toFixed(6)}
                      <img src={PolygonLogo} alt="Polygon" className="h-4 w-4 inline ml-2" />
                    </span>
                  </p>
                  <p className="space-y-2">
                    <strong className="text-purple-400 text-lg">Staking Duration</strong>
                    <span className="block text-2xl text-white mt-2">{getStakingDuration()}</span>
                  </p>
                </motion.div>

                {/* Bonus Opportunities Card */}
                <motion.div
                  className="rounded-xl p-6 bg-black/20 backdrop-blur-sm border border-purple-500/20"
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
                >
                  <div className="mt-4">
                    <strong className="text-purple-400 text-lg">Extra Bonus Opportunities</strong>
                    <ul className="space-y-2 mt-2 text-white">
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">•</span>
                        Hold 1000+ tokens: +2% APR bonus
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">•</span>
                        Refer friends: +1% per referral (max 5%)
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">•</span>
                        Community participation: +3% monthly bonus
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-400 mr-2">•</span>
                        Long-term staking: +1% every 90 days
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ButtonDeposit onSuccess={() => fetchContractData(true)} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ButtonWithdraw
                    disabled={!parseFloat(availableRewards)}
                    onSuccess={handleWithdrawalSuccess}
                  />
                </motion.div>
              </div>

              {/* Network Tag */}
              <div className="text-center mt-6">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-300 border border-gray-600">
                  Network: <span className="text-purple-400">{network}</span>
                </span>
              </div>
            </div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl text-white mb-4">
                Connect your wallet to view the dashboard information
              </p>
              <span className="text-gray-400 text-5xl">
                <i className="fas fa-wallet"></i>
              </span>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="mt-4 p-4 rounded-lg bg-red-500/20 text-red-100 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {loading && (
            <div className="text-center mt-4">
              <span className="text-purple-400">
                <i className="fas fa-spinner fa-spin fa-2x"></i>
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default InfoAccount;