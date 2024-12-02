// Features.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faRocket, faLock, faGlobe } from '@fortawesome/free-solid-svg-icons';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      className="w-full py-12 bg-transparent"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Staking Card */}
          <motion.div 
            className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon 
                  icon={faRocket} 
                  className="text-2xl text-purple-400 mr-3"
                />
                <h2 className="text-xl font-bold text-white">
                  Staking V1
                </h2>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-300">
                  <span>Max ROI 130%</span> <span className="ml-2">💰</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <span>Hourly ROI 0.025%</span> <span className="ml-2">⏳</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <span>Max Deposit 10K POL</span> <span className="ml-2">🏧</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <span>Min Deposit 5 POL</span> <span className="ml-2">💵</span>
                </li>
              </ul>
              <Link 
                to="/staking" 
                className=" w-full inline-flex justify-center items-center px-4 py-2 rounded-lg
                  bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium
                  transform transition-all duration-200 hover:scale-[1.02]
                  hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6]"
              >
                Know More
              </Link>
            </div>
          </motion.div>

          {/* Swap Card */}
          <motion.div 
            className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon 
                  icon={faGlobe} 
                  className="text-2xl text-purple-400 mr-3"
                />
                <h2 className="text-xl font-bold text-white">
                  Token Swap
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['USDT', 'POL', 'WETH', 'DAI',].map(token => (
                  <div 
                    key={token} 
                    className="flex items-center p-2 rounded-lg bg-black/20"
                  >
                    <FontAwesomeIcon 
                      icon={faDollarSign} 
                      className="mr-2 text-purple-400"
                    />
                    <span className="text-gray-300">
                      {token}
                    </span>
                  </div>
                ))}
              </div>
              <Link 
                to="/swaptoken" 
                className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg
                  bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium
                  transform transition-all duration-200 hover:scale-[1.02]
                  hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6]"
              >
                Swap Now
              </Link>
            </div>
          </motion.div>

          {/* NFT Card */}
          <motion.div 
            className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="text-2xl text-purple-400 mr-3"
                />
                <h2 className="text-xl font-bold text-white">
                  NFT Benefits
                </h2>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-300">
                  Extra commissions ✨
                </li>
                <li className="flex items-center text-gray-300">
                  NFT Bonus rewards 🎁
                </li>
                <li className="flex items-center text-gray-300">
                  VIP access 👑
                </li>
              </ul>
              <Link 
                to="/nft" 
                className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg
                  bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium
                  transform transition-all duration-200 hover:scale-[1.02]
                  hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6]"
              >
                Coming Soon
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Features;