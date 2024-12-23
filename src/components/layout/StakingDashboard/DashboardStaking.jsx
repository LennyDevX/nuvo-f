// src/components/layout/DashboardStaking/DashboardStaking.jsx
import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { WalletContext } from "../../../context/WalletContext";
import useContractData from "../../../hooks/useContractData";
import useTreasuryBalance from "../../../hooks/useTreasuryBalance";
import { getStakingDuration } from "../../../utils/utils";
import DashboardCards from "./DashboardCards";
import ActionButtons from "./ActionButtons";
import Tag from "./Tag";
import ErrorMessage from "../../LoadOverlay/ErrorMessage";
import LoadingOverlay from "../../LoadOverlay/LoadingOverlay";
import { ethers } from "ethers";
import { formatBalance } from "../../../utils/formatters"; // Add this import
import { FaCoins, FaUsers, FaChartLine, FaPiggyBank } from 'react-icons/fa';
import Toast from '../../ui/Toast';
import ROICard from './card/ROICard'; // Add this import
import { calculateROIProgress } from '../../../utils/roiCalculations';
import '../../../styles/gradients.css';

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

const DashboardStaking = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [roiProgress, setRoiProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

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

  // Modify the existing effect to include rewards fetching
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
            await fetchContractData(false, true); // Add a parameter to specifically fetch rewards
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

  // Verificar y validar la dirección del tesoro
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

  const handleWithdrawalSuccess = useCallback(async () => {
    try {
      // Actualizar todos los datos relevantes
      await fetchContractData(true);
      
      // Recalcular ROI después de la actualización
      const newRoi = calculateROIProgress(depositAmount, totalWithdrawn);
      setRoiProgress(newRoi);
    } catch (error) {
      console.error("Error updating dashboard after withdrawal:", error);
    }
  }, [fetchContractData, depositAmount, totalWithdrawn]);

  // Simplified logging
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

  // Add a debugging log for rewards
  useEffect(() => {
    if (availableRewards !== '0') {
      console.debug('Available rewards updated:', availableRewards);
    }
  }, [availableRewards]);

  const getQuickStats = () => [
    {
      icon: <FaCoins />,
      label: "Total Staked",
      value: `${formatBalance(totalPoolBalance)} POL`,
    },
    {
      icon: <FaUsers />,
      label: "Your Stake",
      value: `${formatBalance(depositAmount)} POL`,
    },
    {
      icon: <FaChartLine />,
      label: "ROI Progress",
      value: `${roiProgress.toFixed(2)}%`,
    },
    {
      icon: <FaPiggyBank />,
      label: "Available Rewards",
      value: `${formatBalance(availableRewards || '0')} POL`,
    }
  ];

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
  };

  console.log("Dashboard Values:", {
    depositAmount: safeDepositAmount,
    totalWithdrawn: safeTotalWithdrawn,
    treasuryBalance
  });

  // Pre-define animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto">
        <LazyMotion features={domAnimation}>
          {/* Optimize the header section */}
          <m.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={headerVariants}
          >
            {/* Preload critical fonts */}
            <link
              rel="preload"
              href="/fonts/your-font-file.woff2"
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
            
            {/* Optimize heading with pre-rendered text */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Smart Staking{" "}
              <span className="text-white">
                Dashboard
              </span>
            </h1>
            
            {/* Optimize subtext */}
            <p 
              className="text-gray-300"
              style={{
                willChange: 'transform',
                contain: 'layout style paint'
              }}
            >
              Manage your staking positions and rewards
            </p>
          </m.div>

          <div className="container mx-auto space-y-8">
            {isConnected ? (
              <>
                <AnimatePresence mode="wait">
                  {isInitialLoad ? (
                    <LoadingOverlay />
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
                      <Tag network={network} />
                      
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                className="text-center py-8 bg-pink-400/5 rounded-xl p-6 border border-purple-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-lg text-white mb-4">
                  Connect your wallet to view the dashboard information
                </p>
              </motion.div>
            )}
          </div>
        </LazyMotion>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}
      {error && !loading && <ErrorMessage error={error} />}
    </div>
  );
}

// Add display name for better debugging
DashboardStaking.displayName = 'DashboardStaking';

export default DashboardStaking;