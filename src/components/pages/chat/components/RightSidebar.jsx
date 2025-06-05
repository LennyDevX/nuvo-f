import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaRobot, FaExternalLinkAlt, FaChartLine, FaCoins, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
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
  const focusTrapRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const [nftError, setNftError] = useState(null);
  const [hoveredNftIndex, setHoveredNftIndex] = useState(null);
  const navigate = useNavigate();
  
  // Debug logging for NFT data
  useEffect(() => {
    if (walletConnected) {
      console.log('RightSidebar NFT Debug:', {
        nfts: nfts,
        nftsLoading,
        nftsLength: nfts?.length,
        account
      });
    }
  }, [nfts, nftsLoading, walletConnected, account]);

  // Format account address for display
  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

  // Navigate to NFT detail page
  const handleNftClick = useCallback((nft) => {
    const tokenId = nft.tokenId || nft.id;
    if (tokenId) {
      navigate(`/nft/${tokenId}`);
      toggleSidebar(); // Close sidebar on mobile after navigation
    }
  }, [navigate, toggleSidebar]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstFocusableRef.current?.focus();
        setTimeout(() => {
          firstFocusableRef.current?.blur();
        }, 100);
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      toggleSidebar();
    }
    
    if (e.key === 'Tab') {
      const firstElement = firstFocusableRef.current;
      const lastElement = lastFocusableRef.current;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [toggleSidebar]);

  // Handle NFT image error
  const handleNftImageError = useCallback((e, nftName) => {
    console.warn(`Failed to load NFT image for: ${nftName}`);
    e.target.src = "/LogoNuvos.webp";
    setNftError(`Some NFT images failed to load`);
  }, []);

  // Clear NFT error when new data loads
  useEffect(() => {
    if (!nftsLoading && nfts) {
      setNftError(null);
    }
  }, [nftsLoading, nfts]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
            className="
              fixed z-[200] md:z-[300] shadow-2xl
              bottom-0 left-0 right-0 h-[90vh] rounded-t-3xl
              md:top-20 md:right-8 md:left-auto md:h-[calc(100vh-6rem)] md:w-96 md:max-w-[400px] md:rounded-3xl
              bg-gray-900/95 md:bg-gray-900/98 backdrop-blur-xl
              border-purple-500/20
              border-t-2 md:border md:border-purple-500/20
              flex flex-col
              md:shadow-2xl md:shadow-purple-900/30
            "
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="right-sidebar-title"
            aria-describedby="right-sidebar-description"
          >
            {/* Mobile drag indicator */}
            <div className="md:hidden flex justify-center pt-4 pb-3 flex-shrink-0">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
            </div>

            {/* Header - Redesigned with proper spacing */}
            <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 md:bg-gray-800/95 border-b border-purple-500/20 p-6 md:p-8 relative flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 
                    id="right-sidebar-title"
                    className="text-white font-bold flex items-center gap-4 text-xl md:text-2xl leading-tight mb-3"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FaUser className="text-white text-lg md:text-xl" />
                    </div>
                    Your Profile
                  </h2>
                  <p 
                    id="right-sidebar-description" 
                    className="text-base md:text-lg text-gray-300 leading-relaxed font-medium"
                  >
                    Manage your wallet and digital assets
                  </p>
                </div>
                <button 
                  ref={firstFocusableRef}
                  onClick={toggleSidebar}
                  className="
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl
                    bg-gray-700/90 hover:bg-gray-600 active:bg-gray-500
                    border border-gray-600/50 hover:border-purple-500/60
                    text-gray-300 hover:text-white 
                    transition-all duration-200 ease-out
                    flex items-center justify-center
                    backdrop-filter blur(8px)
                    shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                    group flex-shrink-0
                  "
                  aria-label="Close profile panel"
                  onFocus={(e) => e.target.blur()}
                >
                  <FaTimes className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content with proper spacing */}
            <div className="flex-1 bg-gray-900/30 md:bg-transparent overflow-hidden">
              <div 
                className="h-full overflow-y-auto overflow-x-hidden"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
                }}
              >
                <div className="p-6 md:p-8 space-y-8 md:space-y-12">
                  {/* User profile section - Enhanced spacing */}
                  {walletConnected ? (
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-lg">
                      <div className="flex items-center space-x-6 mb-8">
                        <m.div 
                          className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-purple-400/30"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <span className="text-white font-bold text-2xl md:text-3xl">
                            {account ? account[0].toUpperCase() : ''}
                          </span>
                        </m.div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-mono text-lg md:text-xl font-bold truncate mb-2">
                            {formatAddress(account)}
                          </div>
                          <div className="text-base md:text-lg text-purple-300 font-semibold">
                            {network || 'Polygon'} Network
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 text-base md:text-lg">
                        <div className="bg-gray-700/60 backdrop-blur-sm rounded-2xl p-6 min-h-[100px] flex flex-col justify-center border border-gray-600/30 shadow-lg">
                          <span className="text-gray-400 block mb-3 font-semibold">Balance</span>
                          <span className="text-white font-bold text-lg truncate">{parseFloat(balance || 0).toFixed(4)} MATIC</span>
                        </div>
                        <div className="bg-gray-700/60 backdrop-blur-sm rounded-2xl p-6 min-h-[100px] flex flex-col justify-center border border-gray-600/30 shadow-lg">
                          <span className="text-gray-400 block mb-3 font-semibold">NFTs</span>
                          <span className="text-white font-bold text-lg">{nftsLoading ? '...' : (nfts?.length || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-10 text-center shadow-lg">
                      <FaUser className="w-24 h-24 md:w-28 md:h-28 text-gray-600 mx-auto mb-6" />
                      <p className="text-lg md:text-xl text-gray-300 font-medium">Connect your wallet to view profile</p>
                    </div>
                  )}
                  
                  {/* NFT section - Enhanced spacing and grid layout */}
                  {walletConnected && (
                    <div>
                      <h3 className="text-sm md:text-base uppercase tracking-wider text-gray-400 mb-6 md:mb-8 font-bold">
                        Your NFTs
                      </h3>
                      
                      {/* Error message */}
                      {nftError && (
                        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-2xl p-6 mb-6 flex items-center gap-4">
                          <FaExclamationTriangle className="text-yellow-400 flex-shrink-0 text-xl" />
                          <p className="text-yellow-300 text-base md:text-lg font-medium">{nftError}</p>
                        </div>
                      )}
                      
                      {nftsLoading ? (
                        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-10 md:p-12 text-center shadow-lg">
                          <div className="animate-spin w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                          <p className="text-lg md:text-xl text-gray-300 font-semibold">Loading NFTs...</p>
                          <p className="text-base md:text-lg text-gray-400 mt-3">This may take a few moments</p>
                        </div>
                      ) : nfts && Array.isArray(nfts) && nfts.length > 0 ? (
                        <div>
                          <div className="max-h-80 md:max-h-96 overflow-y-auto pr-1 -mr-1">
                            {/* Improved grid layout for better spacing */}
                            <div className="grid grid-cols-3 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                              {nfts.slice(0, 12).map((nft, idx) => (
                                <m.div 
                                  key={`nft-${idx}-${nft.tokenId || idx}`}
                                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-purple-500/30 cursor-pointer group"
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  onMouseEnter={() => setHoveredNftIndex(idx)}
                                  onMouseLeave={() => setHoveredNftIndex(null)}
                                  onClick={() => handleNftClick(nft)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleNftClick(nft);
                                    }
                                  }}
                                  aria-label={`View details for ${nft.name || `NFT ${idx + 1}`}`}
                                >
                                  {nft.image || nft.imageUrl ? (
                                    <OptimizedImage
                                      src={nft.image || nft.imageUrl}
                                      alt={nft.name || `NFT ${idx + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                      loadingStrategy="lazy"
                                      style={{ width: '100%', height: '100%' }}
                                      onError={(e) => handleNftImageError(e, nft.name || `NFT ${idx + 1}`)}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                      <div className="text-center p-2">
                                        <FaRobot className="text-gray-500 text-lg md:text-xl mx-auto mb-1" />
                                        <p className="text-[10px] md:text-xs text-gray-400 truncate px-1">
                                          {nft.name || `NFT #${nft.tokenId || idx + 1}`}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Hover overlay with view details button */}
                                  <div className={`
                                    absolute inset-0 bg-black/70 backdrop-blur-sm 
                                    flex flex-col items-center justify-center
                                    transition-opacity duration-300
                                    ${hoveredNftIndex === idx ? 'opacity-100' : 'opacity-0'}
                                  `}>
                                    <div className="text-center px-2">
                                      <h4 className="text-white font-semibold text-xs md:text-sm mb-2 truncate">
                                        {nft.name || `NFT #${nft.tokenId || idx + 1}`}
                                      </h4>
                                      <m.button
                                        className="
                                          bg-purple-600 hover:bg-purple-700 
                                          text-white px-3 py-1.5 rounded-lg 
                                          text-xs font-medium
                                          flex items-center gap-1
                                          transition-colors duration-200
                                          shadow-lg hover:shadow-purple-500/30
                                        "
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleNftClick(nft);
                                        }}
                                      >
                                        <FaEye className="text-[10px]" />
                                        View Details
                                      </m.button>
                                    </div>
                                  </div>
                                </m.div>
                              ))}
                            </div>
                          </div>
                          
                          {/* View all NFTs button - improved styling */}
                          {nfts.length > 12 && (
                            <div className="text-center mt-6">
                              <Link to="/my-nfts">
                                <m.button
                                  className="
                                    btn-nuvo-base btn-nuvo-ghost btn-nuvo-lg
                                    text-base text-purple-400 hover:text-white
                                    min-h-[56px] flex items-center justify-center w-full
                                    border-2 border-purple-500/30 hover:border-purple-400
                                    rounded-2xl backdrop-blur-sm font-semibold
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                                    transition-all duration-300
                                  "
                                  whileHover={{ x: 4 }}
                                  onClick={toggleSidebar}
                                >
                                  View all {nfts.length} NFTs →
                                </m.button>
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-10 text-center shadow-lg">
                          <FaRobot className="w-24 h-24 md:w-28 md:h-28 text-gray-600 mx-auto mb-6" />
                          <p className="text-lg md:text-xl text-gray-300 mb-3 font-semibold">No NFTs found in your collection</p>
                          <p className="text-base md:text-lg text-gray-400">NFTs will appear here once you own some</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Staking Stats Section - Enhanced spacing */}
                  {walletConnected && (
                    <div>
                      <h3 className="text-sm md:text-base uppercase tracking-wider text-gray-400 mb-6 md:mb-8 flex items-center gap-4 font-bold">
                        <FaChartLine className="text-purple-400 text-xl" /> Staking Overview
                      </h3>
                      <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 md:p-8 shadow-lg">
                        <div className="space-y-6 text-base md:text-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-semibold">Active Positions:</span>
                            <span className="text-white font-bold text-xl">
                              {depositCount || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-semibold">Pending Rewards:</span>
                            <span className="text-green-400 font-bold text-xl">
                              {parseFloat(pendingRewards || 0).toFixed(3)} POL
                            </span>
                          </div>
                          {stakingStats?.roiProgress && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">ROI Progress:</span>
                              <span className="text-purple-300 font-bold text-xl">
                                {Math.min(stakingStats.roiProgress, 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                        {(depositCount > 0) && (
                          <div className="mt-8 pt-6 border-t border-gray-600/50">
                            <Link to="/staking">
                              <m.button
                                className="
                                  btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg
                                  w-full flex items-center justify-center gap-4
                                  min-h-[64px] touch-manipulation rounded-2xl
                                  text-lg font-bold shadow-lg
                                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                                "
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={toggleSidebar}
                              >
                                <FaCoins className="text-xl" />
                                Manage Staking
                              </m.button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Profile Link Button - Enhanced */}
                  {walletConnected && (
                    <div>
                      <Link to="/profile">
                        <m.button
                          ref={lastFocusableRef}
                          className="
                            btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-xl
                            w-full flex items-center justify-center gap-4
                            min-h-[72px] touch-manipulation rounded-2xl
                            text-lg md:text-xl font-bold shadow-lg
                            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900
                          "
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={toggleSidebar}
                        >
                          <FaUser className="text-xl" />
                          <span>View Full Profile</span>
                          <FaExternalLinkAlt className="text-lg" />
                        </m.button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Bottom spacing */}
                  <div className="h-8 md:h-12"></div>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebar;
