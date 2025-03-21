import React, { useEffect, useMemo, useRef } from 'react';
import { FaWallet, FaChartLine, FaHistory, FaInfoCircle } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/Formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../Tooltip';


const StakingStatusCard = ({ account, depositAmount }) => {
  const { state, STAKING_CONSTANTS, refreshUserInfo, formatWithdrawDate } = useStaking();
  const { stakingStats, userDeposits, userInfo } = state;


    // Add this after getting useStaking values
  useEffect(() => {
    console.log("StakingStatusCard props and state:", {
      account,
      depositAmount,
      userInfo,
      stakingStats
    });
  }, [account, depositAmount, userInfo, stakingStats]);

  // Add immediate data fetch on mount
  useEffect(() => {
    if (!account) return;

    const fetchInitialData = async () => {
      try {
        console.log("Initial fetch for account:", account);
        const result = await refreshUserInfo(account);
        console.log("Initial fetch result:", result);
      } catch (error) {
        console.error("Error in initial fetch:", error);
      }
    };

    fetchInitialData();
  }, [account]); // Only run on mount and account change

  // Regular polling
  useEffect(() => {
    if (!account) return;
    
    const interval = setInterval(() => {
      refreshUserInfo(account).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [account, refreshUserInfo]);

  // Add debug logging
  useEffect(() => {
    console.log("Current staking stats:", {
      depositAmount,
      userDeposits: userDeposits?.length,
      stakingStats
    });
  }, [depositAmount, userDeposits, stakingStats]);

  const memoizedValues = useMemo(() => {
    const values = {
      actualDepositsCount: userDeposits?.length || 0,
      actualRemainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - (userDeposits?.length || 0),
      lastWithdrawDate: stakingStats.lastWithdraw ? formatWithdrawDate(stakingStats.lastWithdraw) : 'Never',
      // Use depositAmount instead of userInfo.totalStaked if it's more accurate
      totalStaked: depositAmount || userInfo?.totalStaked || '0',
      efficiency: ((userDeposits?.length || 0) / STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER) * 100,
      pendingRewards: stakingStats.pendingRewards || '0'
    };
    
    console.log("Memoized values with depositAmount:", {
      ...values,
      rawDepositAmount: depositAmount,
      rawTotalStaked: userInfo?.totalStaked
    });
    return values;
  }, [
    userDeposits?.length,
    STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER,
    stakingStats,
    userInfo,
    depositAmount // Add depositAmount to dependencies
  ]);

  return (
    <BaseCard title="Your Staking Profile" icon={<FaWallet className="text-violet-400" />}>
      <div className="flex flex-col h-full space-y-4">
        {/* Main Staking Stats */}
        <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/20 p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 text-xs font-medium">Total Staked</span>
              <div className="font-medium text-xl text-slate-100 mt-1">
                {formatBalance(depositAmount)} POL
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-xs font-medium">Pending Rewards</span>
              <div className="font-medium text-lg text-slate-100 mt-1">
                {formatBalance(memoizedValues.pendingRewards)} POL
              </div>
            </div>
          </div>
        </div>

        {/* Deposits Overview */}
        <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-300 flex items-center gap-2 text-sm font-medium">
              Deposit Utilization
              <Tooltip content="Your deposit slot usage efficiency">
                <FaInfoCircle className="text-slate-400 hover:text-violet-400" />
              </Tooltip>
            </span>
            <span className="text-violet-400 font-medium px-2 py-0.5 bg-violet-900/30 rounded-full text-xs">
              {memoizedValues.efficiency.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="w-full bg-slate-800/60 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-fuchsia-400 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${memoizedValues.efficiency}%`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/10 p-3 rounded-lg border border-indigo-700/15 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
                <span className="text-slate-400 text-xs">Active Deposits</span>
                <div className="text-slate-200 font-medium text-lg">{memoizedValues.actualDepositsCount}</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/10 p-3 rounded-lg border border-indigo-700/15 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
                <span className="text-slate-400 text-xs">Available Slots</span>
                <div className="text-slate-200 font-medium text-lg">{memoizedValues.actualRemainingSlots}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
          <h3 className="text-slate-300 font-medium mb-3 text-xs uppercase tracking-wider">Activity Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 hover:bg-indigo-900/20 rounded-lg transition-colors duration-200">
              <span className="text-slate-400 flex items-center gap-2 text-sm">
                <FaHistory className="text-violet-400/70" /> Last Withdrawal
              </span>
              <span className="text-slate-200 text-sm">{memoizedValues.lastWithdrawDate}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-indigo-900/20 rounded-lg transition-colors duration-200">
              <span className="text-slate-400 flex items-center gap-2 text-sm">
                <FaChartLine className="text-violet-400/70" /> Max Deposits
              </span>
              <span className="text-slate-200 text-sm">{STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-indigo-900/20 rounded-lg transition-colors duration-200">
              <span className="text-slate-400 text-sm">Contract Status</span>
              <span className="bg-green-900/40 text-green-400 font-medium px-2 py-0.5 rounded-full text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(StakingStatusCard);