import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaCoins, FaLock, FaExternalLinkAlt, FaArrowUp, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useStaking } from '../../../../context/StakingContext';
import { ethers } from 'ethers';

// Extract StakingMetricCard as a separate memoized component
const StakingMetricCard = React.memo(({ title, value, isLoading }) => (
  <div className="p-4 bg-black/40 rounded-xl">
    <div className="text-sm text-purple-300 mb-1">{title}</div>
    <div className="text-3xl font-bold text-white">
      {isLoading ? (
        <div className="flex justify-center items-center h-8">
          <FaSpinner className="animate-spin text-purple-400" />
        </div>
      ) : value}
    </div>
  </div>
));

// Add flag to control debug logging
const DEBUG_MODE = false; // Set to true only when debugging

const StakingSection = ({ account }) => {
  const { state, refreshUserInfo, STAKING_CONSTANTS } = useStaking();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const firstRenderRef = useRef(true);
  const refreshTimerRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const lastLoggedStateRef = useRef(null); // Track last logged state to prevent duplicate logs
  
  // Define totalAPY constant
  const totalAPY = 125;
  
  // Optimized debug logging to avoid spam
  useEffect(() => {
    if (!DEBUG_MODE) return; // Skip logging if not in debug mode

    // Only log when there's a meaningful change
    const currentStateHash = JSON.stringify({
      depositsLength: state?.userDeposits?.length,
      depositAmount: state?.userInfo?.totalStaked,
      pendingRewards: state?.userInfo?.pendingRewards,
      isLoading
    });
    
    if (lastLoggedStateRef.current !== currentStateHash) {
      console.log("Staking State Changed:", {
        userDeposits: state?.userDeposits,
        stakingStats: state?.stakingStats,
        userInfo: state?.userInfo,
        isLoading
      });
      lastLoggedStateRef.current = currentStateHash;
    }
  }, [state, isLoading]);
  
  // Timeout to force exit loading state
  useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (DEBUG_MODE) console.log("Force exiting loading state after timeout");
        setIsLoading(false);
      }, 5000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);
  
  // Cache formatted values to avoid recalculations
  const formattedValues = useMemo(() => {
    // Used to store pre-formatted values
    const cache = {};
    return cache;
  }, []);
  
  // Memoize deposit amount calculation with improved parsing
  const depositAmount = useMemo(() => {
    if (!state?.userDeposits || state.userDeposits.length === 0) return '0';
    
    try {
      // More robust parsing
      const total = state.userDeposits.reduce((sum, deposit) => {
        if (!deposit || !deposit.amount) return sum;
        
        // Handle different formats (string, bigint, etc)
        let amount = 0;
        if (typeof deposit.amount === 'string') {
          amount = parseFloat(deposit.amount) || 0;
        } else if (typeof deposit.amount === 'bigint') {
          amount = Number(ethers.formatEther(deposit.amount.toString()));
        } else if (typeof deposit.amount === 'number') {
          amount = deposit.amount;
        }
        
        return sum + amount;
      }, 0);
      
      return total.toString();
    } catch (error) {
      console.error("Error calculating deposit amount:", error);
      return '0';
    }
  }, [state?.userDeposits]);
  
  // Memoize other values from state with improved parsing
  const pendingRewards = useMemo(() => {
    try {
      // Try different sources for the value
      let rewards = state?.stakingStats?.pendingRewards || state?.userInfo?.pendingRewards || '0';
      
      // Check if it's a BigInt or needs ethers formatting
      if (typeof rewards === 'bigint') {
        return ethers.formatEther(rewards.toString());
      }
      
      return rewards.toString();
    } catch (error) {
      console.error("Error parsing pending rewards:", error);
      return '0';
    }
  }, [state?.stakingStats?.pendingRewards, state?.userInfo?.pendingRewards]);
  
  // Memoize userDeposits from state
  const userDeposits = useMemo(() => 
    state?.userDeposits || [],
  [state?.userDeposits]);
  
  // Create stable calculation functions - FIXED USERDEPOSITS REFERENCE
  const calculateDaysStaked = useCallback(() => {
    // Changed to correctly reference the memoized userDeposits
    if (!userDeposits || userDeposits.length === 0) return 0;
    
    const sortedDeposits = [...userDeposits].sort((a, b) => a.timestamp - b.timestamp);
    const firstDepositTimestamp = sortedDeposits[0]?.timestamp;
    
    if (!firstDepositTimestamp) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const timeStaked = now - firstDepositTimestamp;
    return Math.floor(timeStaked / (24 * 3600));
  }, [userDeposits]);  // Using the memoized value properly
  
  const daysStaked = useMemo(() => calculateDaysStaked(), [calculateDaysStaked]);
  
  const timeBonus = useMemo(() => {
    if (daysStaked >= 365) return 5;
    if (daysStaked >= 180) return 3;
    if (daysStaked >= 90) return 1;
    return 0;
  }, [daysStaked]);
  
  // Format balance with improved handling and reduced logging
  const formatBalance = useCallback((value) => {
    if (!value) return '0.000';
    
    // Create a cache key based on value and type
    const cacheKey = `${value}-${typeof value}`;
    
    // Check if we've already formatted this exact value
    if (formattedValues[cacheKey]) {
      return formattedValues[cacheKey];
    }
    
    try {
      // Log only in debug mode
      if (DEBUG_MODE) {
        console.log("Formatting balance value:", value, typeof value);
      }
      
      // Handle different formats
      let parsedValue;
      if (typeof value === 'string') {
        parsedValue = parseFloat(value);
      } else if (typeof value === 'number') {
        parsedValue = value;
      } else if (typeof value === 'bigint') {
        parsedValue = Number(ethers.formatEther(value.toString()));
      } else {
        parsedValue = 0;
      }
      
      // Cap at reasonable values to prevent display issues
      const cappedValue = Math.min(parsedValue || 0, 999999.999);
      const result = cappedValue.toFixed(3);
      
      // Cache the formatted value
      formattedValues[cacheKey] = result;
      
      return result;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error("Error formatting balance:", error, value);
      }
      return '0.000';
    }
  }, [formattedValues]);
  
  // Add cleanup for effects and optimize polling
  useEffect(() => {
    let isMounted = true;
    
    const fetchStakingData = async () => {
      if (!account) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setFetchError(null);
        }
        
        // Use AbortController for fetch cleanup
        const controller = new AbortController();
        const signal = controller.signal;
        
        // Race between the actual API call and the timeout
        const fetchPromise = refreshUserInfo(account, { signal });
        const timeoutPromise = new Promise(resolve => {
          const timeoutId = setTimeout(() => {
            resolve({ timeout: true });
            clearTimeout(timeoutId);
          }, 1500);
        });
        
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (isMounted) {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
        
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching staking data:", error);
          setFetchError("Failed to load staking data. Please try again.");
          setIsLoading(false);
        }
      }
    };

    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      fetchStakingData();
    }
    
    // Use dynamic polling interval based on activity
    // More active stakes = more frequent updates
    const pollInterval = userDeposits.length > 0 ? 15000 : 30000;
    
    refreshTimerRef.current = setInterval(() => {
      if (account) {
        refreshUserInfo(account).catch(err => {
          if (isMounted) console.error(err);
        });
      }
    }, pollInterval);

    return () => {
      isMounted = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [account, refreshUserInfo, userDeposits.length]);

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
            <StakingMetricCard
              title="Total Staked"
              value={`${formatBalance(depositAmount)} POL`}
              isLoading={isLoading && !depositAmount} // Show loading only if no value
            />
            <StakingMetricCard
              title="Earned Rewards"
              value={`${formatBalance(pendingRewards)} POL`}
              isLoading={isLoading && !pendingRewards} // Show loading only if no value
            />
            <StakingMetricCard
              title="Current APY"
              value={`${totalAPY}%`} 
              isLoading={false}
            />
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

export default React.memo(StakingSection);
