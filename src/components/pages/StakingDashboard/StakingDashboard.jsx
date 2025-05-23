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
    <div className="w-full">
      {/* Top Overview Card */}
      <StakingOverview 
        userDeposits={userDeposits} 
        userInfo={userInfo}
        stakingStats={stakingStats}
        statusMessage={statusMessage}
      />
      
      {/* Main 3-column grid for desktop, stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Staking Stats */}
        <div>
          <StakingStats
            userDeposits={userDeposits}
            maxDeposits={STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}
          />
        </div>
        
        {/* Middle Column: Time Bonus */}
        <div>
          <TimeBonus userDeposits={userDeposits} />
        </div>
        
        {/* Right Column: Rewards Projection */}
        <div>
          <RewardsProjection userDeposits={userDeposits} userInfo={userInfo} />
        </div>
      </div>
      
      {/* Actions Section - Full Width */}
      <div className="mb-6">
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
      
      {/* Contract Info - Minimal */}
      <div className="text-center mt-4 text-xs text-slate-400">
        <div className="inline-flex items-center bg-slate-800/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-900/20">
          Smart Staking Contract V1.0
          <a 
            href="https://polygonscan.com/address/0x54ebebc65bcbcc7693cb83918fcd0115d71046e2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-indigo-400 hover:text-indigo-300"
          >
            <FaHistory className="inline-block ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;
