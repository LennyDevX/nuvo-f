import React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaRobot, FaChevronLeft, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RightSidebar = ({ 
  isOpen, 
  toggleSidebar, 
  walletConnected, 
  account, 
  network, 
  balance,
  nfts,
  nftsLoading,
  userDeposits,
  depositCount,
  pendingRewards,
  stakingStats
}) => {
  
  // Format account address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-80 border-l border-purple-500/20 bg-gray-900/40 backdrop-blur-xl hidden md:block overflow-y-auto"
        >
          <div className="p-6 pt-8 flex flex-col h-full">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FaUser className="text-purple-400" /> Your Profile
                </h2>
                <button 
                  onClick={toggleSidebar}
                  className="md:hidden p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/50 backdrop-blur-sm text-gray-400 hover:text-white transition-colors"
                  aria-label="Close profile panel"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* User profile section */}
              {walletConnected ? (
                <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-5 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 mb-6">
                  <div className="flex items-center space-x-4 mb-5">
                    <m.div 
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-white font-bold text-xl">
                        {account ? account[0].toUpperCase() : ''}
                      </span>
                    </m.div>
                    <div>
                      <div className="text-white font-mono text-base">
                        {formatAddress(account)}
                      </div>
                      <div className="text-sm text-purple-300">
                        {network || 'Unknown'} Network
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white font-medium">{parseFloat(balance || 0).toFixed(4)} MATIC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">NFTs:</span>
                      <span className="text-white font-medium">{nftsLoading ? '...' : (nfts?.length || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Staking:</span>
                      <span className="text-white font-medium">
                        {depositCount} {depositCount === 1 ? 'deposit' : 'deposits'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-5 border border-purple-500/20 text-center mb-6">
                  <p className="text-gray-300 mb-4">Connect your wallet to view your profile</p>
                  <m.button 
                    className="bg-purple-600/80 backdrop-blur-sm hover:bg-purple-700/80 text-white px-5 py-2.5 rounded-lg text-sm transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Connect Wallet
                  </m.button>
                </div>
              )}
              
              {/* NFT section */}
              {walletConnected && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Your NFTs
                  </h3>
                  {nftsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-gray-400 mt-3">Loading NFTs...</p>
                    </div>
                  ) : nfts && nfts.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {nfts.slice(0, 4).map((nft, idx) => (
                          <m.div 
                            key={idx} 
                            className="aspect-square rounded-lg overflow-hidden bg-gray-800/40 backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {nft.image ? (
                              <img 
                                src={nft.image} 
                                alt={nft.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/LogoNuvos.webp";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800/30">
                                <FaRobot className="text-gray-600 text-2xl" />
                              </div>
                            )}
                          </m.div>
                        ))}
                      </div>
                      {nfts.length > 4 && (
                        <div className="text-right">
                          <m.a 
                            href="/profile" 
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-block"
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            See {nfts.length - 4} more...
                          </m.a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-5 border border-purple-500/20 text-center">
                      <p className="text-sm text-gray-400">You don't have any NFTs in your collection</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Staking Stats Section - Improved */}
              {walletConnected && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center">
                    <FaChartLine className="mr-1.5 text-purple-400" /> Staking Stats
                  </h3>
                  <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-5 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Staking:</span>
                        <span className="text-white text-sm font-medium">
                          {depositCount} {depositCount === 1 ? 'position' : 'positions'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Rewards:</span>
                        <span className="text-green-400 text-sm font-medium">
                          {parseFloat(pendingRewards).toFixed(3)} POL
                        </span>
                      </div>
                      {stakingStats?.roiProgress && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">ROI Progress:</span>
                          <span className="text-purple-300 text-sm font-medium">
                            {Math.min(stakingStats.roiProgress, 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {depositCount > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <Link to="/staking">
                          <m.button
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            Manage staking
                            <FaChartLine className="ml-1 text-xs" />
                          </m.button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Link Button in Footer */}
            {walletConnected && (
              <div className="mt-auto pt-6 border-t border-gray-800/30">
                <Link to="/profile">
                  <m.button
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600/40 hover:bg-purple-600/60 backdrop-blur-sm text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUser className="text-sm" />
                    <span>View full profile</span>
                    <FaExternalLinkAlt className="text-xs ml-1" />
                  </m.button>
                </Link>
                <p className="text-xs text-center text-gray-400 mt-3">
                  Access all your stats, NFTs, and settings
                </p>
              </div>
            )}
            
            {/* Mobile Close Button */}
            <div className="md:hidden text-center mt-6">
              <button 
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/40 backdrop-blur-sm hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
              >
                <FaChevronLeft className="text-xs" /> 
                <span>Close panel</span>
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar;
