import React, { useState, useEffect } from 'react';
import { useStaking } from '../../../../context/StakingContext';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { calculateTimeBonus } from '../../../../utils/staking/stakingAnalytics';
import NetworkBadge from '../../../web3/NetworkBadge';
import { ValueDisplay } from '../ui/CommonComponents';

const StakingOverview = ({ userDeposits, userInfo, stakingStats, statusMessage }) => {
  const { calculateRealAPY, getDetailedStakingStats } = useStaking();
  const [dynamicAPY, setDynamicAPY] = useState({ baseAPY: 88, dailyROI: 0.24 });
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
  const baseAPY = dynamicAPY.baseAPY;
  const effectiveAPY = baseAPY + (timeBonesPercentage * 1.5);
  
  // Get monthly projected rewards if available
  const monthlyProjection = detailedStats?.projections?.oneMonth || null;

  return (
    <div className="nuvos-card mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Your Staking Portfolio</h2>
        <NetworkBadge />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ValueDisplay 
          label="Total Staked" 
          value={formatBalance(totalStaked)}
          suffix="POL" 
          className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/20 hover:bg-slate-800/40 transition-all"
        />
        
        <ValueDisplay 
          label="Pending Rewards" 
          value={formatBalance(userInfo?.pendingRewards || stakingStats?.pendingRewards || '0')}
          suffix="POL" 
          className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/20 hover:bg-slate-800/40 transition-all"
        />
        
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/20 hover:bg-slate-800/40 transition-all">
          <div className="text-sm text-slate-400 mb-1">Effective APY</div>
          <div className="text-xl font-medium text-white">
            {effectiveAPY.toFixed(2)} <span className="text-base text-slate-300">%</span>
            {dynamicAPY.verified && (
              <span className="text-xs ml-1 text-green-400 opacity-70">(blockchain verified)</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Base: {baseAPY}% + Time Bonus: {timeBonesPercentage.toFixed(1)}%
          </div>
          {monthlyProjection && (
            <div className="text-xs text-indigo-400 mt-2">
              Est. monthly: {formatBalance(monthlyProjection)} POL
            </div>
          )}
        </div>
      </div>
      
      {/* Status Message */}
      {statusMessage && (
        <div 
          className={`mt-6 p-3 rounded-lg ${
            statusMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/40 text-red-400' :
            statusMessage.type === 'success' ? 'bg-green-900/20 border border-green-500/40 text-green-400' :
            'bg-blue-900/20 border border-blue-500/40 text-blue-400'
          }`}
        >
          {statusMessage.text}
        </div>
      )}
    </div>
  );
};

export default StakingOverview;
