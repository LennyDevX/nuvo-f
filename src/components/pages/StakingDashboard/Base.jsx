import React, { useEffect, useState, useContext } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { WalletContext } from "../../../context/WalletContext";
import { FriendlyAlert } from "./ui/CommonComponents";
import { FaCoins } from 'react-icons/fa';
import LoadingSpinner from "../../LoadOverlay/LoadingSpinner";
import SpaceBackground from "../../effects/SpaceBackground";
import StakingDashboard from "./StakingDashboard";
import { useStaking } from "../../../context/StakingContext";

const DashboardStaking = () => {
  const { account, network, balance } = useContext(WalletContext);
  const { state } = useStaking();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if wallet is connected
  useEffect(() => {
    setIsConnected(Boolean(account && network && balance !== null));
    
    // Add a slight delay to ensure smooth animations
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [account, network, balance]);

  // Mostrar error si el contrato está pausado o migrado
  useEffect(() => {
    if (state.isContractPaused) {
      setError({
        type: 'warning',
        title: "Maintenance in Progress",
        message: "We're currently performing some maintenance to improve your experience. Staking will be available again shortly. Thanks for your patience!"
      });
    } else if (state.isMigrated) {
      setError({
        type: 'info',
        title: "System Update Complete",
        message: "Great news! We've upgraded our staking system. Please refresh your browser to access the latest features and improvements."
      });
    } else {
      setError(null);
    }
  }, [state.isContractPaused, state.isMigrated]);

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.15,
        ease: "easeOut"
      }
    })
  };

  const containerVariants = {
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
  };

  const renderDashboardContent = () => {
    if (!isConnected) {
      return (
        <m.div
          className="text-center py-20"
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
            Connect your wallet to view your staking dashboard
          </p>
        </m.div>
      );
    }

    if (isLoading) {
      return <LoadingSpinner size="default" message="Loading dashboard..." />;
    }

    return (
      <m.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <StakingDashboard account={account} />
      </m.div>
    );
  };

  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-16 sm:pt-18 pb-8 sm:pb-12 flex flex-col items-center">
      <SpaceBackground customClass="" />
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 relative z-10">
        <LazyMotion features={domAnimation} strict>
          <m.div
            className="text-center mb-6 sm:mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-3 sm:mb-4 overflow-hidden"
            >
              {Array.from("Smart Staking").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                            text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
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
              <p className="text-base sm:text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto mb-2 px-2">
                Stake your tokens and earn rewards in our decentralized staking platform
              </p>
              <p className="text-sm md:text-base text-slate-400/60 px-2">
                Manage your staking positions and track your rewards in real-time
              </p>
            </m.div>
          </m.div>
          <div className="container mx-auto">
            {error && (
              <div className="mb-6">
                <FriendlyAlert
                  type={error.type}
                  title={error.title}
                  message={error.message}
                  onClose={() => setError(null)}
                />
              </div>
            )}
            <AnimatePresence mode="wait">
              {renderDashboardContent()}
            </AnimatePresence>
          </div>
        </LazyMotion>
      </div>
    </div>
  );
}

export default DashboardStaking;