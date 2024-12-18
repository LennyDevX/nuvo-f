import React, { useMemo, useEffect, useState } from 'react';
import { FaChartBar, FaUsers, FaChartLine, FaCoins } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance, formatPercentage } from '../../../../utils/formatters';
import { useStaking } from '../../../context/StakingContext';
import { ethers } from 'ethers';

const MetricItem = ({ icon, label, value, valueClass = "text-gray-300" }) => (
  <div className="flex items-center justify-between p-2">
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
  </div>
);

const PoolMetricsCard = () => {
  const { state } = useStaking();
  
  const metrics = useMemo(() => ({
    totalStaked: state?.totalPoolBalance || '0',
    totalUsers: state?.uniqueUsersCount || 0,
    rewardsDistributed: state?.poolMetrics?.rewardsDistributed || '0',
    totalWithdrawn: state?.poolMetrics?.totalWithdrawn || '0',
  }), [state.totalPoolBalance, state.uniqueUsersCount, state.poolMetrics]);

  return (
    <BaseCard title="Pool Statistics" icon={<FaChartBar />}>
      <div className="flex flex-col space-y-4">
        {/* Principal Metric - TVL */}
        <div className="bg-black/20 rounded-lg p-4">
          <span className="text-sm text-gray-400">Total Value Locked</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {formatBalance(metrics.totalStaked)} POL
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3">
          <MetricItem
            icon={<FaUsers className="w-4 h-4" />}
            label="Total Users"
            value={metrics.totalUsers}
            valueClass="text-purple-400"
          />
          <MetricItem
            icon={<FaCoins className="w-4 h-4" />}
            label="Total Rewards Claimed"
            value={`${formatBalance(metrics.rewardsDistributed)} POL`}
            valueClass="text-green-400"
          />
          <MetricItem
            icon={<FaChartLine className="w-4 h-4" />}
            label="Total Principal Withdrawn"
            value={`${formatBalance(metrics.totalWithdrawn)} POL`}
            valueClass="text-yellow-400"
          />
        </div>

        {/* Pool Health Indicator */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Pool Status</span>
            <span className="text-xs text-green-400">Active</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300" 
              style={{ width: `${Math.min((Number(metrics.totalStaked) / 1000000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(PoolMetricsCard);