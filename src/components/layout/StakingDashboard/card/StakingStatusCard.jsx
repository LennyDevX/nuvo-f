import React, { useEffect, useMemo } from 'react';
import { FaWallet, FaChartLine, FaHistory, FaInfoCircle } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../context/StakingContext';
import Tooltip from '../Tooltip';


const StakingStatusCard = ({ account, depositAmount }) => {
  const { state, STAKING_CONSTANTS, refreshUserInfo, formatWithdrawDate } = useStaking();
  const { stakingStats, userDeposits, userInfo } = state;

  useEffect(() => {
    if (account) {
      refreshUserInfo(account);
    }
  }, [account, refreshUserInfo]);

  const memoizedValues = useMemo(() => ({
    actualDepositsCount: userDeposits?.length || 0,
    actualRemainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - (userDeposits?.length || 0),
    lastWithdrawDate: stakingStats.lastWithdraw ? formatWithdrawDate(stakingStats.lastWithdraw) : 'Never',
    totalStaked: userInfo?.totalStaked || '0',
    efficiency: ((userDeposits?.length || 0) / STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER) * 100,
    pendingRewards: stakingStats.pendingRewards || '0'
  }), [userDeposits?.length, STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER, stakingStats, userInfo]);

  return (
    <BaseCard title="Your Staking Profile" icon={<FaWallet className="text-indigo-300" />}>
      <div className="flex flex-col h-full space-y-4">
        {/* Main Staking Stats */}
        <div className="bg-indigo-900/20 backdrop-blur-sm p-4 rounded-xl border border-indigo-600/20 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-indigo-100/70 text-sm">Total Staked</span>
              <div className="font-bold text-xl text-indigo-300">
                {formatBalance(depositAmount)} POL
              </div>
            </div>
            <div>
              <span className="text-indigo-100/70 text-sm">Pending Rewards</span>
              <div className="font-bold text-lg text-indigo-300">
                {formatBalance(memoizedValues.pendingRewards)} POL
              </div>
            </div>
          </div>
        </div>

        {/* Deposits Overview */}
        <div className="bg-indigo-900/20 backdrop-blur-sm p-4 rounded-xl border border-indigo-600/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-100/70 flex items-center gap-2">
              Deposit Utilization
              <Tooltip content="Your deposit slot usage efficiency">
                <FaInfoCircle className="text-indigo-400/60 hover:text-indigo-300" />
              </Tooltip>
            </span>
            <span className="text-indigo-300 font-semibold">
              {memoizedValues.efficiency.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="w-full bg-indigo-900/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-400 to-indigo-300 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${memoizedValues.efficiency}%`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-indigo-100/70">Active Deposits</span>
                <div className="text-indigo-50 font-semibold">{memoizedValues.actualDepositsCount}</div>
              </div>
              <div>
                <span className="text-indigo-100/70">Available Slots</span>
                <div className="text-indigo-300 font-semibold">{memoizedValues.actualRemainingSlots}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-indigo-900/20 backdrop-blur-sm p-4 rounded-xl border border-indigo-600/20 shadow-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-indigo-100/70">Last Withdrawal</span>
              <span className="text-indigo-50 font-medium">{memoizedValues.lastWithdrawDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-100/70">Max Deposits</span>
              <span className="text-indigo-300 font-medium">{STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-100/70">Contract Status</span>
              <span className="text-indigo-300 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(StakingStatusCard);