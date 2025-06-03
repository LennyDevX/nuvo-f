import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo, FaNetworkWired, FaWallet } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { WalletContext } from '../../../../context/WalletContext';

const NFTErrorState = ({ error, onRetry, walletConnected }) => {
  const { connectWallet } = useContext(WalletContext);

  // Determine if this is a network error
  const isNetworkError = error && (
    error.includes('network') || 
    error.includes('conectar') || 
    error.includes('connection') ||
    error.includes('red incorrecta')
  );

  // Determine if this is a no-NFTs-yet message
  const isNoNFTsError = error && (
    error.includes('No se pudieron decodificar') || 
    error.includes('aún no tengas NFTs') ||
    error.includes('BAD_DATA')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/20 mb-6">
        <FaExclamationTriangle className="text-amber-400 text-3xl" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
        {isNetworkError ? "Connection Problem" : 
         isNoNFTsError ? "No NFTs Found" : 
         "Error Loading NFTs"}
      </h3>
      
      <p className="text-gray-300 mb-8 max-w-lg leading-relaxed">
        {isNetworkError ? (
          "We couldn't connect to the blockchain. Please verify that your wallet is connected to the correct network (Polygon Network)."
        ) : isNoNFTsError ? (
          "It seems you don't have any NFTs created yet or the blockchain connection failed."
        ) : (
          error || "An error occurred while loading your NFTs. Please try again."
        )}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {!walletConnected ? (
          <motion.button
            onClick={connectWallet}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            <FaWallet className="mr-2" /> Connect Wallet
          </motion.button>
        ) : null}
        
        <motion.button 
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-all duration-300"
        >
          <FaRedo className="mr-2" /> Try Again
        </motion.button>
        
        {isNetworkError && (
          <motion.a
            href="https://chainlist.org/chain/137"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-all duration-300"
          >
            <FaNetworkWired className="mr-2" /> Switch to Polygon
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};

export default NFTErrorState;
