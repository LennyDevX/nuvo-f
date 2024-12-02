// src/components/layout/DashboardStaking/DashboardStaking.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import ABI from "../../../Abi/StakingContract.json";
import { WalletContext } from "../../context/WalletContext";
import DashboardCards from "./DashboardCards";
import ActionButtons from "./ActionButtons";
import NetworkTag from "./Tag";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutos
const cache = {};

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || "";
const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";

const RPC_URLS = [
  ALCHEMY_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : "",
  "https://rpc.ankr.com/polygon",
  "https://polygon-rpc.com",
];

let provider;

const getProvider = async () => {
  if (provider) return provider;

  // Try Alchemy first if API key exists
  if (ALCHEMY_KEY) {
    try {
      const alchemyProvider = new ethers.providers.JsonRpcProvider(RPC_URLS[0]);
      await alchemyProvider.getBlockNumber();
      provider = alchemyProvider;
      return provider;
    } catch (error) {
      console.warn("Failed to connect to Alchemy:", error);
    }
  }

  // Try fallback RPCs
  for (let i = 1; i < RPC_URLS.length; i++) {
    try {
      const fallbackProvider = new ethers.providers.JsonRpcProvider(RPC_URLS[i]);
      await fallbackProvider.getBlockNumber();
      provider = fallbackProvider;
      return provider;
    } catch (error) {
      console.warn(`Error connecting to ${RPC_URLS[i]}:`, error);
    }
  }

  throw new Error("All RPC connections failed");
};

