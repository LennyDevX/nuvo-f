import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { WalletContext } from "../../../context/WalletContext";
import useContractData from "../../../hooks/useContractData";
import useTreasuryBalance from "../../../hooks/useTreasuryBalance";
import DashboardCards from "./card/DashboardCards";
import NetworkBadge from "../../web3/NetworkBadge";
import ErrorMessage from "../../LoadOverlay/ErrorMessage";
import { ethers } from "ethers";
import { FaCoins, FaExternalLinkAlt } from 'react-icons/fa';
import { calculateROIProgress } from '../../../utils/RoiCalculations';
import LoadingSpinner from "../../LoadOverlay/LoadingSpinner";
import SpaceBackground from "../../effects/SpaceBackground";
import { globalRateLimiter } from "../../../utils/RateLimiter";
import { globalCache } from "../../../utils/CacheManager";

// Constantes optimizadas con nombres más descriptivos
const FULL_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos para refresh completo
const REWARDS_UPDATE_INTERVAL = 30000; // 30 segundos para recompensas (más frecuente)
const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
const DASHBOARD_CACHE_KEY = 'dashboard_data';
const DASHBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutos

const DashboardStaking = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [roiProgress, setRoiProgress] = useState(0);

  const lastRewardsFetch = useRef(0);
  const intervalRef = useRef(null);

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

  const safeData = useMemo(() => ({
    depositAmount: depositAmount || '0',
    availableRewards: availableRewards || '0',
    totalWithdrawn: totalWithdrawn || '0',
    firstDepositTime: firstDepositTime || 0,
    totalPoolBalance: totalPoolBalance || '0',
    treasuryBalance: treasuryBalance || '0'
  }), [depositAmount, availableRewards, totalWithdrawn, firstDepositTime, totalPoolBalance, treasuryBalance]);

  useEffect(() => {
    setIsConnected(Boolean(account && network && balance !== null));
  }, [account, network, balance]);

  const handleDataFetch = useCallback(async (force = false) => {
    if (!isConnected) return;

    const rateLimiterKey = `dashboard_refresh_${account}`;
    if (!force && !globalRateLimiter.canMakeCall(rateLimiterKey)) {
      console.log("Rate limited dashboard refresh, using cached data if available");

      const cachedData = await globalCache.get(
        `${DASHBOARD_CACHE_KEY}_${account}`,
        null
      );

      if (cachedData) {
        console.log("Using cached dashboard data");
        return;
      }
    }

    const now = Date.now();
    let shouldUpdateRewards = now - lastRewardsFetch.current >= REWARDS_UPDATE_INTERVAL;

    try {
      await fetchContractData(true);

      if (shouldUpdateRewards) {
        lastRewardsFetch.current = now;
        await fetchContractData(false, true);
      }

      globalCache.set(
        `${DASHBOARD_CACHE_KEY}_${account}`,
        { timestamp: now },
        DASHBOARD_CACHE_TTL
      );
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }, [isConnected, account, fetchContractData]);

  useEffect(() => {
    if (!isConnected) return;

    handleDataFetch(true);

    intervalRef.current = setInterval(() => {
      handleDataFetch(false);
    }, FULL_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnected, handleDataFetch]);

  useEffect(() => {
    if (safeData.depositAmount !== '0') {
      const roi = calculateROIProgress(safeData.depositAmount, safeData.totalWithdrawn);
      setRoiProgress(roi);
    }
  }, [safeData.depositAmount, safeData.totalWithdrawn]);

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

  const letterVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.15,
        ease: "easeOut"
      }
    })
  }), []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
        ease: "easeOut",
        duration: 0.6
      }
    }
  }), []);

  const handleDepositSuccessCallback = useCallback(() => {
    handleDepositSuccess();
  }, [handleDepositSuccess]);

  const handleFetchData = useCallback((...args) => {
    return fetchContractData(...args);
  }, [fetchContractData]);

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
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-center">
            <a 
              href="https://polygonscan.com/address/0x54ebebc65bcbcc7693cb83918fcd0115d71046e2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors duration-300 bg-slate-800/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-900/20 hover:border-indigo-500/30"
            >
              Smart Staking Contract V1.0<FaExternalLinkAlt className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </m.div>
    );
  }, [
    isConnected, isInitialLoad, account, network, 
    safeData, roiProgress, handleDepositSuccessCallback, handleFetchData
  ]);

  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-18 pb-12 flex flex-col items-center">
      <SpaceBackground customClass="" />
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
        <LazyMotion features={domAnimation} strict>
          <m.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-4 overflow-hidden"
            >
              {Array.from("Smart Staking").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                            text-5xl sm:text-6xl md:text-7xl font-bold"
                  style={{
                    willChange: "transform, opacity",
                    transform: "translateZ(0)"
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </m.span>
              ))}
            </m.div>
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

DashboardStaking.displayName = 'DashboardStaking';

export default React.memo(DashboardStaking);