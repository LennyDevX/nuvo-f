import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import DodoSwapWidget from "../web3/SwapDodo";
import { WalletContext } from "../../context/WalletContext";
import SpaceBackground from "../effects/SpaceBackground";

const SwapToken = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  // Letter-by-letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.4,
        ease: "easeIn"
      }
    })
  };

  // Container animation for title - remove opacity transitions that might cause fading
  const titleContainerVariants = {
    hidden: { opacity: 0.99 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.4
      }
    }
  };

  const isWalletConnected = useMemo(() => 
    Boolean(account && network && balance !== null),
    [account, network, balance]
  );

  useEffect(() => {
    setIsConnected(isWalletConnected);
  }, [isWalletConnected]);

  const handleSwapError = useCallback((error) => {
    console.error("Swap error:", error);
    setError(error?.message || 'An error occurred');
  }, []);

  const handleSwapLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const handleTransactionStatus = useCallback((status) => {
    setTransactionStatus(status);
  }, []);

  const NetworkBadge = useMemo(() => () => (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
      <div className={`w-2 h-2 rounded-full ${network ? 'bg-green-500' : 'bg-red-500'}`}></div>
      {network || 'Not Connected'}
    </div>
  ), [network]);

  const TransactionStatus = useMemo(() => () => (
    transactionStatus && (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-purple-600/90 p-4 rounded-lg"
      >
        <p className="text-white">Transaction {transactionStatus}</p>
      </motion.div>
    )
  ), [transactionStatus]);

  const widgetProps = useMemo(() => ({
    onError: handleSwapError,
    onLoading: handleSwapLoading,
    onTransactionStatus: handleTransactionStatus
  }), [handleSwapError, handleSwapLoading, handleTransactionStatus]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <motion.div 
          className="animate-pulse space-y-4 w-full max-w-[380px] mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-12 bg-purple-600/20 rounded"></div>
          <div className="h-12 bg-purple-600/20 rounded"></div>
          <div className="h-12 bg-purple-600/20 rounded"></div>
        </motion.div>
      );
    }

    if (!isConnected) {
      return (
        <motion.div
          className="text-center mt-8 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white text-xl">
            Por favor, conecta tu wallet usando el botón en la barra de navegación.
          </p>
        </motion.div>
      );
    }

    return (
      <div className="flex justify-center items-center w-full">
        <motion.div
          className="w-full flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DodoSwapWidget {...widgetProps} />
        </motion.div>
      </div>
    );
  }, [isLoading, isConnected, widgetProps]);

  return (
    <div className="bg-nuvo-gradient min-h-screen pt-20 sm:pt-24 md:py-16 flex flex-col items-center justify-start sm:justify-center">
      <SpaceBackground customClass="" /> {/* Reduced opacity for better contrast with text */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated title with enhanced visibility */}
          <motion.div
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className="mb-4 overflow-hidden relative z-10"
          >
            {Array.from("Nuvos Swap").map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                         
                         text-2xl sm:text-4xl md:text-5xl font-bold"
                style={{
                  WebkitTextFillColor: 'transparent', // Ensure text transparency works consistently
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
          
          {/* Subtitle with improved contrast */}
          <motion.p 
            initial={{ opacity: 0, y: 0, x: 5 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 1.7, duration: 1 }}
            className="text-gray-100 text-sm sm:text-base md:text-lg px-2 sm:px-4 font-semibold relative z-10"
            style={{ 
              textShadow: '0 0px 0px rgba(0,0,0,0.5)' // Text shadow for better readability
            }}
          >
            Intercambia tus tokens de manera rápida y segura
          </motion.p>
        </motion.div>

        {/* Adjust NetworkBadge margins and improve visibility */}
        <div className="mb-4 sm:mb-6 relative z-10">
          <NetworkBadge />
        </div>

        {error && (
          <motion.div 
            className="bg-red-500/20 text-red-300 p-3 sm:p-4 rounded-lg mb-4 mx-2 sm:mx-0 font-medium border border-red-500/30 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="w-full flex justify-center items-center px-2 sm:px-0 relative z-10">
          <div className="w-full  rounded-xl p-2 sm:p-4">
            {renderContent}
          </div>
        </div>

        {/* Adjust TransactionStatus position for mobile */}
        <div className="fixed bottom-4 right-2 sm:right-4 z-50">
          <TransactionStatus />
        </div>
      </div>
    </div>
  );
};

export default React.memo(SwapToken);