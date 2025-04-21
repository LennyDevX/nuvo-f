import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FaGift, FaInfoCircle, FaCoins } from 'react-icons/fa';
import BaseCard from './BaseCard';
import Tooltip from '../../../ui/Tooltip';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import TransactionToast from '../../../ui/TransactionToast';
import { AnimatePresence, m } from 'framer-motion';
import { ethers } from 'ethers';
import { globalRateLimiter } from '../../../../utils/RateLimiter';
import { globalCache } from '../../../../utils/CacheManager';

// Constantes para la gestión eficiente de recompensas
const REWARDS_CACHE_KEY = 'user_rewards';
const REWARDS_CACHE_TTL = 60 * 1000; // 60 segundos (increased from 30)
const REWARDS_POLL_INTERVAL = 60 * 1000; // 60 segundos (increased from 30)
const REWARDS_ESTIMATE_INTERVAL = 10 * 1000; // 10 segundos para estimaciones
const MAX_REWARDS_CALLS_PER_MINUTE = 4; // Limitar a 4 llamadas por minuto (reduced from 6)

const RewardsCard = ({ onClaim, showToast }) => {
  const [loading, setLoading] = useState(false);
  const { withdrawRewards, state, refreshUserInfo } = useStaking();
  const { isPending } = state;
  const [transactionInfo, setTransactionInfo] = useState(null);
  const pollIntervalRef = useRef(null);
  const estimateIntervalRef = useRef(null);
  const lastRewardsUpdateRef = useRef(0);
  const [localRewardsEstimate, setLocalRewardsEstimate] = useState(null);
  const isUpdatingRef = useRef(false);

  // Memoized user info
  const userInfo = useMemo(() => 
    state.userInfo || { pendingRewards: '0', roiProgress: 0 },
    [state.userInfo]
  );

  // Improved rewards fetch function with better throttling
  const fetchUserRewards = useCallback(async (force = false) => {
    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      return;
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastRewardsUpdateRef.current;
    const rateLimiterKey = `rewards_update_${state.userInfo?.address || 'unknown'}`;
    
    // If not forced, check throttling
    if (!force && timeSinceLastUpdate < REWARDS_POLL_INTERVAL / 2) {
      return;
    }
    
    // Verify rate limiting
    if (!force && !globalRateLimiter.canMakeCall(rateLimiterKey)) {
      // Use cache or local estimate if available
      const cachedRewards = await globalCache.get(
        `${REWARDS_CACHE_KEY}_${state.userInfo?.address}`,
        null
      );
      
      if (cachedRewards) {
        return cachedRewards;
      }
      
      if (localRewardsEstimate !== null) {
        return { pendingRewards: localRewardsEstimate };
      }
      
      return;
    }
    
    isUpdatingRef.current = true;
    
    try {
      lastRewardsUpdateRef.current = now;
      
      // Try to get actual blockchain data
      if (window.ethereum && state.contract && state.userInfo?.address) {
        const address = state.userInfo.address;
        
        // Get fresh rewards data
        await refreshUserInfo(address);
        
        // Cache for future use
        globalCache.set(
          `${REWARDS_CACHE_KEY}_${address}`,
          { 
            pendingRewards: userInfo.pendingRewards,
            timestamp: now 
          },
          REWARDS_CACHE_TTL
        );
        
        // Reset local estimate since we now have fresh data
        setLocalRewardsEstimate(null);
        
        return { pendingRewards: userInfo.pendingRewards };
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [state.contract, state.userInfo, refreshUserInfo, userInfo.pendingRewards, localRewardsEstimate]);

  // Optimized estimation function
  const estimateCurrentRewards = useCallback(() => {
    if (!userInfo.pendingRewards || parseFloat(userInfo.pendingRewards) === 0) {
      return;
    }
    
    // Calculate local estimation only if we have real data to base it on
    if (lastRewardsUpdateRef.current === 0) {
      return userInfo.pendingRewards;
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = (now - lastRewardsUpdateRef.current) / 1000; // in seconds
    
    if (state.userDeposits && state.userDeposits.length > 0) {
      const depositedAmount = state.userDeposits.reduce(
        (sum, dep) => sum + parseFloat(dep.amount || 0), 
        0
      );
      
      // Approximate calculation: 0.01% per hour
      const hourlyRate = 0.0001;
      const secondlyRate = hourlyRate / 3600;
      const estimatedAccrual = depositedAmount * secondlyRate * timeSinceLastUpdate;
      
      const newEstimate = (parseFloat(userInfo.pendingRewards) + estimatedAccrual).toString();
      setLocalRewardsEstimate(newEstimate);
      
      return newEstimate;
    }
    
    return userInfo.pendingRewards;
  }, [userInfo.pendingRewards, state.userDeposits]);

  // Improved setup for polling with separate intervals for real updates and estimates
  useEffect(() => {
    // Initial update with slight delay to prevent UI competition
    const initialTimeout = setTimeout(() => {
      fetchUserRewards(true);
    }, 1500);
    
    // Set up two intervals:
    // 1. For real blockchain data
    const rewardsInterval = setInterval(() => {
      fetchUserRewards(false);
    }, REWARDS_POLL_INTERVAL);
    
    // 2. For local estimations (more frequent but less resource-intensive)
    const estimateInterval = setInterval(() => {
      estimateCurrentRewards();
    }, REWARDS_ESTIMATE_INTERVAL);
    
    estimateIntervalRef.current = estimateInterval;
    pollIntervalRef.current = rewardsInterval;
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(rewardsInterval);
      clearInterval(estimateInterval);
    };
  }, [fetchUserRewards, estimateCurrentRewards]);

  // Optimized claim handler
  const handleClaim = useCallback(async () => {
    if (loading || !userInfo.pendingRewards || userInfo.pendingRewards === '0') return;
    
    setLoading(true);
    setTransactionInfo({
      message: 'Processing Claim',
      type: 'loading',
      details: 'Claiming your rewards...'
    });
    
    try {
      const tx = await withdrawRewards();
      setTransactionInfo({
        message: 'Rewards Claimed! 🎉',
        type: 'success',
        details: `Successfully claimed ${formatBalance(userInfo.pendingRewards)} POL in rewards.`,
        hash: tx.hash
      });
      
      if (typeof onClaim === 'function') onClaim();
      if (typeof showToast === 'function') {
        showToast('Rewards claimed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      setTransactionInfo({
        message: 'Claim Failed',
        type: 'error',
        details: error.reason || 'There was an error claiming your rewards. Please try again.'
      });
      
      if (typeof showToast === 'function') {
        if (error.code === 'ACTION_REJECTED') {
          showToast('Transaction cancelled by user', 'warning');
        } else {
          showToast(error.reason || 'Error claiming rewards', 'error');
        }
      }
    } finally {
      setLoading(false);
      setTimeout(() => setTransactionInfo(null), 5000);
    }
  }, [loading, userInfo.pendingRewards, withdrawRewards, onClaim, showToast]);

  // Memoized button variants for animations
  const buttonVariants = useMemo(() => ({
    idle: { scale: 1 },
    hover: { 
      scale: 1.02,
      boxShadow: '0 0 15px rgba(124, 58, 237, 0.6)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 },
    disabled: { 
      opacity: 0.5,
      scale: 1,
      boxShadow: 'none'
    }
  }), []);

  // Memoized shimmer animation
  const shimmerAnimation = useMemo(() => ({
    hidden: { 
      backgroundPosition: '200% 0',
      opacity: 0.8
    },
    visible: { 
      backgroundPosition: '-200% 0',
      opacity: 1,
      transition: { 
        repeat: Infinity, 
        duration: 3,
        ease: 'linear'
      }
    }
  }), []);

  // Memoized button disabled state
  const isButtonDisabled = useMemo(() => 
    loading || !userInfo.pendingRewards || userInfo.pendingRewards === '0' || isPending,
    [loading, userInfo.pendingRewards, isPending]
  );

  return (
    <>
      <BaseCard title="Available Rewards" icon={<FaGift className="text-purple-300" />}>
        <div className="flex flex-col space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rewards Section */}
            <div className=" p-4 rounded-xl border border-purple-600/20 shadow-lg">
              <span className="text-purple-100/70 text-sm">Accumulated Rewards</span>
              <div className="mt-2">
                <div className="text-2xl font-bold text-purple-300">
                  {formatBalance(localRewardsEstimate || userInfo.pendingRewards)} POL
                </div>
                <div className="text-sm text-purple-200/50 mt-1">
                  Available to claim
                </div>
              </div>
            </div>

            {/* ROI Progress Circle */}
            <div className=" p-4 rounded-xl border border-purple-600/20 shadow-lg">
              <span className="text-purple-100/70 text-sm mb-2 block flex items-center gap-2">
                Time Bonus Progress
                <Tooltip content={`
                  Base ROI: 0.24% daily
                  Current Progress: ${userInfo.roiProgress.toFixed(2)}%
                  Max ROI: 125%
                  Days Staked: ${state.userInfo?.stakingDays || 0}
                `}>
                  <FaInfoCircle className="text-purple-400/60 hover:text-purple-300" />
                </Tooltip>
              </span>
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Circular Progress Background */}
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      className="text-purple-900/30"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                    />
                    <circle 
                      className="text-purple-400"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="32"
                      cy="32"
                      strokeDasharray={`${(userInfo.roiProgress / 125) * 188.4} 188.4`}
                    />
                  </svg>
                  {/* Percentage Text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="text-lg font-bold text-purple-300">
                      {userInfo.roiProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Button - mantener el gradiente para que destaque como acción principal */}
          <m.button
            onClick={handleClaim}
            disabled={isButtonDisabled}
            variants={buttonVariants}
            initial="idle"
            whileHover={isButtonDisabled ? "disabled" : "hover"}
            whileTap={isButtonDisabled ? "disabled" : "tap"}
            className={`
              relative w-full overflow-hidden
              bg-gradient-to-r from-indigo-600/80 to-violet-500/80
              backdrop-blur-sm p-4 rounded-xl 
              border border-indigo-400/30
              text-white font-medium 
              shadow-lg shadow-indigo-900/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                <span className="ml-2 text-white/90">Claiming...</span>
              </div>
            ) : (
              <>
                <FaCoins className="text-yellow-300" />
                <span>Claim Rewards</span>
                {!isButtonDisabled && (
                  <m.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    variants={shimmerAnimation}
                    initial="hidden"
                    animate="visible"
                  />
                )}
                {!isButtonDisabled && (
                  <m.span 
                    className="absolute right-4"
                    animate={{ x: [-5, 5], opacity: [0.7, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                  >
                    →
                  </m.span>
                )}
              </>
            )}
          </m.button>
        </div>
      </BaseCard>

      <AnimatePresence>
        {transactionInfo && <TransactionToast {...transactionInfo} />}
      </AnimatePresence>
    </>
  );
};

export default React.memo(RewardsCard);
