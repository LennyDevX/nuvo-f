import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion as m } from 'framer-motion';
import { FaCoins, FaLock, FaExternalLinkAlt, FaArrowUp, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useStaking } from '../../../../context/StakingContext';
import { ethers } from 'ethers';

const StakingSection = ({ account }) => {
  const { state, refreshUserInfo, STAKING_CONSTANTS } = useStaking();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const firstRenderRef = useRef(true);
  
  // Get deposit amount - this is the key change to match StakingStatusCard's approach
  const depositAmount = useMemo(() => {
    // Calculate total from all deposits
    if (!state?.userDeposits || state.userDeposits.length === 0) return '0';

    // Sum all deposit amounts
    const total = state.userDeposits.reduce((sum, deposit) => {
      const amount = parseFloat(deposit.amount) || 0;
      return sum + amount;
    }, 0);
    
    return total.toString();
  }, [state?.userDeposits]);
  
  // Get other values from state
  const pendingRewards = state?.stakingStats?.pendingRewards || state?.userInfo?.pendingRewards || '0';
  const userDeposits = state?.userDeposits || [];

  // Calculate days staked from the first deposit
  const calculateDaysStaked = () => {
    if (!userDeposits || userDeposits.length === 0) return 0;
    
    // Sort deposits by timestamp to find the first one
    const sortedDeposits = [...userDeposits].sort((a, b) => a.timestamp - b.timestamp);
    const firstDepositTimestamp = sortedDeposits[0]?.timestamp;
    
    if (!firstDepositTimestamp) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const timeStaked = now - firstDepositTimestamp;
    return Math.floor(timeStaked / (24 * 3600));
  };
  
  const daysStaked = calculateDaysStaked();
  
  // Calculate time bonus based on days staked
  const calculateTimeBonus = () => {
    if (daysStaked >= 365) return 5;
    if (daysStaked >= 180) return 3;
    if (daysStaked >= 90) return 1;
    return 0;
  };

  const timeBonus = calculateTimeBonus();
  const totalAPY = 125; // Fixed at 125% as shown in the dashboard

  // Add debug logging to check data
  useEffect(() => {
    console.log("StakingSection state data:", {
      userInfo: state?.userInfo,
      userDeposits: state?.userDeposits,
      depositAmount,
      pendingRewards
    });
  }, [state?.userInfo, state?.userDeposits, depositAmount, pendingRewards]);

  // Fetch user staking data when component mounts
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setFetchError(null);
        
        // Directly fetch fresh data from the contract
        const result = await refreshUserInfo(account);
        console.log("StakingSection refreshUserInfo result:", result);
        
        // Add a small delay to ensure state updates
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching staking data:", error);
        setFetchError("Failed to load staking data. Please try again.");
        setIsLoading(false);
      }
    };

    // Force immediate fetch on mount
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      fetchStakingData();
    }
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(() => {
      if (account) {
        refreshUserInfo(account).catch(console.error);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [account, refreshUserInfo]);

  // Format balance to 3 decimal places
  const formatBalance = (value) => {
    if (!value) return '0.000';
    
    try {
      // Convert to number and format
      const formattedValue = parseFloat(value).toFixed(3);
      return formattedValue;
    } catch (error) {
      console.error("Error formatting balance:", error);
      return '0.000';
    }
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-full">
          <FaCoins className="text-2xl text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Smart Staking</h2>
      </div>
      
      <div className="mb-6">
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-black/60 rounded-xl border border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-black/40 rounded-xl">
              <div className="text-sm text-purple-300 mb-1">Total Staked</div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? (
                  <div className="flex justify-center items-center h-8">
                    <FaSpinner className="animate-spin text-purple-400" />
                  </div>
                ) : (
                  `${formatBalance(depositAmount)} POL`
                )}
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-xl">
              <div className="text-sm text-purple-300 mb-1">Earned Rewards</div>
              <div className="text-3xl font-bold text-green-400">
                {isLoading ? (
                  <div className="flex justify-center items-center h-8">
                    <FaSpinner className="animate-spin text-purple-400" />
                  </div>
                ) : (
                  `${formatBalance(pendingRewards)} POL`
                )}
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-xl">
              <div className="text-sm text-purple-300 mb-1">Current APY</div>
              <div className="text-3xl font-bold text-white">{totalAPY}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">Staking Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Staking Pool</span>
              <span className="text-white font-medium">NUVOS Community</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Lock Period</span>
              <div className="bg-green-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                <FaLock className="text-green-400 text-xs" />
                <span className="text-green-400 text-sm">Flexible</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Days Staked</span>
              <span className="text-white font-medium">{daysStaked} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Total Deposits</span>
              <span className="text-white font-medium">
                {userDeposits.length} / {STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">Staking Progress</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-purple-300">Days Staking Progress</span>
              <span className="text-purple-300">{daysStaked} days</span>
            </div>
            <div className="relative h-3 bg-purple-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" 
                style={{width: `${Math.min((daysStaked / 365) * 100, 100)}%`}}
              />
              <div 
                className="absolute h-full w-px bg-white/50 top-0"
                style={{left: '25%'}}
              />
              <div 
                className="absolute h-full w-px bg-white/50 top-0"
                style={{left: '50%'}}
              />
              <div 
                className="absolute h-full w-px bg-white/50 top-0"
                style={{left: '75%'}}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-purple-400">0</span>
              <span className="text-purple-400">90d</span>
              <span className="text-purple-400">180d</span>
              <span className="text-purple-400">365d</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-purple-300">Maximum APY</span>
            <div className="flex items-center gap-1 text-white">
              <span>{totalAPY}%</span>
              <FaArrowUp className="text-green-400 text-xs" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Error display */}
      {fetchError && (
        <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {fetchError}
        </div>
      )}
      
      
      
      {Number(pendingRewards) > 0 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="text-green-400 font-medium mb-1">Rewards Available</h4>
          <div className="text-sm text-gray-300">You have {formatBalance(pendingRewards)} POL in unclaimed rewards. Visit the Staking Dashboard to claim them.</div>
        </div>
      )}

      {Number(depositAmount) === 0 && !isLoading && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h4 className="text-yellow-400 font-medium mb-1">Start Staking</h4>
          <div className="text-sm text-gray-300">You haven't staked any tokens yet. Visit the Staking Dashboard to start earning rewards at up to 125% APY.</div>
        </div>
        
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/staking" 
          className="flex-1 max-w-xs mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
        >
          Manage Staking <FaExternalLinkAlt size={12} />
        </Link>
      </div>
    </m.div>
  );
};

export default StakingSection;
