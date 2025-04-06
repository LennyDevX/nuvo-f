import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTokenization } from '../../../../context/TokenizationContext';

const SuccessStep = () => {
  const navigate = useNavigate();
  const { mintedNFT, metadata, resetForm } = useTokenization();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-3xl"
      >
        <FaCheckCircle />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white">Asset Successfully Tokenized!</h2>
      <p className="text-gray-300">Your physical asset has been digitally represented as an NFT</p>
      
      {mintedNFT && (
        <div className="max-w-md mx-auto bg-black/30 rounded-xl p-6 border border-purple-500/20 text-left">
          <div className="aspect-square rounded-xl overflow-hidden mb-4">
            <img 
              src={mintedNFT.imageUrl} 
              alt="Minted NFT" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Token ID:</span>
              <p className="text-white font-mono">{mintedNFT.tokenId}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Transaction:</span>
              <p className="text-white font-mono text-sm">{`${mintedNFT.transactionHash.slice(0, 12)}...${mintedNFT.transactionHash.slice(-8)}`}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Asset Name:</span>
              <p className="text-white">{metadata.name}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-6 flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium"
          onClick={() => navigate('/nfts')}
        >
          View My NFTs
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium"
          onClick={resetForm}
        >
          Tokenize Another Asset
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SuccessStep;
