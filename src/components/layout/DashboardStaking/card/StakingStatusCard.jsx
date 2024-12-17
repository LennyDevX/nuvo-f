import React, { useEffect, useMemo } from 'react';
import { FaWallet } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../context/StakingContext';

const StakingStatusCard = ({ account, depositAmount }) => {
  const { state, STAKING_CONSTANTS, refreshUserInfo, formatWithdrawDate } = useStaking();
  const { stakingStats, userDeposits, userInfo } = state;

  useEffect(() => {
    if (account) {
      refreshUserInfo(account);
    }
  }, [account, refreshUserInfo]);

  // Memoize the calculated values to prevent unnecessary re-renders
  const memoizedValues = useMemo(() => ({
    actualDepositsCount: userDeposits?.length || 0,
    actualRemainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - (userDeposits?.length || 0),
    lastWithdrawDate: stakingStats.lastWithdraw ? formatWithdrawDate(stakingStats.lastWithdraw) : 'Never',
    totalStaked: userInfo?.totalStaked || '0',
    timeBonus: userInfo?.timeBonus || 0
  }), [
    userDeposits?.length,
    STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER,
    stakingStats.lastWithdraw,
    formatWithdrawDate,
    userInfo?.totalStaked,
    userInfo?.timeBonus
  ]);

  return (
    <BaseCard title="Staking Status" icon={<FaWallet />}>
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Staked:</span>
            <span className="text-white font-medium">
              {formatBalance(memoizedValues.totalStaked)} POL
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Time Bonus:</span>
            <span className="text-green-400">+{memoizedValues.timeBonus}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Your Stake:</span>
            <span className="text-white font-medium">
              {formatBalance(depositAmount)} POL
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Hourly ROI:</span>
            <span className="text-green-400">{STAKING_CONSTANTS.HOURLY_ROI * 100}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Max ROI:</span>
            <span className="text-purple-400">{STAKING_CONSTANTS.MAX_ROI * 100}%</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 bg-black/20 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deposits Made:</span>
            <span className="text-gray-300">{memoizedValues.actualDepositsCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Remaining Slots:</span>
            <span className="text-gray-300">{memoizedValues.actualRemainingSlots}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Last Withdrawal:</span>
            <span className="text-gray-300">
              {memoizedValues.lastWithdrawDate}
            </span>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(StakingStatusCard);
