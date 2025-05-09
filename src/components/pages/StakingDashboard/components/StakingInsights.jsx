import React from 'react';
import { FaChartBar } from 'react-icons/fa';
import { calculateTimeBonus } from '../../../../utils/staking/stakingAnalytics';
import { StakingSection, ValueDisplay, ProgressBar } from '../ui/CommonComponents';

const StakingInsights = ({ userDeposits, maxDeposits }) => {
  // Calculate days staked
  const calculateDaysStaked = () => {
    if (!userDeposits || userDeposits.length === 0) return 0;
    
    const timestamps = userDeposits.map(d => d.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - oldestTimestamp) / (60 * 60 * 24));
  };
  
  const daysStaked = calculateDaysStaked();
  const timeBonus = calculateTimeBonus(daysStaked);
  const timeBonesPercentage = timeBonus * 100;
  
  return (
    <StakingSection title="Staking Insights" icon={<FaChartBar />}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <ValueDisplay label="Days Staked" value={daysStaked} suffix="days" />
          <ValueDisplay label="Time Bonus" value={timeBonesPercentage.toFixed(1)} suffix="%" />
        </div>
        
        <ProgressBar 
          value={daysStaked} 
          max={365} 
          label="Days Until Max Bonus" 
          barColor="bg-gradient-to-r from-indigo-600 to-purple-600"
        />
        
        <ProgressBar 
          value={userDeposits?.length || 0} 
          max={maxDeposits} 
          label="Deposit Slots Used" 
          barColor="bg-gradient-to-r from-teal-500 to-emerald-500"
        />
        
        {/* Time Bonus Information */}
        <div className="mt-4 pt-5 border-t border-slate-700/30">
          <h4 className="text-base font-medium text-white mb-3">Time Bonus Tiers</h4>
          
          <div className="space-y-3">
            <BonusTier days={90} bonus={1} currentDays={daysStaked} />
            <BonusTier days={180} bonus={3} currentDays={daysStaked} />
            <BonusTier days={365} bonus={5} currentDays={daysStaked} />
            
            <div className="text-xs text-slate-400 mt-5 py-2 px-3 bg-slate-800/40 rounded-lg">
              Time bonuses are automatically applied to your staking rewards
              and increase your effective APY.
            </div>
          </div>
        </div>
      </div>
    </StakingSection>
  );
};

const BonusTier = ({ days, bonus, currentDays }) => (
  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-800/40 transition-colors">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${currentDays >= days ? 'bg-green-500' : 'bg-slate-600'}`}></div>
      <span className="text-slate-300">{days} Day Bonus</span>
    </div>
    <span className="text-white">+{bonus}%</span>
  </div>
);

export default StakingInsights;
