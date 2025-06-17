import React from 'react';
import { FiTrendingUp, FiUsers, FiPackage, FiDollarSign } from 'react-icons/fi';

const MarketplaceStats = ({ stats }) => {
  const statItems = [
    {
      icon: FiPackage,
      label: 'Total Items',
      value: stats.totalItems.toLocaleString(),
      color: 'text-purple-400'
    },
    {
      icon: FiDollarSign,
      label: 'Total Volume',
      value: `${stats.totalVolume} POL`,
      color: 'text-green-400'
    },
    {
      icon: FiTrendingUp,
      label: 'Floor Price',
      value: `${stats.floorPrice} POL`,
      color: 'text-blue-400'
    },
    {
      icon: FiUsers,
      label: 'Owners',
      value: stats.owners.toLocaleString(),
      color: 'text-pink-400'
    }
  ];

  return (
    <div className="nuvos-marketplace-stats-grid">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="nuvos-marketplace-stat-card"
        >
          <div className="nuvos-marketplace-stat-icon">
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="nuvos-marketplace-stat-content">
            <div className="nuvos-marketplace-stat-value">
              {item.value}
            </div>
            <div className="nuvos-marketplace-stat-label">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceStats;
