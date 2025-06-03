import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExternalLinkAlt, FaWallet, FaPlus, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTokenization } from '../../../../context/TokenizationContext';
import { DEFAULT_PLACEHOLDER } from '../../../../utils/blockchain/blockchainUtils';

const SuccessStep = () => {
  const navigate = useNavigate();
  const { mintedNFT, metadata, resetForm } = useTokenization();

  const viewOnPolygonScan = () => {
    if (mintedNFT?.transactionHash) {
      const url = `https://polygonscan.com/tx/${mintedNFT.transactionHash}`;
      window.open(url, '_blank');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 sm:space-y-6 text-center"
    >
      <motion.div
        variants={itemVariants}
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-2xl sm:text-3xl"
      >
        <FaCheckCircle />
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 px-4">
        Asset Successfully Tokenized!
      </motion.h2>
      
      <motion.p variants={itemVariants} className="text-sm sm:text-base text-gray-300 px-4">
        Your asset has been successfully transformed into an NFT on the blockchain
      </motion.p>
      
      {mintedNFT && (
        <motion.div 
          variants={itemVariants}
          className="max-w-sm sm:max-w-md mx-auto bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-left border border-white/20"
        >
          <div className="aspect-square rounded-xl overflow-hidden mb-3 sm:mb-4 border border-purple-500/20 shadow-lg">
            <img 
              src={mintedNFT.imageUrl} 
              alt="Minted NFT" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PLACEHOLDER;
              }}
            />
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <div>
              <span className="text-gray-400 text-xs sm:text-sm">Token ID:</span>
              <p className="text-white font-mono text-sm sm:text-base">{mintedNFT.tokenId}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs sm:text-sm">Transaction:</span>
              <div className="flex items-center">
                <p className="text-white font-mono text-xs sm:text-sm truncate">{`${mintedNFT.transactionHash.slice(0, 8)}...${mintedNFT.transactionHash.slice(-6)}`}</p>
                <button 
                  onClick={viewOnPolygonScan}
                  className="ml-2 text-purple-400 hover:text-purple-300 transition-colors touch-manipulation p-1"
                >
                  <FaExternalLinkAlt size={14} />
                </button>
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs sm:text-sm">Name:</span>
              <p className="text-white text-sm sm:text-base">{metadata.name}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 px-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg mx-auto touch-manipulation"
          onClick={() => navigate('/my-nfts')}
        >
          <FaWallet className="text-base sm:text-lg" /> 
          <span className="text-sm sm:text-base">View My NFT Collection</span>
        </motion.button>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:bg-slate-600 touch-manipulation"
            onClick={resetForm}
          >
            <FaPlus /> 
            <span className="text-sm sm:text-base">Create Another NFT</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-800 border border-purple-500/20 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:bg-slate-700 touch-manipulation"
            onClick={() => navigate('/marketplace')}
          >
            <FaSearch /> 
            <span className="text-sm sm:text-base">Explore Marketplace</span>
          </motion.button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 mt-4 mx-4">
        <p className="text-xs sm:text-sm text-purple-300">
          This NFT now belongs to you on the Polygon blockchain. You can view, transfer, or list it for sale anytime.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SuccessStep;
