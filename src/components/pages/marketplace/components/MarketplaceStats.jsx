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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="nuvos-marketplace-stat-card"
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 ${item.color} bg-current/10 rounded-xl mb-4`}>
            <item.icon className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {item.value}
          </div>
          <div className="text-gray-400 text-sm">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceStats;
