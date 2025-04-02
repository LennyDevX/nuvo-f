import React, { useEffect, useState, useContext, useRef } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { WalletContext } from "../../../context/WalletContext";
import useContractData from "../../../hooks/useContractData";
import useTreasuryBalance from "../../../hooks/useTreasuryBalance";
import DashboardCards from "./card/DashboardCards";
import NetworkBadge from "../../web3/NetworkBadge";
import ErrorMessage from "../../LoadOverlay/ErrorMessage";
import { ethers } from "ethers";
import { formatBalance } from "../../../utils/formatters"; 
import { FaCoins } from 'react-icons/fa';
import { calculateROIProgress } from '../../../utils/RoiCalculations';
import LoadingSpinner from "../../LoadOverlay/LoadingSpinner";

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

const DashboardStaking = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [roiProgress, setRoiProgress] = useState(0);

  // Add reference for last rewards fetch
  const lastRewardsFetch = useRef(0);
  const REWARDS_UPDATE_INTERVAL = 30000; // 30 seconds

  // Custom hooks
  const {
    depositAmount,
    availableRewards,
    totalPoolBalance,
    firstDepositTime,
    totalWithdrawn,
    loading,
    error,
    isInitialLoad,
    fetchContractData,
    handleDepositSuccess,
  } = useContractData(account);

  const { balance: treasuryBalance } = useTreasuryBalance(TREASURY_ADDRESS);

  // Ensure values are not undefined before passing
  const safeDepositAmount = depositAmount || '0';
  const safeTotalWithdrawn = totalWithdrawn || '0';

  // Effect for connection
  useEffect(() => {
    setIsConnected(account && network && balance !== null);
  }, [account, network, balance]);

  // Modified effect to include rewards fetching
  useEffect(() => {
    if (isConnected) {
      const fetchDataAndRewards = async () => {
        try {
          await fetchContractData(true);
          
          // Ensure rewards are being included in the fetch
          const now = Date.now();
          if (now - lastRewardsFetch.current >= REWARDS_UPDATE_INTERVAL) {
            lastRewardsFetch.current = now;
            // Force rewards update
            await fetchContractData(false, true);
          }
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };

      fetchDataAndRewards();

      const interval = setInterval(fetchDataAndRewards, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchContractData]);

  // Effect to calculate ROI - simplified
  useEffect(() => {
    if (safeDepositAmount) {
      const roi = calculateROIProgress(safeDepositAmount, safeTotalWithdrawn);
      setRoiProgress(roi);
    }
  }, [safeDepositAmount, safeTotalWithdrawn]);

  // Verify and validate treasury address
  useEffect(() => {
    if (!TREASURY_ADDRESS) {
      console.error('Treasury address is not configured in environment variables');
    } else {
      try {
        const isValid = ethers.isAddress(TREASURY_ADDRESS);
        console.log('Treasury address validation:', {
          address: TREASURY_ADDRESS,
          isValid
        });
      } catch (err) {
        console.error('Error validating treasury address:', err);
      }
    }
  }, []);

  // Development-only logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug("Dashboard State:", {
        depositAmount: safeDepositAmount,
        totalWithdrawn: safeTotalWithdrawn,
        treasuryBalance,
        roiProgress
      });
    }
  }, [safeDepositAmount, safeTotalWithdrawn, treasuryBalance, roiProgress]);

  // Letter-by-letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.10,
        duration: 0.2,
        ease: "easeIn"
      }
    })
  };

  // Container animation for title
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-nuvo-gradient min-h-screen pt-24 pb-16 flex flex-col items-center">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8">
        <LazyMotion features={domAnimation}>
          {/* Redesigned Hero Section */}
          <m.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 overflow-hidden"
            >
              {Array.from("Smart Staking").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 
                           drop-shadow-[2px_3px_1px_rgba(139,92,246,0.8)] 
                           transition-all duration-600 text-5xl sm:text-6xl md:text-7xl font-bold"
                  style={{
                    textShadow: "0 0 0 rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.3)"
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </m.span>
              ))}
            </m.div>
            
            <m.p 
              initial={{ opacity: 0, y: 0, x: 5 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.7, duration: 1 }}
              className="text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto mb-2"
            >
              Stake your tokens and earn rewards in our decentralized staking platform
            </m.p>
            <m.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.8 }}
              className="text-sm md:text-base text-slate-400/60"
            >
              Manage your staking positions and track your rewards in real-time
            </m.p>
          </m.div>

          <div className="container mx-auto space-y-8">
            {isConnected ? (
              <>
                <AnimatePresence mode="wait">
                  {isInitialLoad ? (
                    <LoadingSpinner size="default" message="Loading dashboard..." /> 
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <DashboardCards
                        account={account}
                        network={network}
                        depositAmount={depositAmount}
                        availableRewards={availableRewards}
                        totalPoolBalance={totalPoolBalance}
                        treasuryBalance={treasuryBalance}
                        roiProgress={roiProgress}
                        totalWithdrawn={totalWithdrawn}
                        firstDepositTime={firstDepositTime}
                        onDepositSuccess={handleDepositSuccess}
                        onFetchData={fetchContractData}
                      />
                      <div className="text-center mt-6 space-y-2">
                        <NetworkBadge />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                className="text-center py-20 bg-gradient-to-br from-indigo-900/20 to-violet-900/10 rounded-xl border border-indigo-700/20 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                    <FaCoins className="h-10 w-10" />
                  </div>
                </div>
                <p className="text-lg text-slate-300 mb-4">
                  Connect your wallet to view the dashboard information
                </p>
              </motion.div>
            )}
          </div>
        </LazyMotion>
      </div>

      {error && !loading && <ErrorMessage error={error} />}
    </div>
  );
}

// Add display name for better debugging
DashboardStaking.displayName = 'DashboardStaking';

export default DashboardStaking;