function DashboardStaking() {
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
  const [tradingBotProfit, setTradingBotProfit] = useState(0);
  const [lastTradingUpdate, setLastTradingUpdate] = useState(null);

  const MARKET_HOURS = {
    START: 9, // 9 AM
    END: 17, // 5 PM
    HIGH_VOLATILITY: [10, 15], // High volatility hours
    LOW_VOLATILITY: [12, 14], // Low volatility hours (lunch time)
  };

  const isMarketHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= MARKET_HOURS.START && hour <= MARKET_HOURS.END;
  };

  const getTradingIcon = (profit) => {
    if (profit > 3) return "🚀";
    if (profit > 0) return "📈";
    if (profit < -3) return "📉";
    return "💹";
  };

  const TRADING_CONFIG = {
    BASE_CHANGE: 2, // Base percentage change
    MAX_VOLATILITY: 3, // Maximum additional volatility
    MARKET_MULTIPLIER: 1.5, // Market hours multiplier
    OFF_HOURS_MULTIPLIER: 0.8, // Non-market hours multiplier
    UPDATE_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
    TREND_DURATION: 4, // Hours before trend changes
  };

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
      fetchWithdrawalEvents();
    }
  }, [account]);

  useEffect(() => {
    calculateROIProgress();
  }, [depositAmount, totalWithdrawn]);

  useEffect(() => {
    const updateTradingBot = () => {
      simulateTradingBot();
    };

    // Initial update
    updateTradingBot();

    // Set interval for updates
    const interval = setInterval(updateTradingBot, TRADING_CONFIG.UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Update fetchWithdrawalEvents to include better error handling
  const fetchWithdrawalEvents = async () => {
    try {
      console.log("Fetching withdrawal events for account:", account);

      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      const filter = contract.filters.WithdrawalMade(account);
      const events = await contract.queryFilter(filter);

      console.log("Raw withdrawal events:", events);

      const withdrawals = await Promise.all(
        events.map(async (event) => {
          try {
            const block = await provider.getBlock(event.blockNumber);
            const amount = ethers.utils.formatEther(event.args.amount);

            return {
              amount: parseFloat(amount).toString(), // Ensure string format
              timestamp: new Date(block.timestamp * 1000).toISOString(),
              transactionHash: event.transactionHash,
            };
          } catch (error) {
            console.warn("Error processing withdrawal event:", error);
            return null;
          }
        })
      );

      // Filter out null values and invalid amounts
      const validWithdrawals = withdrawals.filter((w) => w && !isNaN(parseFloat(w.amount)));

      console.log("Processed withdrawals:", validWithdrawals);

      const total = validWithdrawals.reduce((acc, w) => acc + parseFloat(w.amount), 0);
      console.log("Calculated total withdrawn:", total);

      setWithdrawalHistory(validWithdrawals);
      setTotalWithdrawn(total);

      // Update localStorage with validated data
      localStorage.setItem(`withdrawals_${account}`, JSON.stringify(validWithdrawals));
      localStorage.setItem(`totalWithdrawn_${account}`, total.toString());
    } catch (error) {
      console.error("Error in fetchWithdrawalEvents:", error);
      throw error;
    }
  };

  const loadWithdrawalHistory = async () => {
    try {
      // Add debug logging
      console.log("Loading withdrawal history for account:", account);

      const storedWithdrawals = JSON.parse(localStorage.getItem(`withdrawals_${account}`)) || [];
      console.log("Stored withdrawals:", storedWithdrawals);

      // Ensure numbers and handle NaN
      const total = storedWithdrawals.reduce((acc, w) => {
        const amount = parseFloat(w.amount) || 0;
        return acc + amount;
      }, 0);

      console.log("Calculated total:", total);

      setWithdrawalHistory(storedWithdrawals);
      setTotalWithdrawn(total);

      // Store the validated total
      localStorage.setItem(`totalWithdrawn_${account}`, total.toString());
    } catch (error) {
      console.error("Error loading withdrawal history:", error);
      setError("Error loading withdrawal history");
      // Fallback to 0 if error
      setWithdrawalHistory([]);
      setTotalWithdrawn(0);
    }
  };

  const simulateTradingBot = () => {
    const now = new Date();
    const hour = now.getHours();

    // Market conditions
    const marketOpen = isMarketHours();
    const isHighVolatility =
      hour >= MARKET_HOURS.HIGH_VOLATILITY[0] && hour <= MARKET_HOURS.HIGH_VOLATILITY[1];
    const isLowVolatility =
      hour >= MARKET_HOURS.LOW_VOLATILITY[0] && hour <= MARKET_HOURS.LOW_VOLATILITY[1];

    // Base volatility calculation
    let volatility = TRADING_CONFIG.BASE_CHANGE;

    // Adjust volatility based on market conditions
    if (marketOpen) {
      volatility *= TRADING_CONFIG.MARKET_MULTIPLIER;
      if (isHighVolatility) volatility *= 1.5;
      if (isLowVolatility) volatility *= 0.5;
    } else {
      volatility *= TRADING_CONFIG.OFF_HOURS_MULTIPLIER;
    }

    // Add random factor with trend consideration
    const trend = Math.sin(Date.now() / (TRADING_CONFIG.TREND_DURATION * 3600000)) * 0.5;
    const randomFactor = (Math.random() * 2 - 1 + trend) * TRADING_CONFIG.MAX_VOLATILITY;

    // Calculate final change
    const change = (volatility + randomFactor) * (marketOpen ? 1 : 0.8);
    const finalChange = Math.round(change * 100) / 100;

    // Additional market data
    const volume = Math.floor(Math.random() * 100000) + 50000;
    const trades = Math.floor(Math.random() * 500) + 100;

    const timestamp = new Date().toISOString();
    const marketData = {
      change: finalChange,
      volume,
      trades,
      timestamp,
      isMarketHours: marketOpen,
      trend: trend > 0 ? "bullish" : "bearish",
    };

    setTradingBotProfit(finalChange);
    setLastTradingUpdate(timestamp);

    // Store enhanced data
    localStorage.setItem("tradingBotData", JSON.stringify(marketData));
  };

  const calculateROIProgress = () => {
    try {
      const depositValue = Number(depositAmount);
      const withdrawnValue = Number(totalWithdrawn);

      console.log("Calculating ROI with:", {
        depositValue,
        withdrawnValue,
        depositType: typeof depositAmount,
        withdrawnType: typeof totalWithdrawn,
      });

      if (depositValue > 0 && withdrawnValue >= 0) {
        const maxPossibleReward = depositValue * 1.3;
        const currentProgress = (withdrawnValue / maxPossibleReward) * 100;
        const finalRoi = Math.min(currentProgress, 130);

        console.log("ROI calculation:", {
          maxPossibleReward,
          currentProgress,
          finalRoi,
        });

        setRoiProgress(finalRoi);
      } else {
        console.log("Setting ROI to 0 - invalid values");
        setRoiProgress(0);
      }
    } catch (err) {
      console.error("Error calculating ROI:", err);
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

        // Fetch rewards first
        const rewards = await contract.calculateRewards(account);

        // Then fetch other data
        const [poolBalance, deposit, deposits] = await Promise.all([
          contract.getContractBalance(),
          contract.getTotalDeposit(account),
          contract.getUserDeposits(account),
        ]);

        // Format rewards properly
        const formattedRewards = ethers.utils.formatEther(rewards || "0");

        return {
          poolBalance,
          deposit,
          deposits,
          rewards,
          formattedRewards,
        };
      };

      const data = await getCachedData(cacheKey, getData);

      // Actualizar estados asegurando formato consistente
      setTotalPoolBalance(ethers.utils.formatEther(data.poolBalance));
      setDepositAmount(ethers.utils.formatEther(data.deposit));
      setAvailableRewards(data.formattedRewards); // Usar el valor formateado

      if (data.deposits.length > 0) {
        setFirstDepositTime(data.deposits[0].timestamp.toNumber());
      }

      // Actualizar caché
      cache[`rewards_${account}`] = {
        data: data.formattedRewards,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setError(error.reason || "Error fetching data");

      // Usar caché si está disponible
      const cachedRewards = cache[`rewards_${account}`];
      if (cachedRewards && Date.now() - cachedRewards.timestamp < CACHE_DURATION) {
        setAvailableRewards(cachedRewards.data);
      }
    } finally {
      setLoading(false);
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
      return `${hoursElapsed} hours since last withdrawal`;
    }

    return "No withdrawals yet";
  };

  return (
    <div className="min-h-screen pt-4 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full pt-16 pb-6 md:pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-400 bg-purple-400/10 rounded-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your Staking Dashboard
            </motion.span>

            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight px-2"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Manage Your{" "}
              <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-500">
                Smart Staking
              </span>
            </motion.h1>
          </motion.div>

          {isConnected && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                {
                  label: "Total Staked",
                  value: `${parseFloat(depositAmount).toFixed(2)} POL`,
                  icon: "📈",
                  subtext: (
                    <div className="space-y-1">
                      <span className="block">
                        {lastTradingUpdate
                          ? `Updated: ${new Date(lastTradingUpdate).toLocaleTimeString()}`
                          : "Updating..."}
                      </span>
                      <span
                        className={`text-xs block ${
                          isMarketHours() ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {isMarketHours() ? "🟢 Market Open" : "⚪ After Hours"}
                      </span>
                    </div>
                  ),
                },
                {
                  label: "Available Rewards",
                  value: `${parseFloat(availableRewards).toFixed(6)} POL`,
                  icon: "🎁",
                },
                {
                  label: "Trading Bot Performance",
                  value: `${
                    parseFloat(tradingBotProfit) > 0 ? "+" : ""
                  }${parseFloat(tradingBotProfit).toFixed(2)}%`,
                  icon: getTradingIcon(tradingBotProfit),
                  className: `${
                    parseFloat(tradingBotProfit) >= 0 ? "text-green-400" : "text-red-400"
                  } ${Math.abs(tradingBotProfit) > 5 ? "animate-pulse" : ""}`,
                  subtext: (
                    <div className="space-y-1">
                      <p>
                        {lastTradingUpdate
                          ? `Updated: ${new Date(lastTradingUpdate).toLocaleTimeString()}`
                          : "Updating..."}
                      </p>
                      <p
                        className={`text-xs ${
                          isMarketHours() ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {isMarketHours() ? "🟢 Market Open" : "⚪ After Hours"}
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Pool Balance",
                  value: `${parseFloat(totalPoolBalance).toFixed(2)} POL`,
                  icon: "🏦",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-sm text-purple-400">{stat.label}</span>
                  </div>
                  <p className={`text-xl font-bold mt-2 ${stat.className || "text-white"}`}>
                    {stat.value}
                  </p>
                  {stat.subtext && <div className="text-xs text-gray-400 mt-1">{stat.subtext}</div>}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Main Dashboard Content */}
          <motion.div
            className="rounded-2xl p-4 md:p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {isConnected ? (
              <div className="space-y-6">
                <DashboardCards
                  depositAmount={depositAmount}
                  roiProgress={roiProgress}
                  totalWithdrawn={totalWithdrawn}
                  availableRewards={availableRewards}
                  totalPoolBalance={totalPoolBalance}
                  getStakingDuration={getStakingDuration}
                />
                <ActionButtons
                  availableRewards={availableRewards}
                  fetchContractData={fetchContractData}
                  handleWithdrawalSuccess={handleWithdrawalSuccess}
                />
                <NetworkTag network={network} />
              </div>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-lg text-white mb-4 px-4">
                  Connect your wallet to view the dashboard information
                </p>
                <motion.div
                  className="text-gray-400 text-6xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <i className="fas fa-wallet"></i>
                </motion.div>
              </motion.div>
            )}

            {/* Enhanced Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/20 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 text-2xl">⚠️</span>
                    <p className="text-red-100 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-black/80 rounded-2xl p-6 border border-purple-500/20"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      <p className="text-purple-400 text-base">Loading data...</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
}

export default DashboardStaking;