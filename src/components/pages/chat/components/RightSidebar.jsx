import React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaRobot, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../image/OptimizedImage';

const RightSidebar = ({ 
  isOpen, 
  toggleSidebar, 
  walletConnected, 
  account, 
  network, 
  balance,
  nfts,
  nftsLoading,
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
    <>
      {/* Backdrop - only on mobile */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <m.div
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900 border-l border-purple-500/20 z-[200] md:z-[300] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="bg-gray-800 border-b border-purple-500/20 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FaUser className="text-purple-400" /> Your Profile
              </h2>
              <button 
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors md:hidden"
                aria-label="Close profile panel"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 h-full overflow-y-auto bg-gray-900">
              {/* User profile section */}
              {walletConnected ? (
                <div className="bg-gray-800 border border-purple-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <m.div 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-white font-bold text-lg">
                        {account ? account[0].toUpperCase() : ''}
                      </span>
                    </m.div>
                    <div>
                      <div className="text-white font-mono text-sm">
                        {formatAddress(account)}
                      </div>
                      <div className="text-xs text-purple-300">
                        {network || 'Polygon'} Network
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <span className="text-gray-400 block mb-1">Balance</span>
                      <span className="text-white font-medium">{parseFloat(balance || 0).toFixed(4)} MATIC</span>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <span className="text-gray-400 block mb-1">NFTs</span>
                      <span className="text-white font-medium">{nftsLoading ? '...' : (nfts?.length || 0)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 border border-purple-500/20 rounded-xl p-4 text-center mb-6">
                  <FaUser className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Connect your wallet to view profile</p>
                </div>
              )}             
              
              {/* NFT section */}
              {walletConnected && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                    Your NFTs
                  </h3>
                  {nftsLoading ? (
                    <div className="bg-gray-800 border border-purple-500/20 rounded-xl p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-sm text-gray-400">Loading NFTs...</p>
                    </div>
                  ) : nfts && nfts.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {nfts.slice(0, 4).map((nft, idx) => (
                          <m.div 
                            key={idx} 
                            className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-purple-500/20"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {nft.image ? (
                              <OptimizedImage
                                src={nft.image}
                                alt={nft.name}
                                className="w-full h-full object-cover"
                                loadingStrategy="lazy"
                                style={{ width: '100%', height: '100%' }}
                                onError={(e) => {
                                  e.target.src = "/LogoNuvos.webp";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaRobot className="text-gray-600 text-2xl" />
                              </div>
                            )}
                          </m.div>
                        ))}
                      </div>
                      {nfts.length > 4 && (
                        <div className="text-center">
                          <m.a 
                            href="/my-nfts" 
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            whileHover={{ x: 3 }}
                          >
                            View all {nfts.length} NFTs →
                          </m.a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-800 border border-purple-500/20 rounded-xl p-6 text-center">
                      <FaRobot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No NFTs found in your collection</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Staking Stats Section */}
              {walletConnected && (
                <div className="mb-6">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <FaChartLine className="text-purple-400" /> Staking Overview
                  </h3>
                  <div className="bg-gray-800 border border-purple-500/20 rounded-xl p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Positions:</span>
                        <span className="text-white font-medium">
                          {depositCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pending Rewards:</span>
                        <span className="text-green-400 font-medium">
                          {parseFloat(pendingRewards || 0).toFixed(3)} POL
                        </span>
                      </div>
                      {stakingStats?.roiProgress && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">ROI Progress:</span>
                          <span className="text-purple-300 font-medium">
                            {Math.min(stakingStats.roiProgress, 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {depositCount > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <Link to="/staking">
                          <m.button
                            className="w-full py-2 px-3 bg-purple-600/40 hover:bg-purple-600/60 text-white rounded-lg transition-colors text-sm font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Manage Staking
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
              <div className="p-4 border-t border-purple-500/20 bg-gray-800">
                <Link to="/profile">
                  <m.button
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUser className="text-sm" />
                    <span>View Full Profile</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </m.button>
                </Link>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebar;
