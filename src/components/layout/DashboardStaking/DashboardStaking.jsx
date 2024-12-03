// src/components/layout/DashboardStaking/DashboardStaking.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletContext } from "../../context/WalletContext";
import useContractData from "../../hooks/useContractData";
import { calculateROIProgress, getStakingDuration } from "../../utils/utils";
import DashboardCards from "./DashboardCards";
import ActionButtons from "./ActionButtons";
import NetworkTag from "./Tag";
import QuickStats from "./QuickStats";
import ErrorMessage from "../../LoadOverlay/ErrorMessage";
import LoadingOverlay from "../../LoadOverlay/LoadingOverlay";
import useTradingSimulator from "./TradingSimulator";

const UPDATE_INTERVAL = 5 * 60 * 1000; // 2 minutos

function DashboardStaking() {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [roiProgress, setRoiProgress] = useState(0);

  // Custom hooks
  const {
    depositAmount,
    availableRewards,
    totalPoolBalance,
    firstDepositTime,
    totalWithdrawn,
    loading,
    error,
    fetchContractData,
    handleWithdrawalSuccess,
  } = useContractData(account);

  const {
    tradingBotProfit,
    lastTradingUpdate,
    getTradingIcon,
    isMarketHours,
  } = useTradingSimulator();

  // Effect para conexión
  useEffect(() => {
    setIsConnected(account && network && balance !== null);
  }, [account, network, balance]);

  // Effect para fetch de datos
  useEffect(() => {
    if (isConnected) {
      fetchContractData(true);
      const interval = setInterval(() => {
        if (!loading) {  // Only fetch if not currently loading
          fetchContractData(false);  // Use cache when possible
        }
      }, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchContractData, loading]);

  // Effect para calcular ROI
  useEffect(() => {
    const roi = calculateROIProgress(depositAmount, totalWithdrawn);
    setRoiProgress(roi);
  }, [depositAmount, totalWithdrawn]);

  return (
    <div className="min-h-screen pt-4 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full pt-16 pb-6 md:pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div className="text-center mb-8">
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

          {/* Quick Stats */}
          {isConnected && (
            <QuickStats
              stats={[
                {
                  label: "Total Staked",
                  value: `${parseFloat(depositAmount).toFixed(2)} POL`,
                  icon: "📈",
                  subtext: lastTradingUpdate ? (
                    <div className="space-y-1">
                      <span className="block">
                        {`Updated: ${new Date(lastTradingUpdate).toLocaleTimeString()}`}
                      </span>
                      <span className={`text-xs block ${isMarketHours() ? "text-green-400" : "text-gray-400"}`}>
                        {isMarketHours() ? "🟢 Market Open" : "⚪ After Hours"}
                      </span>
                    </div>
                  ) : "Updating..."
                },
                {
                  label: "Available Rewards",
                  value: `${parseFloat(availableRewards).toFixed(6)} POL`,
                  icon: "🎁"
                },
                {
                  label: "Trading Bot Performance",
                  value: `${parseFloat(tradingBotProfit) > 0 ? "+" : ""}${parseFloat(tradingBotProfit).toFixed(2)}%`,
                  icon: getTradingIcon(tradingBotProfit),
                  className: `${parseFloat(tradingBotProfit) >= 0 ? "text-green-400" : "text-red-400"} 
                    ${Math.abs(tradingBotProfit) > 5 ? "animate-pulse" : ""}`,
                  subtext: (
                    <div className="space-y-1">
                      <p>{lastTradingUpdate ? 
                        `Updated: ${new Date(lastTradingUpdate).toLocaleTimeString()}` : 
                        "Updating..."}</p>
                      <p className={`text-xs ${isMarketHours() ? "text-green-400" : "text-gray-400"}`}>
                        {isMarketHours() ? "🟢 Market Open" : "🔴 Market Closed"}
                      </p>
                    </div>
                  )
                },
                {
                  label: "Pool Balance",
                  value: `${parseFloat(totalPoolBalance).toFixed(2)} POL`,
                  icon: "🏦"
                }
              ]}
            />
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
                  getStakingDuration={() => getStakingDuration(firstDepositTime, localStorage.getItem(`lastWithdrawal_${account}`))}
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

            {/* Error Messages */}
            <AnimatePresence>
              {error && <ErrorMessage error={error} />}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
              {loading && <LoadingOverlay />}
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