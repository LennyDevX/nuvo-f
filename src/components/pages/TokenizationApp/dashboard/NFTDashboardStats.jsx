import React, { memo } from 'react';
import { m } from 'framer-motion';
import { 
  FaTh, 
  FaList, 
  FaEthereum, 
  FaChartLine, 
  FaGem,
  FaLayerGroup
} from 'react-icons/fa';

// Use memo to prevent unnecessary re-renders
const NFTDashboardStats = memo(({ stats, isMobile }) => {
  // Use a more reliable mobile detection
  const useMobileLayout = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024);
  
  const { 
    totalNFTs, 
    listedNFTs, 
    totalValue, 
    uniqueCategories = 1,
    topNFTValue = '0.00',
    recentActivity = 0
  } = stats || {};

  // Animation for cards
  const cardVariants = {
    hover: { y: -5, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  };

  return (
    <div className="mb-6">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <m.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-purple-500/20 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total NFTs</p>
              <h3 className="text-lg sm:text-xl font-bold text-white">{totalNFTs}</h3>
              <p className="text-xs text-purple-300 mt-1">{listedNFTs} listed</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <FaTh size={16} />
            </div>
          </div>
        </m.div>
        
        <m.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-purple-500/20 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Portfolio Value</p>
              <h3 className="text-lg sm:text-xl font-bold text-blue-400">
                {totalValue} <span className="text-xs">POL</span>
              </h3>
              <p className="text-xs text-blue-300 mt-1">
                Polygon Network
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <FaEthereum size={16} />
            </div>
          </div>
        </m.div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <m.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-purple-500/20 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Top NFT Value</p>
              <h3 className="text-lg sm:text-xl font-bold text-green-400">
                {topNFTValue} <span className="text-xs">POL</span>
              </h3>
              <p className="text-xs text-green-300 mt-1">Most valuable</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <FaGem size={16} />
            </div>
          </div>
        </m.div>
        
        <m.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-purple-500/20 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Categories</p>
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400">{uniqueCategories}</h3>
              <p className="text-xs text-yellow-300 mt-1">
                {uniqueCategories === 1 ? 'Single type' : `${uniqueCategories} types`}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <FaLayerGroup size={16} />
            </div>
          </div>
        </m.div>
      </div>

      {/* Activity Summary - Show on mobile or when explicitly requested */}
      {totalNFTs > 0 && (
        <m.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-3 rounded-xl border border-purple-500/20 mt-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs">Activity Summary</p>
              <div className="flex mt-1 space-x-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Listed</p>
                  <p className="text-sm font-semibold text-green-400">
                    {totalNFTs > 0 ? Math.round((listedNFTs / totalNFTs) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Activity</p>
                  <p className="text-sm font-semibold text-blue-400">{recentActivity}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Network</p>
                  <p className="text-sm font-semibold text-purple-400">Polygon</p>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center text-white">
              <FaChartLine size={14} />
            </div>
          </div>
        </m.div>
      )}
    </div>
  );
});

NFTDashboardStats.displayName = 'NFTDashboardStats';

export default NFTDashboardStats;
