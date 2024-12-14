// src/components/layout/DashboardStaking/DashboardStaking.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletContext } from "../../context/WalletContext";
import useContractData from "../../hooks/useContractData";
import useTreasuryBalance from "../../hooks/useTreasuryBalance";
import { calculateROIProgress, getStakingDuration } from "../../utils/utils";
import DashboardCards from "./DashboardCards";
import ActionButtons from "./ActionButtons";
import NetworkTag from "./Tag";
import QuickStats from "./QuickStats";
import ErrorMessage from "../../LoadOverlay/ErrorMessage";
import LoadingOverlay from "../../LoadOverlay/LoadingOverlay";

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
    handleDepositSuccess,
  } = useContractData(account);

  const { treasuryBalance, lastUpdate } = useTreasuryBalance();

  // Effect for connection
  useEffect(() => {
    setIsConnected(account && network && balance !== null);
  }, [account, network, balance]);

  // Effect to fetch data
  useEffect(() => {
    if (isConnected) {
      fetchContractData(true);
      const interval = setInterval(() => {
        if (!loading) {
          fetchContractData(false);
        }
      }, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchContractData, loading]);

  // Effect to calculate ROI
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
        <div className="max-w-7xl mx-auto px-4 sm:px- lg:px-8">
          {/* Header */}
          <motion.div className="text-center mt-4">
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
                  className: "text-green-400",
                },
                {
                  label: "Available Rewards",
                  value: `${parseFloat(availableRewards).toFixed(6)} POL`,
                  icon: "🎁",
                },
                {
                  label: "Treasury Balance",
                  value: `${parseFloat(treasuryBalance).toFixed(4)} POL`,
                  icon: "🏦",
                  className: "text-blue-400",
                  subtext: lastUpdate
                    ? `Updated: ${new Date(lastUpdate).toLocaleTimeString()}`
                    : "Updating...",
                },
                {
                  label: "Pool Balance",
                  value: `${parseFloat(totalPoolBalance).toFixed(2)} POL`,
                  icon: "💰",
                },
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
                  getStakingDuration={() =>
                    getStakingDuration(
                      firstDepositTime,
                      localStorage.getItem(`lastWithdrawal_${account}`)
                    )
                  }
                />
                <ActionButtons
                  availableRewards={availableRewards}
                  fetchContractData={fetchContractData}
                  handleWithdrawalSuccess={handleWithdrawalSuccess}
                  handleDepositSuccess={handleDepositSuccess}

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