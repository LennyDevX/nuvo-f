import React from 'react';
import { FaEthereum, FaTag, FaUsers, FaCube } from 'react-icons/fa';

const MarketplaceStats = ({ stats }) => {
  return (
    <div className="nuvos-marketplace-stats-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Items */}
        <div className="nuvos-marketplace-stat-card-compact">
          <div className="nuvos-marketplace-stat-icon-container-compact">
            <FaCube className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
          </div>
          <div className="nuvos-marketplace-stat-content-compact">
            <div className="nuvos-marketplace-stat-value-compact">
              {stats.totalItems}
            </div>
            <div className="nuvos-marketplace-stat-label-compact">
              Listed NFTs
            </div>
          </div>
        </div>

        {/* Total Volume */}
        <div className="nuvos-marketplace-stat-card-compact">
          <div className="nuvos-marketplace-stat-icon-container-compact">
            <FaEthereum className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
          </div>
          <div className="nuvos-marketplace-stat-content-compact">
            <div className="nuvos-marketplace-stat-value-compact">
              {stats.totalVolume} POL
            </div>
            <div className="nuvos-marketplace-stat-label-compact">
              Total Volume
            </div>
          </div>
        </div>

        {/* Floor Price */}
        <div className="nuvos-marketplace-stat-card-compact">
          <div className="nuvos-marketplace-stat-icon-container-compact">
            <FaTag className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
          </div>
          <div className="nuvos-marketplace-stat-content-compact">
            <div className="nuvos-marketplace-stat-value-compact">
              {stats.floorPrice} POL
            </div>
            <div className="nuvos-marketplace-stat-label-compact">
              Floor Price
            </div>
          </div>
        </div>

        {/* Unique Owners */}
        <div className="nuvos-marketplace-stat-card-compact">
          <div className="nuvos-marketplace-stat-icon-container-compact">
            <FaUsers className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
          </div>
          <div className="nuvos-marketplace-stat-content-compact">
            <div className="nuvos-marketplace-stat-value-compact">
              {stats.owners}
            </div>
            <div className="nuvos-marketplace-stat-label-compact">
              Owners
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStats;
