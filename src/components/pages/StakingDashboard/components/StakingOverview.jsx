import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useStaking } from '../../../../context/StakingContext';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { calculateTimeBonus } from '../../../../utils/staking/stakingAnalytics';
import NetworkBadge from '../../../web3/NetworkBadge';
import { ValueDisplay } from '../ui/CommonComponents';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity
} from 'react-icons/fi';

const StakingOverview = ({ userDeposits, userInfo, stakingStats, statusMessage }) => {
  const { calculateRealAPY, getDetailedStakingStats } = useStaking();
  const [dynamicAPY, setDynamicAPY] = useState({ baseAPY: 8.76, dailyROI: 0.24 }); // Updated for SmartStaking v3.0
  const [detailedStats, setDetailedStats] = useState(null);
  
  // Calculate total staked
  const totalStaked = userDeposits?.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.amount || 0);
  }, 0) || 0;

  // Find oldest deposit timestamp
  const calculateDaysStaked = () => {
    if (!userDeposits || userDeposits.length === 0) return 0;
    
    const timestamps = userDeposits.map(d => d.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - oldestTimestamp) / (60 * 60 * 24));
  };
  
  // Fetch dynamic APY on component mount
  useEffect(() => {
    const fetchAPY = async () => {
      const apyData = await calculateRealAPY();
      setDynamicAPY(apyData);
    };
    
    fetchAPY();
  }, [calculateRealAPY]);
  
  // Fetch detailed stats if available
  useEffect(() => {
    const fetchDetailedStats = async () => {
      const signerAddress = await getDetailedStakingStats();
      if (signerAddress && userDeposits?.length > 0) {
        const stats = await getDetailedStakingStats(signerAddress);
        if (stats) {
          setDetailedStats(stats);
        }
      }
    };
    
    if (userDeposits?.length > 0) {
      fetchDetailedStats();
    }
  }, [userDeposits, getDetailedStakingStats]);
  
  const daysStaked = calculateDaysStaked();
  const timeBonus = calculateTimeBonus(daysStaked);
  const timeBonesPercentage = timeBonus * 100;
  
  // Use dynamically calculated APY instead of hardcoded value
  const baseAPY = dynamicAPY.baseAPY || 8.76; // Updated for SmartStaking v3.0
  const effectiveAPY = baseAPY + (timeBonesPercentage * 1.5);
  
  // Get monthly projected rewards if available
  const monthlyProjection = detailedStats?.projections?.oneMonth || null;

  const stakingItems = [
    {
      label: 'Total Staked',
      value: `${formatBalance(totalStaked)} POL`,
      icon: FiDollarSign,
      color: 'purple',
      subtitle: 'Staked Amount'
    },
    {
      label: 'Pending Rewards',
      value: `${formatBalance(userInfo?.pendingRewards || stakingStats?.pendingRewards || '0')} POL`,
      icon: FiTrendingUp,
      color: 'green',
      subtitle: 'Ready to Claim'
    },
    {
      label: 'Effective APY',
      value: `${effectiveAPY.toFixed(1)}%`,
      icon: FiActivity,
      color: 'blue',
      subtitle: `Base APY: ${baseAPY.toFixed(1)}% + Bonus: ${timeBonesPercentage.toFixed(1)}%`,
      verified: dynamicAPY.verified,
      monthlyProjection
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
      }
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Your Staking Portfolio</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {stakingItems.map((item, index) => {
          const colorClasses = getColorClasses(item.color);
          const IconComponent = item.icon;
          
          return (
            <m.div
              key={index}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="nuvos-marketplace-stat-card-compact group"
            >
              <div className="flex items-center gap-3">
                <div className={`nuvos-marketplace-stat-icon-container-compact ${colorClasses.bg} ${colorClasses.border}`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${colorClasses.icon} transition-transform duration-200 group-hover:scale-110`} />
                </div>
                
                <div className="nuvos-marketplace-stat-content-compact flex-1 min-w-0">
                  <div className={`nuvos-marketplace-stat-value-compact bg-gradient-to-r ${colorClasses.gradient} bg-clip-text text-transparent`}>
                    {item.value}
                    {item.verified && (
                      <span className="text-xs ml-1 text-green-400 opacity-70">(verified)</span>
                    )}
                  </div>
                  <div className="nuvos-marketplace-stat-label-compact">
                    {item.subtitle}
                  </div>
                  {item.monthlyProjection && (
                    <div className="text-xs text-indigo-400 mt-1">
                      Est. monthly: {formatBalance(item.monthlyProjection)} POL
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          );
        })}
      </div>
      
      {/* Status Message */}
      {statusMessage && (
        <m.div 
          whileHover={{ y: -2 }}
          className={`mt-6 p-3 rounded-lg transition-all duration-200 ${
            statusMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/40 text-red-400' :
            statusMessage.type === 'success' ? 'bg-green-900/20 border border-green-500/40 text-green-400' :
            'bg-blue-900/20 border border-blue-500/40 text-blue-400'
          }`}
        >
          {statusMessage.text}
        </m.div>
      )}
    </div>
  );
};

export default StakingOverview;
