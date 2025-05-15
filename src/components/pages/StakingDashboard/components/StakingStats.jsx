import React from 'react';
import { FaChartBar } from 'react-icons/fa';
import { StakingSection, ProgressBar, ValueDisplay } from '../ui/CommonComponents';

const StakingStats = ({ userDeposits, maxDeposits }) => {
  // Calculate days staked
  const calculateDaysStaked = () => {
    if (!userDeposits || userDeposits.length === 0) return 0;
    
    const timestamps = userDeposits.map(d => d.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - oldestTimestamp) / (24 * 60 * 60));
  };
  
  const daysStaked = calculateDaysStaked();
  const totalAmount = userDeposits?.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0) || 0;
  const averageAmount = userDeposits?.length > 0 ? totalAmount / userDeposits.length : 0;
  
  return (
    <StakingSection title="Staking Statistics" icon={<FaChartBar />}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <ValueDisplay 
            label="Active Stakes" 
            value={userDeposits?.length || 0} 
            suffix="deposits"
          />
          <ValueDisplay 
            label="Days Staking" 
            value={daysStaked} 
            suffix="days"
          />
        </div>
        
        <ProgressBar 
          value={userDeposits?.length || 0} 
          max={maxDeposits} 
          label="Deposit Slots Used" 
          barColor="bg-gradient-to-r from-teal-500 to-emerald-500"
        />
        
        {userDeposits?.length > 0 && (
          <div className="pt-4 border-t border-slate-700/30">
            <div className="text-sm text-slate-400 mb-3">Deposit Summary</div>
            <div className="text-xs text-slate-400 grid grid-cols-2 gap-y-2">
              <span>Average Deposit:</span>
              <span className="text-white text-right">{averageAmount.toFixed(2)} POL</span>
              
              <span>Current Position Age:</span>
              <span className="text-white text-right">
                {daysStaked > 0 ? `${daysStaked} days` : 'Today'}
              </span>
              
              <span>Total Deposits:</span>
              <span className="text-white text-right">{userDeposits.length} position{userDeposits.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Note: Position age resets after claiming rewards or withdrawing
            </div>
          </div>
        )}
        
        <div className="text-xs text-slate-400 mt-4 py-2 px-3 bg-slate-800/40 rounded-lg">
          You can have up to {maxDeposits} different staking positions in your account.
        </div>
      </div>
    </StakingSection>
  );
};

export default StakingStats;