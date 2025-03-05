import React, { useEffect, useMemo, useRef } from 'react';
import { FaWallet, FaChartLine, FaHistory, FaInfoCircle } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
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
    <BaseCard title="Your Staking Profile" icon={<FaWallet className="text-emerald-400" />}>
      <div className="flex flex-col h-full space-y-5">
        {/* Main Staking Stats */}
        <div className="bg-gradient-to-br from-cyan-900/40 to-emerald-900/30 p-5 rounded-2xl border border-cyan-600/20 shadow-lg backdrop-blur-md hover:shadow-cyan-700/10 transition-all duration-300">
          <div className="grid grid-cols-2 gap-6">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <span className="text-cyan-100/70 text-sm font-medium tracking-wide">Total Staked</span>
              <div className="font-bold text-2xl text-emerald-300 mt-1">
                {formatBalance(depositAmount)} POL
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <span className="text-cyan-100/70 text-sm font-medium tracking-wide">Pending Rewards</span>
              <div className="font-bold text-xl text-emerald-300 mt-1">
                {formatBalance(memoizedValues.pendingRewards)} POL
              </div>
            </div>
          </div>
        </div>

        {/* Deposits Overview */}
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 p-5 rounded-2xl border border-blue-500/20 shadow-lg backdrop-blur-md hover:shadow-blue-700/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-cyan-100/80 flex items-center gap-2 font-medium">
              Deposit Utilization
              <Tooltip content="Your deposit slot usage efficiency">
                <FaInfoCircle className="text-cyan-400/80 hover:text-cyan-300" />
              </Tooltip>
            </span>
            <span className="text-emerald-300 font-bold px-3 py-1 bg-emerald-900/30 rounded-full text-sm">
              {memoizedValues.efficiency.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="w-full bg-blue-900/40 rounded-full h-3 p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-1000 shadow-inner shadow-emerald-500/50"
                style={{
                  width: `${memoizedValues.efficiency}%`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm mt-2">
              <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-700/20">
                <span className="text-cyan-100/70">Active Deposits</span>
                <div className="text-emerald-300 font-bold text-lg">{memoizedValues.actualDepositsCount}</div>
              </div>
              <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-700/20">
                <span className="text-cyan-100/70">Available Slots</span>
                <div className="text-emerald-300 font-bold text-lg">{memoizedValues.actualRemainingSlots}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 p-5 rounded-2xl border border-cyan-700/30 shadow-lg backdrop-blur-md hover:shadow-cyan-800/10 transition-all duration-300">
          <h3 className="text-cyan-200 font-medium mb-3 text-sm uppercase tracking-wider">Activity Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-blue-900/20 rounded-lg transition-colors duration-200">
              <span className="text-cyan-100/70 flex items-center gap-2">
                <FaHistory className="text-emerald-400/70" /> Last Withdrawal
              </span>
              <span className="text-cyan-50 font-medium">{memoizedValues.lastWithdrawDate}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-blue-900/20 rounded-lg transition-colors duration-200">
              <span className="text-cyan-100/70 flex items-center gap-2">
                <FaChartLine className="text-emerald-400/70" /> Max Deposits
              </span>
              <span className="text-cyan-50 font-medium">{STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-blue-900/20 rounded-lg transition-colors duration-200">
              <span className="text-cyan-100/70">Contract Status</span>
              <span className="bg-emerald-900/40 text-emerald-300 font-medium px-3 py-1 rounded-full text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(StakingStatusCard);