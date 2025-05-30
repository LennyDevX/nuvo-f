import React, { useState, useEffect, useCallback } from 'react';
import { useStaking } from '../../../context/StakingContext';
import { FaHistory } from 'react-icons/fa';

// Import modular components
import StakingOverview from './components/StakingOverview';
import StakingStats from './components/StakingStats';
import StakingActions from './components/StakingActions';
import TimeBonus from './components/TimeBonus';
import RewardsProjection from './components/RewardsProjection';

const StakingDashboard = ({ account }) => {
  const { 
    state, 
    STAKING_CONSTANTS,
    refreshUserInfo, 
  } = useStaking();
  
  const [isPending, setIsPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const { userDeposits, userInfo, stakingStats, currentTx } = state;

  useEffect(() => {
    if (account) {
      refreshUserInfo(account);
      
      const interval = setInterval(() => {
        refreshUserInfo(account);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [account, refreshUserInfo]);

  // Memoize updateStatus to prevent it from changing on every render
  const updateStatus = useCallback((type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  }, []);
  
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8">
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Top Overview Card */}
        <StakingOverview 
          userDeposits={userDeposits} 
          userInfo={userInfo}
          stakingStats={stakingStats}
          statusMessage={statusMessage}
        />
        
        {/* Main grid - single column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Staking Stats */}
          <div className="order-1">
            <StakingStats
              userDeposits={userDeposits}
              maxDeposits={STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}
            />
          </div>
          
          {/* Middle Column: Time Bonus */}
          <div className="order-3 lg:order-2">
            <TimeBonus userDeposits={userDeposits} />
          </div>
          
          {/* Right Column: Rewards Projection */}
          <div className="order-2 lg:order-3">
            <RewardsProjection userDeposits={userDeposits} userInfo={userInfo} />
          </div>
        </div>
        
        {/* Actions Section - Full Width */}
        <div>
          <StakingActions
            account={account}
            userInfo={userInfo}
            stakingStats={stakingStats}
            userDeposits={userDeposits}
            isPending={isPending}
            setIsPending={setIsPending}
            updateStatus={updateStatus}
            refreshUserInfo={refreshUserInfo}
            currentTx={currentTx}
          />
        </div>
        
        {/* Contract Info - Positioned naturally below content */}
        
      </div>
    </div>
  );
};

export default StakingDashboard;
