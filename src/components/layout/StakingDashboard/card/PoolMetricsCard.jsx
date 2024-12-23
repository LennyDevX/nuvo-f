import React, { useMemo } from 'react';
import { FaChartBar, FaUsers, FaCoins, FaInfoCircle, FaGift } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { ethers } from 'ethers';
import { formatBalance } from '../../../../utils/formatters';
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
    <BaseCard title="Pool Statistics" icon={<FaChartBar className="text-red-300" />}>
      <div className="flex flex-col space-y-3">
        {/* TVL and Users Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* TVL - 2/3 width */}
          <div className="col-span-2 bg-red-900/20 backdrop-blur-sm p-3 rounded-xl border border-red-600/20 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-100/70 text-sm">Total Value Locked</span>
              <Tooltip content="Total amount of POL tokens staked in the pool">
                <FaInfoCircle className="text-red-400/60 hover:text-red-300" />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-red-50">{formatBalance(metrics.totalStaked)}</div>
              <div className="text-sm text-red-300">POL</div>
            </div>
          </div>

          {/* Users - 1/3 width */}
          <div className="bg-red-900/20 backdrop-blur-sm p-3 rounded-xl border border-red-600/20 shadow-lg">
            <div className="flex items-center gap-1.5">
              <FaUsers className="w-3.5 h-3.5 text-red-300" />
              <span className="text-red-100/70 text-sm">Users</span>
            </div>
            <div className="text-xl font-bold text-red-50 mt-1">{metrics.totalUsers}</div>
          </div>
        </div>

        {/* Rewards and Withdrawals Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-900/20 backdrop-blur-sm p-3 rounded-xl border border-red-600/20 shadow-lg">
            <div className="flex items-center gap-1.5">
              <FaCoins className="w-3.5 h-3.5 text-red-300" />
              <span className="text-red-100/70 text-sm">Rewards</span>
              <Tooltip content="Total rewards distributed to stakers">
                <FaInfoCircle className="text-red-400/60 hover:text-red-300" />
              </Tooltip>
            </div>
            <div className="text-lg font-bold text-red-50 mt-1">
              {formatBalance(metrics.rewardsDistributed)} POL
            </div>
          </div>

          <div className="bg-red-900/20 backdrop-blur-sm p-3 rounded-xl border border-red-600/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-300 animate-pulse"></div>
                <span className="text-red-100/70 text-sm"> Withdrawn</span>
                <Tooltip content="Total amount of POL withdrawn from the pool">
                  <FaInfoCircle className="text-red-400/60 hover:text-red-300" />
                </Tooltip>
              </div>
            </div>
            <div className="text-lg font-bold text-red-50 mt-1">
              {formatBalance(metrics.totalWithdrawn)} POL
            </div>
          </div>
        </div>

        {/* Community Goal Section */}
        <div className="bg-red-900/20 backdrop-blur-sm p-4 rounded-xl border border-red-600/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaGift className={`w-4 h-4 text-red-300 ${goalMetrics.isCompleted ? 'animate-bounce' : ''}`} />
              <span className="text-red-100/70 text-sm font-medium">Community Goal</span>
            </div>
            <Tooltip content={goalMetrics.isCompleted 
              ? "Goal reached! Airdrop will be distributed soon!" 
              : `${Number(goalMetrics.remainingAmount).toFixed(2)} POL more needed to reach the goal`}>
              <FaInfoCircle className="text-red-400/60 hover:text-red-300" />
            </Tooltip>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-red-100/70 mb-1">
              <span>{Number(goalMetrics.currentAmount).toFixed(2)} POL</span>
              <span>{Number(goalMetrics.goalAmount).toFixed(2)} POL</span>
            </div>
          </div>
            <div className="h-3 bg-red-900/30 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out
                  ${goalMetrics.isCompleted 
                    ? 'bg-gradient-to-r from-red-400 to-red-300 animate-pulse' 
                    : 'bg-gradient-to-r from-red-400 to-red-300'}`}
                style={{ width: `${goalMetrics.progressPercentage}%` }}
              />
            </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-100/70">
              {goalMetrics.progressPercentage.toFixed(1)}% Complete
            </span>
            <div className="text-sm text-red-100/70 flex items-center gap-1">
              <span>Airdrop Reward:</span>
              <span className={`font-medium ${goalMetrics.isCompleted ? 'text-red-300' : 'text-red-300'}`}>
                {goalMetrics.airdropReward} POL
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(PoolMetricsCard);