import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import DodoSwapWidget from "../web3/SwapDodo";
import { WalletContext } from "../../context/WalletContext";

const SwapToken = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  useEffect(() => {
    setIsConnected(Boolean(account && network && balance !== null));
  }, [account, network, balance]);

  const handleError = useCallback((err) => {
    setError(err?.message || 'An error occurred');
  }, []);

  const handleLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const handleTransactionStatus = useCallback((status) => {
    setTransactionStatus(status);
  }, []);

  const NetworkBadge = () => (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
      <div className={`w-2 h-2 rounded-full ${network ? 'bg-green-500' : 'bg-red-500'}`}></div>
      {network || 'Not Connected'}
    </div>
  );

  const TransactionStatus = () => (
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
  );

  const widgetProps = useMemo(() => ({
    onError: handleError,
    onLoading: handleLoading,
    onTransactionStatus: handleTransactionStatus
  }), [handleError, handleLoading, handleTransactionStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-8 md:py-16 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Nuvos Swap
          </h1>
          <p className="text-white text-lg">
            Intercambia tus tokens de manera rápida y segura
          </p>
        </motion.div>

        <NetworkBadge />

        {error && (
          <motion.div 
            className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <motion.div 
            className="animate-pulse space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-12 bg-purple-600/20 rounded"></div>
            <div className="h-12 bg-purple-600/20 rounded"></div>
            <div className="h-12 bg-purple-600/20 rounded"></div>
          </motion.div>
        ) : isConnected ? (
          <div className="flex justify-center items-center w-full">
            <motion.div
              className="w-full max-w-lg mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div 
                className="relative flex justify-center"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <DodoSwapWidget {...widgetProps} />
                {showTooltip && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                    Intercambia tus tokens aquí
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white text-xl">
              Por favor, conecta tu wallet usando el botón en la barra de navegación.
            </p>
          </motion.div>
        )}

        <TransactionStatus />
      </div>
    </div>
  );
};

export default React.memo(SwapToken);