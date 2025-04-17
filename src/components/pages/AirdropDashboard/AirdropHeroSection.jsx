import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaCoins } from 'react-icons/fa';
import { WalletContext } from '../../../context/WalletContext';

const AirdropHeroSection = ({ setActiveTab }) => {
  const { account } = useContext(WalletContext);

  const formatAddress = (address) => {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <motion.section 
      className="text-center mb-12" 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      
      
      <div className="">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-300 drop-shadow-[0_2px_4px_rgba(168,85,247,0.6)]">
          Join the Future of Finance
        </h1>
        
        <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto">
          Participate in our community airdrop and receive NUVOS tokens to access exclusive features and participate in our Smart Staking program.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-4">
        {/* Wallet display moved to where register button was */}
        {account ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 bg-green-900/40 backdrop-blur-sm border border-green-500/50 rounded-lg font-medium text-white flex items-center gap-2 shadow-md"
          >
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span className="text-green-200">Wallet Connected: {formatAddress(account)}</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 bg-red-900/40 backdrop-blur-sm border border-red-500/50 rounded-lg font-medium text-white flex items-center gap-2 shadow-md"
          >
            <div className="h-2 w-2 rounded-full bg-red-400"></div>
            <span className="text-red-200">Wallet Not Connected</span>
          </motion.div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('staking');
            document.getElementById('info-section').scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-6 py-3 bg-black/60 backdrop-blur-sm border border-purple-500/50 rounded-lg font-medium text-white flex items-center gap-2 hover:bg-purple-900/40 transition-colors shadow-md"
        >
          <FaCoins /> Learn About Staking
        </motion.button>
      </div>
    </motion.section>
  );
};

export default AirdropHeroSection;
