import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTh, 
  FaList, 
  FaEthereum, 
  FaChartLine, 
  FaGem,
  FaLayerGroup // Nuevo ícono para categorías
} from 'react-icons/fa';

// Use memo to prevent unnecessary re-renders
const NFTDashboardStats = memo(({ stats, isMobile }) => {
  const { 
    totalNFTs, 
    listedNFTs, 
    totalValue, 
    uniqueCategories = 1, // Nuevo campo
    topNFTValue = '0.00'
  } = stats;

  // Animation for cards
  const cardVariants = {
    hover: { y: -5, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  };

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'sm:grid-cols-3 gap-4'} mb-6`}>
      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 col-span-1 sm:col-span-3">
        <motion.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total NFTs</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{totalNFTs}</h3>
              <p className="text-xs text-purple-300 mt-1">{listedNFTs} listed</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <FaTh size={isMobile ? 16 : 18} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Portfolio Value</p>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-400">
                {totalValue} <span className="text-xs sm:text-sm">POL</span>
              </h3>
              <p className="text-xs text-blue-300 mt-1">
                {isMobile ? 'Ⓟ' : 'Polygon'} Network
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <FaEthereum size={isMobile ? 16 : 18} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-black/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-500/20 col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Top NFT Value</p>
              <h3 className="text-xl sm:text-2xl font-bold text-green-400">
                {topNFTValue} <span className="text-xs sm:text-sm">POL</span>
              </h3>
              <p className="text-xs text-green-300 mt-1">Most valuable asset</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <FaGem size={isMobile ? 16 : 18} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats - Expandable section for desktop */}
      {!isMobile && (
        <div className="grid grid-cols-2 gap-3 col-span-3">
          {/* Unique Categories Card */}
          <motion.div 
            whileHover="hover"
            whileTap="tap"
            variants={cardVariants}
            className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Categories</p>
                <h3 className="text-2xl font-bold text-yellow-400">{uniqueCategories}</h3>
                <p className="text-xs text-yellow-300 mt-1">
                  {uniqueCategories === 1 ? 'Single category' : `${uniqueCategories} categories`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <FaLayerGroup size={18} />
              </div>
            </div>
          </motion.div>
          {/* Listed NFTs Card (sin cambios) */}
          <motion.div 
            whileHover="hover"
            whileTap="tap"
            variants={cardVariants}
            className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Listed NFTs</p>
                <h3 className="text-2xl font-bold text-fuchsia-400">{listedNFTs}</h3>
                <p className="text-xs text-fuchsia-300 mt-1">
                  {listedNFTs > 0 && totalNFTs > 0
                    ? `${Math.round((listedNFTs / totalNFTs) * 100)}% of collection` 
                    : 'None currently listed'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <FaList size={18} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Alternative mobile version - Compact summary card */}
      {isMobile && totalNFTs > 0 && (
        <motion.div 
          whileHover="hover"
          whileTap="tap"
          variants={cardVariants}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-3 rounded-xl border border-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs">Collection Summary</p>
              <div className="flex mt-1 space-x-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Listed</p>
                  <p className="text-md font-semibold text-green-400">
                    {totalNFTs > 0 ? Math.round((listedNFTs / totalNFTs) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Activity</p>
                  <p className="text-md font-semibold text-blue-400">{recentActivity}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Network</p>
                  <p className="text-md font-semibold text-purple-400">Polygon</p>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center text-white">
              <FaChartLine size={16} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
});

NFTDashboardStats.displayName = 'NFTDashboardStats';

export default NFTDashboardStats;
