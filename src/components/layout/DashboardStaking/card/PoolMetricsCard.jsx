import React from 'react';
import { FaChartBar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../context/StakingContext';

const PoolMetricsCard = ({ totalPoolBalance }) => {
  const { state, STAKING_CONSTANTS } = useStaking();
  
  return (
    <BaseCard title="Pool Metrics" icon={<FaChartBar />}>
      <div className="space-y-4">
        <div className="text-2xl font-bold text-purple-400">
          {formatBalance(totalPoolBalance)} POL
        </div>
        
        <div className="space-y-2 bg-black/20 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Commission Rate:</span>
            <span className="text-gray-300">
              {STAKING_CONSTANTS?.COMMISSION * 100 || '6'}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Unique Users:</span>
            <span className="text-gray-300">
              {state?.uniqueUsersCount ?? 0}
            </span>
          </div>
          {state?.isMigrated && (
            <div className="mt-2 text-xs text-yellow-500">
              Contract has been migrated to a new version
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

export default PoolMetricsCard;
