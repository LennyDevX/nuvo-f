import React, { useState, useMemo, useEffect, useCallback, useContext } from 'react';
import { motion as m } from 'framer-motion';
import { ethers } from 'ethers';
import { FaLock, FaCoins, FaChartLine, FaClock, FaUsers, FaExchangeAlt, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useStaking } from '../../../../context/StakingContext';
import { calculateUserAPY, formatAPY, getAPYStatus, calculateBaseAPY } from '../../../../utils/staking/apyCalculations';
import { WalletContext } from '../../../../context/WalletContext';

const StakingSection = ({ account, depositAmount }) => {
  const { walletConnected } = useContext(WalletContext);
  const { 
    state, 
    deposit, 
    withdrawRewards, 
    withdrawAll,
    getAPYAnalysis,
    calculateRealAPY,
    STAKING_CONSTANTS 
  } = useStaking();
  
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [userAPYData, setUserAPYData] = useState(null);
  const [dynamicAPY, setDynamicAPY] = useState({ baseAPY: 8.76, dailyROI: 0.24 });

  // Fetch dynamic APY on component mount
  useEffect(() => {
    const fetchAPY = async () => {
      const apyData = await calculateRealAPY();
      if (apyData) {
        setDynamicAPY(apyData);
      }
    };
    
    fetchAPY();
  }, [calculateRealAPY]);

  // Calculate user's APY data with all bonuses and penalties
  const apyAnalysis = useMemo(() => {
    if (!state.userDeposits?.length || !account) return null;

    try {
      // Calculate days staked from first deposit
      const firstDepositTimestamp = state.userDeposits.reduce((earliest, deposit) =>
        deposit.timestamp < earliest ? deposit.timestamp : earliest,
        state.userDeposits[0].timestamp
      );
      const stakingDays = Math.floor((Date.now() / 1000 - firstDepositTimestamp) / (24 * 3600));

      const userData = {
        userDeposits: state.userDeposits,
        totalStaked: state.userInfo?.totalStaked || '0',
        stakingDays,
        totalWithdrawn: 0, // This could be enhanced with withdrawal history
        rewardsClaimed: 0   // This could be enhanced with claim history
      };

      return calculateUserAPY(userData, STAKING_CONSTANTS);
    } catch (error) {
      console.error("Error calculating APY analysis:", error);
      return null;
    }
  }, [state.userDeposits, state.userInfo?.totalStaked, account, STAKING_CONSTANTS]);

  // Use dynamic APY from context instead of calculating from constants
  const baseAPYData = useMemo(() => {
    return {
      cappedAPY: dynamicAPY.baseAPY || 8.76,
      baseAPY: dynamicAPY.baseAPY || 8.76,
      dailyROI: dynamicAPY.dailyROI || 0.24
    };
  }, [dynamicAPY]);

  // Get APY status for color coding
  const apyStatus = useMemo(() => {
    if (!apyAnalysis || !baseAPYData) return { status: 'good', color: 'text-purple-400' };
    return getAPYStatus(apyAnalysis.effectiveAPY, baseAPYData.cappedAPY);
  }, [apyAnalysis, baseAPYData]);

  const handleDeposit = async () => {
    if (!depositAmountInput || isDepositing) return;
    
    // Validate deposit amount before proceeding
    const stakeAmount = parseFloat(depositAmountInput);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      console.error('Please enter a valid amount to stake.');
      return;
    }

    if (stakeAmount < 5) {
      console.error('Minimum deposit amount is 5 POL.');
      return;
    }

    if (stakeAmount > 10000) {
      console.error('Maximum deposit amount is 10,000 POL.');
      return;
    }
    
    setIsDepositing(true);
    try {
      const amountWei = ethers.parseEther(depositAmountInput);
      await deposit(amountWei, 0); // Use flexible staking (no lockup)
      setDepositAmountInput('');
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawRewards = async () => {
    if (isWithdrawing) return;
    
    setIsWithdrawing(true);
    try {
      await withdrawRewards();
    } catch (error) {
      console.error("Withdraw failed:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const stakingStats = [
    {
      icon: <FaLock className="text-purple-400" />,
      label: "Total Staked",
      value: `${parseFloat(state.userInfo?.totalStaked || '0').toFixed(4)} POL`,
      subValue: null
    },
    {
      icon: <FaCoins className="text-yellow-400" />,
      label: "Pending Rewards",
      value: `${parseFloat(state.userInfo?.pendingRewards || '0').toFixed(6)} POL`,
      subValue: null
    },
    {
      icon: <FaChartLine className={apyStatus.color} />,
      label: "Effective APY",
      value: formatAPY(apyAnalysis?.effectiveAPY || baseAPYData?.cappedAPY || 0),
      subValue: `Base: ${formatAPY(baseAPYData?.cappedAPY || 0)}`
    },
    {
      icon: <FaClock className="text-blue-400" />,
      label: "Time Bonus",
      value: apyAnalysis ? `+${formatAPY(apyAnalysis.multipliers.timeBonus, 1)}` : "+0.0%",
      subValue: `${apyAnalysis?.metrics.stakingDays || 0} days`
    }
  ];

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full">
          <FaLock className="text-xl sm:text-2xl text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Smart Staking</h2>
          <p className="text-sm text-purple-300">Earn rewards with intelligent bonuses</p>
        </div>
      </div>

      {/* APY Information Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatAPY(baseAPYData?.cappedAPY || 0)}
            </div>
            <div className="text-xs text-gray-400">Base APY</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${apyStatus.color}`}>
              {formatAPY(apyAnalysis?.effectiveAPY || baseAPYData?.cappedAPY || 0)}
            </div>
            <div className="text-xs text-gray-400">Your APY</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              +{formatAPY(apyAnalysis?.multipliers.total || 0, 1)}
            </div>
            <div className="text-xs text-gray-400">Total Bonus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {apyAnalysis?.metrics.stakingDays || 0}
            </div>
            <div className="text-xs text-gray-400">Days Staked</div>
          </div>
        </div>
      </div>

      {/* Staking Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stakingStats.map((stat, index) => (
          <m.div
            key={index}
            className="bg-black/30 p-3 sm:p-4 rounded-lg border border-purple-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="text-lg sm:text-xl">{stat.icon}</div>
              <span className="text-xs sm:text-sm text-gray-400">{stat.label}</span>
            </div>
            <div className="font-bold text-white text-sm sm:text-base">{stat.value}</div>
            {stat.subValue && (
              <div className="text-xs text-gray-500 mt-1">{stat.subValue}</div>
            )}
          </m.div>
        ))}
      </div>

      {/* APY Breakdown */}
      {apyAnalysis && (
        <div className="mb-6 p-4 bg-black/30 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-3">APY Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-sm text-blue-400 font-medium">
                +{formatAPY(apyAnalysis.multipliers.timeBonus, 1)}
              </div>
              <div className="text-xs text-gray-400">Time Bonus</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-green-400 font-medium">
                +{formatAPY(apyAnalysis.multipliers.volumeBonus, 1)}
              </div>
              <div className="text-xs text-gray-400">Volume Bonus</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-purple-400 font-medium">
                {apyAnalysis.multipliers.efficiencyMultiplier >= 0 ? '+' : ''}{formatAPY(apyAnalysis.multipliers.efficiencyMultiplier, 1)}
              </div>
              <div className="text-xs text-gray-400">Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-yellow-400 font-medium">
                {formatAPY(apyAnalysis.multipliers.withdrawalPenalty, 1)}
              </div>
              <div className="text-xs text-gray-400">Hold Bonus</div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit/Withdraw UI - to be implemented */}
      
      {/* Recommendations */}
      {apyAnalysis?.recommendations?.length > 0 && (
        <div className="mt-6 p-4 bg-black/30 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-3">Optimization Tips</h3>
          <ul className="space-y-2">
            {apyAnalysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-purple-300">
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </m.div>
  );
};

export default React.memo(StakingSection);

