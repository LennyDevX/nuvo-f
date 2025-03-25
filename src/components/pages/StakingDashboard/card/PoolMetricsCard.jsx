import React, { useMemo } from 'react';
import { FaChartBar, FaUsers, FaCoins, FaInfoCircle, FaGift, FaHistory, FaCalendarAlt, FaShieldAlt, FaLock, FaStar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { ethers } from 'ethers';
import { formatBalance } from '../../../../utils/Formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../Tooltip';

const PoolMetricsCard = () => {
  const { state } = useStaking();
  
  const metrics = useMemo(() => ({
    totalStaked: state?.totalPoolBalance || '0',
    totalUsers: state?.uniqueUsersCount || 0,
    rewardsDistributed: state?.poolMetrics?.rewardsDistributed || '0',
    totalWithdrawn: state?.poolMetrics?.totalWithdrawn || '0',
  }), [state.totalPoolBalance, state.uniqueUsersCount, state.poolMetrics]);

  const goalMetrics = useMemo(() => {
    const goalAmount = '2000'; // 2000 POL tokens goal
    // Convert balance from wei to POL tokens (18 decimals)
    const currentAmount = state?.totalPoolBalance 
      ? Number(ethers.formatEther(state.totalPoolBalance))
      : 0;
    
    // Calculate percentage with proper decimal handling
    const progressPercentage = currentAmount > 0 
      ? Math.min((currentAmount / Number(goalAmount)) * 100, 100)
      : 0;

    const remainingAmount = Math.max(Number(goalAmount) - currentAmount, 0);
    const airdropReward = Number(goalAmount) * 0.30; // 30% of goal amount

    return {
      goalAmount,
      progressPercentage,
      currentAmount: currentAmount.toString(),
      remainingAmount: remainingAmount.toString(),
      isCompleted: currentAmount >= Number(goalAmount),
      airdropReward: airdropReward.toFixed(2)
    };
  }, [state.totalPoolBalance]);

  return (
    <BaseCard title="Pool Statistics" icon={<FaChartBar className="text-indigo-400" />}>
      <div className="flex flex-col h-full space-y-4">
        {/* TVL and Users Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* TVL - 2/3 width */}
          <div className="col-span-2 bg-gradient-to-br from-indigo-900/30 to-violet-900/20 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-medium">Total Value Locked</span>
              <Tooltip content="Total amount of POL tokens currently staked in the staking pool">
                <FaInfoCircle className="text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-2xl font-medium text-slate-100">
                {Number(formatBalance(metrics.totalStaked)).toFixed(3)}
              </div>
              <div className="text-sm text-slate-400">POL</div>
            </div>
          </div>

          {/* Users - 1/3 width */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/20 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaUsers className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400 text-xs font-medium">Users</span>
            </div>
            <div className="text-xl font-medium text-slate-100 mt-1">
              {metrics.totalUsers}
            </div>
          </div>
        </div>

        {/* Rewards and Withdrawals Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaCoins className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400 text-xs font-medium">Rewards</span>
              <Tooltip content="Total rewards distributed to stakers since pool deployment">
                <FaInfoCircle className="text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <div className="text-lg font-medium text-slate-100 mt-1">
              {formatBalance(metrics.rewardsDistributed)} POL
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaHistory className="w-4 h-4 text-indigo-400" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-slate-400 text-xs font-medium">Withdrawn</span>
            </div>
            <div className="text-lg font-medium text-slate-100 mt-1">
              {formatBalance(metrics.totalWithdrawn)} POL
            </div>
          </div>
        </div>

        {/* Community Goal Section */}
        <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/20 p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaGift className={`w-4 h-4 text-fuchsia-400 ${goalMetrics.isCompleted ? 'animate-bounce' : ''}`} />
              <span className="text-slate-300 text-sm font-medium">Community Goal</span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-fuchsia-900/30 text-fuchsia-400 font-medium rounded-full">
              {goalMetrics.progressPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="mb-3">
            <div className="w-full bg-slate-800/60 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out
                  bg-gradient-to-r from-indigo-500 to-fuchsia-400`}
                style={{ width: `${goalMetrics.progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Current: <b className="text-slate-300">{Number(goalMetrics.currentAmount).toFixed(2)} POL</b></span>
              <span className="text-xs text-slate-400">Goal: <b className="text-slate-300">{Number(goalMetrics.goalAmount).toFixed(2)} POL</b></span>
            </div>
            
          </div>
        </div>

        {/* New Staking Information Section */}
        
      </div>
    </BaseCard>
  );
};

export default React.memo(PoolMetricsCard);