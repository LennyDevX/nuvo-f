import React, { useState, useEffect } from 'react';
import { useStaking } from '../../../context/StakingContext';
import { FaHistory } from 'react-icons/fa';

// Import modular components
import StakingOverview from './components/StakingOverview';
import StakingInsights from './components/StakingInsights';
import StakingActions from './components/StakingActions';

const StakingDashboard = ({ account }) => {
  const { 
    state, 
    STAKING_CONSTANTS,
    refreshUserInfo, 
  } = useStaking();
  
  const [isPending, setIsPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const { userDeposits, userInfo, stakingStats } = state;

  useEffect(() => {
    if (account) {
      refreshUserInfo(account);
      
      const interval = setInterval(() => {
        refreshUserInfo(account);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [account, refreshUserInfo]);

  // Update status message handler function
  const updateStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };
  
  return (
    <div className="w-full">
      {/* Top Overview Card */}
      <StakingOverview 
        userDeposits={userDeposits} 
        userInfo={userInfo}
        stakingStats={stakingStats}
        statusMessage={statusMessage}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combined Staking Overview & Time Bonus */}
        <StakingInsights
          userDeposits={userDeposits}
          maxDeposits={STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}
        />
        
        {/* Combined Rewards & Deposit/Withdraw */}
        <StakingActions
          account={account}
          userInfo={userInfo}
          stakingStats={stakingStats}
          userDeposits={userDeposits}
          isPending={isPending}
          setIsPending={setIsPending}
          updateStatus={updateStatus}
          refreshUserInfo={refreshUserInfo}
        />
      </div>
      
      {/* Contract Info - Minimal */}
      <div className="text-center mt-8 text-xs text-slate-400">
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
