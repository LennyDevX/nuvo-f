import React from 'react';
import { FaClock, FaGift, FaLock } from 'react-icons/fa';
import { calculateTimeBonus } from '../../../../utils/staking/stakingAnalytics';
import { StakingSection, ProgressBar, ValueDisplay } from '../ui/CommonComponents';
import { STAKING_CONSTANTS } from '../../../../utils/staking/constants';

const TimeBonus = ({ userDeposits }) => {
  // Calculate days staked
  const calculateDaysStaked = () => {
    if (!userDeposits || userDeposits.length === 0) return 0;
    
    const timestamps = userDeposits.map(d => d.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - oldestTimestamp) / (24 * 60 * 60));
  };
  
  const daysStaked = calculateDaysStaked();
  
  // Calculate current bonus based on new system
  const getCurrentBonus = () => {
    if (daysStaked >= 365) return 5.0;
    if (daysStaked >= 180) return 2.0;
    if (daysStaked >= 90) return 1.0;
    if (daysStaked >= 30) return 0.5;
    return 0;
  };
  
  const currentBonus = getCurrentBonus();
  
  // Calculate days until next bonus threshold
  const calculateDaysUntilNextThreshold = () => {
    if (daysStaked >= 365) return 0;
    if (daysStaked >= 180) return 365 - daysStaked;
    if (daysStaked >= 90) return 180 - daysStaked;
    if (daysStaked >= 30) return 90 - daysStaked;
    return 30 - daysStaked;
  };
  
  const daysUntilNextThreshold = calculateDaysUntilNextThreshold();
  
  // Get next bonus amount
  const getNextBonusAmount = () => {
    if (daysStaked >= 365) return null;
    if (daysStaked >= 180) return 5.0;
    if (daysStaked >= 90) return 2.0;
    if (daysStaked >= 30) return 1.0;
    return 0.5;
  };
  
  const nextBonusAmount = getNextBonusAmount();
  
  return (
    <StakingSection title="Time Bonus" icon={<FaClock />}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <ValueDisplay 
            label="Current Bonus" 
            value={currentBonus.toFixed(1)}
            suffix="%"
          />
          
          {daysUntilNextThreshold > 0 && nextBonusAmount && (
            <ValueDisplay 
              label={`Next: +${nextBonusAmount}% in`}
              value={daysUntilNextThreshold}
              suffix="days"
            />
          )}
        </div>
        
        <ProgressBar 
          value={daysStaked} 
          max={365} 
          label="Progress to Max Bonus" 
          barColor="bg-gradient-to-r from-indigo-600 to-purple-600"
        />
        
        <div className="mt-4 space-y-3">
          <h4 className="text-base font-medium text-white mb-3 flex items-center">
            <FaGift className="text-yellow-400 mr-2" />
            Lockup Bonus Tiers
          </h4>
          
          <BonusTier days={30} bonus={0.5} currentDays={daysStaked} />
          <BonusTier days={90} bonus={1.0} currentDays={daysStaked} />
          <BonusTier days={180} bonus={2.0} currentDays={daysStaked} />
          <BonusTier days={365} bonus={5.0} currentDays={daysStaked} />
          
          <div className="text-xs text-slate-400 mt-5 py-2 px-3 bg-slate-800/40 rounded-lg">
            <div className="flex items-start">
              <FaLock className="text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-white mb-1">New Lockup System</div>
                <div>
                  Bonuses are now based on your chosen lockup period when staking. 
                  Longer commitments earn higher bonuses automatically applied to your rewards.
                </div>
              </div>
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

export default TimeBonus;
