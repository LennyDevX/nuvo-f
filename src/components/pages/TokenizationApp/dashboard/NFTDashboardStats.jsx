import React, { memo } from 'react';
import { m } from 'framer-motion';
import { 
  FiPackage, 
  FiDollarSign, 
  FiTrendingUp, 
  FiLayers,
  FiActivity
} from 'react-icons/fi';
import { FaRedo } from 'react-icons/fa';
import { normalizeCategory } from '../../../../utils/blockchain/blockchainUtils';

// Use memo to prevent unnecessary re-renders
const NFTDashboardStats = memo(({ stats, isMobile, nfts = [], onRefresh }) => {
  // Use a more reliable mobile detection
  const useMobileLayout = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024);
  
  const { 
    totalNFTs, 
    listedNFTs, 
    totalValue, 
    topNFTValue = '0.00',
    recentActivity = 0
  } = stats || {};

  // Calculate unique categories properly from NFTs array
  const calculateUniqueCategories = () => {
    if (!nfts || nfts.length === 0) {
      console.log('No NFTs found for category calculation');
      return 0;
    }
    
    console.log('Calculating categories from NFTs:', nfts.map(nft => ({ id: nft.tokenId, category: nft.category })));
    
    const uniqueCategories = new Set();
    nfts.forEach(nft => {
      if (nft.category) {
        const normalizedCategory = normalizeCategory(nft.category);
        console.log(`NFT ${nft.tokenId}: original category "${nft.category}" -> normalized "${normalizedCategory}"`);
        uniqueCategories.add(normalizedCategory);
      }
    });
    
    console.log('Unique categories found:', Array.from(uniqueCategories));
    return uniqueCategories.size;
  };

  const actualUniqueCategories = calculateUniqueCategories();

  const statItems = [
    {
      label: 'Total NFTs',
      value: totalNFTs || 0,
      icon: FiPackage,
      color: 'purple',
      subtitle: `${listedNFTs || 0} listed`
    },
    {
      label: 'Portfolio Value',
      value: `${totalValue || '0'} POL`,
      icon: FiDollarSign,
      color: 'green',
      subtitle: 'Polygon Network'
    },
    {
      label: 'Top NFT Value',
      value: `${topNFTValue} POL`,
      icon: FiTrendingUp,
      color: 'blue',
      subtitle: 'Most valuable'
    },
    {
      label: 'Categories',
      value: actualUniqueCategories,
      icon: FiLayers,
      color: 'pink',
      subtitle: actualUniqueCategories === 1 ? '1 type' : `${actualUniqueCategories} types`
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        icon: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        gradient: 'from-purple-400 to-purple-600'
      },
      green: {
        icon: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        gradient: 'from-green-400 to-green-600'
      },
      blue: {
        icon: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        gradient: 'from-blue-400 to-blue-600'
      },
      pink: {
        icon: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        gradient: 'from-pink-400 to-pink-600'
      }
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="nuvos-marketplace-stats-container">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-4">
        {statItems.map((item, index) => {
          const colorClasses = getColorClasses(item.color);
          const IconComponent = item.icon;
          
          return (
            <m.div
              key={index}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="nuvos-marketplace-stat-card-compact group"
            >
              {/* Row layout: Icon on left, content on right */}
              <div className="flex items-center gap-3">
                <div className={`nuvos-marketplace-stat-icon-container-compact ${colorClasses.bg} ${colorClasses.border}`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${colorClasses.icon} transition-transform duration-200 group-hover:scale-110`} />
                </div> 
                
                <div className="nuvos-marketplace-stat-content-compact flex-1 min-w-0">  
                  <div className={`nuvos-marketplace-stat-value-compact bg-gradient-to-r ${colorClasses.gradient} bg-clip-text text-transparent`}> 
                    {item.value}
                  </div> 
                  <div className="nuvos-marketplace-stat-label-compact">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            </m.div>
          );
        })}
      </div>

      {/* Activity Summary - Show when there are NFTs */}
      {totalNFTs > 0 && (
        <m.div 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="nuvos-marketplace-stat-card-compact group col-span-2 md:col-span-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="nuvos-marketplace-stat-icon-container-compact bg-blue-500/10 border-blue-500/20">
                <FiActivity className="w-4 h-4 md:w-5 md:h-5 text-blue-400 transition-transform duration-200 group-hover:scale-110" />
              </div>
              
              <div className="nuvos-marketplace-stat-content-compact">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent nuvos-marketplace-stat-value-compact">
                  Activity Summary
                </div>
                <div className="flex gap-4 mt-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Listed</p>
                    <p className="text-sm font-semibold text-green-400">
                      {totalNFTs > 0 ? Math.round((listedNFTs / totalNFTs) * 100) : 0}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Network</p>
                    <p className="text-sm font-semibold text-purple-400">Polygon</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Types</p>
                    <p className="text-sm font-semibold text-pink-400">{actualUniqueCategories}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Refresh button aligned to the right */}
            <button 
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 rounded border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 flex-shrink-0"
            >
              <FaRedo className="text-[10px]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </m.div>
      )}
    </div>
  );
});

NFTDashboardStats.displayName = 'NFTDashboardStats';

export default NFTDashboardStats;
