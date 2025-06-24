import React from 'react';
import { m } from 'framer-motion';
import { 
  FiPackage, 
  FiDollarSign, 
  FiUsers, 
  FiTrendingUp
} from 'react-icons/fi';

const MarketplaceStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Listed NFTs',
      value: stats.totalItems || 0,
      icon: FiPackage,
      color: 'purple',
      subtitle: 'Available items'
    },
    {
      label: 'Total Volume',
      value: `${stats.totalVolume || '0'} POL`,
      icon: FiDollarSign,
      color: 'blue',
      subtitle: 'Trading volume'
    },
    {
      label: 'Floor Price',
      value: `${stats.floorPrice || '0'} POL`,
      icon: FiTrendingUp,
      color: 'green',
      subtitle: 'Lowest price'
    },
    {
      label: 'Owners',
      value: stats.owners || 0,
      icon: FiUsers,
      color: 'pink',
      subtitle: 'Unique holders'
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
      blue: {
        icon: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        gradient: 'from-blue-400 to-blue-600'
      },
      green: {
        icon: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        gradient: 'from-green-400 to-green-600'
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
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
    </div>
  );
};

export default MarketplaceStats;
