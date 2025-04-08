import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { WalletContext } from "../../../context/WalletContext";
import useContractData from "../../../hooks/useContractData";
import useTreasuryBalance from "../../../hooks/useTreasuryBalance";
import DashboardCards from "./card/DashboardCards";
import NetworkBadge from "../../web3/NetworkBadge";
import ErrorMessage from "../../LoadOverlay/ErrorMessage";
import { ethers } from "ethers";
import { FaCoins } from 'react-icons/fa';
import { calculateROIProgress } from '../../../utils/RoiCalculations';
import LoadingSpinner from "../../LoadOverlay/LoadingSpinner";
import SpaceBackground from "../../effects/SpaceBackground";

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const REWARDS_UPDATE_INTERVAL = 30000; // 30 seconds

const DashboardStaking = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [roiProgress, setRoiProgress] = useState(0);

  // Add reference for last rewards fetch
  const lastRewardsFetch = useRef(0);
  const intervalRef = useRef(null);
  
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

  // Ensure values are not undefined before passing - memoized
  const safeData = useMemo(() => ({
    depositAmount: depositAmount || '0',
    availableRewards: availableRewards || '0',
    totalWithdrawn: totalWithdrawn || '0',
    firstDepositTime: firstDepositTime || 0,
    totalPoolBalance: totalPoolBalance || '0',
    treasuryBalance: treasuryBalance || '0'
  }), [depositAmount, availableRewards, totalWithdrawn, firstDepositTime, totalPoolBalance, treasuryBalance]);

  // Memoized connection check
  useEffect(() => {
    setIsConnected(Boolean(account && network && balance !== null));
  }, [account, network, balance]);

  // Optimized data fetching with cleanup
  useEffect(() => {
    if (!isConnected) return;

    const fetchDataAndRewards = async () => {
      try {
        await fetchContractData(true);
        
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

    // Initial fetch
    fetchDataAndRewards();
    
    // Setup interval with cleanup
    intervalRef.current = setInterval(fetchDataAndRewards, UPDATE_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnected, fetchContractData]);

  // Memoized ROI calculation
  useEffect(() => {
    if (safeData.depositAmount !== '0') {
      const roi = calculateROIProgress(safeData.depositAmount, safeData.totalWithdrawn);
      setRoiProgress(roi);
    }
  }, [safeData.depositAmount, safeData.totalWithdrawn]);

  // Memoized treasury address validation
  useEffect(() => {
    if (!TREASURY_ADDRESS) {
      console.error('Treasury address is not configured in environment variables');
    } else if (process.env.NODE_ENV === 'development') {
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

  // Only log in development, memoized
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug("Dashboard State:", {
        depositAmount: safeData.depositAmount,
        totalWithdrawn: safeData.totalWithdrawn,
        treasuryBalance: safeData.treasuryBalance,
        roiProgress
      });
    }
  }, [safeData.depositAmount, safeData.totalWithdrawn, safeData.treasuryBalance, roiProgress]);

  // Memoized animation variants
  const letterVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05, // Reducido de 0.10 a 0.05 para acelerar la animación
        duration: 0.15, // Reducido de 0.2 a 0.15
        ease: "easeOut"
      }
    })
  }), []);

  // Memoized container animation
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reducido de 0.10 a 0.05
        delayChildren: 0.05, // Reducido de 0.1 a 0.05
        ease: "easeOut",
        duration: 0.6 // Agregado para hacer la transición más rápida
      }
    }
  }), []);

  // Optimized handler for deposit success
  const handleDepositSuccessCallback = useCallback(() => {
    handleDepositSuccess();
  }, [handleDepositSuccess]);

  // Optimized handler for data fetching
  const handleFetchData = useCallback((...args) => {
    return fetchContractData(...args);
  }, [fetchContractData]);

  // Render optimized for mobile with conditional content loading
  const renderDashboardContent = useCallback(() => {
    if (!isConnected) {
      return (
        <m.div
          className="text-center py-20 "
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
        </m.div>
      );
    }

    if (isInitialLoad) {
      return <LoadingSpinner size="default" message="Loading dashboard..." />;
    }

    return (
      <m.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <DashboardCards
          account={account}
          network={network}
          depositAmount={safeData.depositAmount}
          availableRewards={safeData.availableRewards}
          totalPoolBalance={safeData.totalPoolBalance}
          treasuryBalance={safeData.treasuryBalance}
          roiProgress={roiProgress}
          totalWithdrawn={safeData.totalWithdrawn}
          firstDepositTime={safeData.firstDepositTime}
          onDepositSuccess={handleDepositSuccessCallback}
          onFetchData={handleFetchData}
        />
        <div className="text-center mt-6 space-y-2">
          <NetworkBadge />
        </div>
      </m.div>
    );
  }, [
    isConnected, isInitialLoad, account, network, 
    safeData, roiProgress, handleDepositSuccessCallback, handleFetchData
  ]);

  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-24 pb-16 flex flex-col items-center">
      <SpaceBackground customClass="opacity-80" /> {/* Reducido de 90% a 80% para menor sobrecarga */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
        <LazyMotion features={domAnimation} strict>
          {/* Redesigned Hero Section - optimizado */}
          <m.div
            className="text-center mb-12" // Reducido de mb-16 a mb-12
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }} // Reducido de 1 a 0.6
          >
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-4 overflow-hidden" // Reducido de mb-6 a mb-4
            >
              {Array.from("Smart Staking").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 
                           drop-shadow-[1px_2px_1px_rgba(139,92,246,0.6)] 
                           transition-all duration-300 text-5xl sm:text-6xl md:text-7xl font-bold"
                  style={{
                    willChange: "transform, opacity", // Añadido para optimizar rendimiento
                    transform: "translateZ(0)" // Forzar aceleración por hardware
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </m.span>
              ))}
            </m.div>
            
            {/* Simplificado a una sola animación para el texto descriptivo */}
            <m.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ willChange: "opacity, transform" }}
            >
              <p className="text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto mb-2">
                Stake your tokens and earn rewards in our decentralized staking platform
              </p>
              <p className="text-sm md:text-base text-slate-400/60">
                Manage your staking positions and track your rewards in real-time
              </p>
            </m.div>
          </m.div>

          <div className="container mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {renderDashboardContent()}
            </AnimatePresence>
          </div>
        </LazyMotion>
      </div>

      {error && !loading && <ErrorMessage error={error} />}
    </div>
  );
}

// Add display name for better debugging
DashboardStaking.displayName = 'DashboardStaking';

export default React.memo(DashboardStaking);