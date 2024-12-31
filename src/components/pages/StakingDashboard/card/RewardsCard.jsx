import React, { useState, useMemo, useEffect } from 'react';
import { FaGift, FaInfoCircle } from 'react-icons/fa';
import BaseCard from './BaseCard';
import Tooltip from '../Tooltip';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import TransactionToast from '../../../ui/TransactionToast';
import { AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers'; // Añadir esta importación

const RewardsCard = ({ onClaim, showToast }) => {
  const [loading, setLoading] = useState(false);
  const { withdrawRewards, state, getSignerAddress } = useStaking();
  const { isPending } = state;
  const userInfo = state.userInfo || { pendingRewards: '0', roiProgress: 0 };
  const [transactionInfo, setTransactionInfo] = useState(null);

  const stakingInfo = useMemo(() => {
    const days = state.userInfo?.stakingDays || 0;
    
    let bonus = 0;
    let nextBonus = 1;
    let daysLeft = 90;

    if (days >= 365) {
      bonus = 5;
      nextBonus = 5;
      daysLeft = 0;
    } else if (days >= 180) {
      bonus = 3;
      nextBonus = 5;
      daysLeft = 365 - days;
    } else if (days >= 90) {
      bonus = 1;
      nextBonus = 3;
      daysLeft = 180 - days;
    } else {
      daysLeft = 90 - days;
    }

    return { days, bonus, nextBonus, daysLeft };
  }, [state.userInfo?.stakingDays]);

  // Add effect to log rewards updates
  useEffect(() => {
    console.log("Current rewards info:", {
      pendingRewards: userInfo.pendingRewards,
      roiProgress: userInfo.roiProgress
    });
  }, [userInfo]);

  // Add polling for rewards with signer address
  useEffect(() => {
    let mounted = true;
    
    const pollRewards = async () => {
      try {
        if (!state.contract || !window.ethereum) return;
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Solo actualizar si el componente sigue montado
        if (mounted) {
          const result = await state.contract.calculateRewards(address);
          console.log("Polled rewards for address:", address, ethers.formatEther(result));
        }
      } catch (error) {
        console.error("Error polling rewards:", error);
      }
    };

    pollRewards();
    const interval = setInterval(pollRewards, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [state.contract]);

  // Calcular ROI progress basado en los deposits
  const calculateProgress = useMemo(() => {
    if (!state.userDeposits || state.userDeposits.length === 0) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    let totalProgress = 0;
    
    state.userDeposits.forEach(deposit => {
      const timeStaked = now - deposit.timestamp;
      const daysStaked = timeStaked / (24 * 3600);
      const dailyROI = 0.24; // 0.24% daily
      const progress = Math.min(daysStaked * dailyROI, 125); // Max 125%
      totalProgress += progress;
    });

    return totalProgress / state.userDeposits.length;
  }, [state.userDeposits]);

  // Actualizar el userInfo con el ROI calculado
  useEffect(() => {
    if (calculateProgress > 0) {
      console.log("Calculated ROI Progress:", calculateProgress);
    }
  }, [calculateProgress]);

  const handleClaim = async () => {
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
    }
    setTimeout(() => setTransactionInfo(null), 5000);
  };

  const getProgressInfo = (days) => {
    if (days >= 365) return { level: 'Max Level', bonus: 5 };
    if (days >= 180) return { nextMilestone: 365, current: 180, bonus: 3, next: 5 };
    if (days >= 90) return { nextMilestone: 180, current: 90, bonus: 1, next: 3 };
    return { nextMilestone: 90, current: 0, bonus: 0, next: 1 };
  };

  return (
    <>
      <BaseCard title="Available Rewards" icon={<FaGift className="text-purple-300" />}>
        <div className="flex flex-col space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rewards Section */}
            <div className="bg-purple-900/10 backdrop-blur-sm p-4 rounded-xl border border-purple-600/20 shadow-lg">
              <span className="text-purple-100/70 text-sm">Accumulated Rewards</span>
              <div className="mt-2">
                <div className="text-2xl font-bold text-purple-300">
                  {formatBalance(userInfo.pendingRewards)} POL
                </div>
                <div className="text-sm text-purple-200/50 mt-1">
                  Available to claim
                </div>
              </div>
            </div>

            {/* ROI Progress Circle */}
            <div className="bg-purple-900/10 backdrop-blur-sm p-4 rounded-xl border border-purple-600/20 shadow-lg">
              <span className="text-purple-100/70 text-sm mb-2 block flex items-center gap-2">
                Time Bonus Progress
                <Tooltip content={`
                  Base ROI: 0.24% daily
                  Current Progress: ${calculateProgress.toFixed(2)}%
                  Max ROI: 125%
                  Days Staked: ${stakingInfo.days}
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
                      strokeDasharray={`${(calculateProgress / 125) * 188.4} 188.4`}
                    />
                  </svg>
                  {/* Percentage Text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="text-lg font-bold text-purple-300">
                      {calculateProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={loading || !userInfo.pendingRewards || userInfo.pendingRewards === '0' || isPending}
            className={`
              w-full bg-blue-800/30 backdrop-blur-sm p-4 rounded-xl 
              border border-purple-600/20 shadow-lg
              hover:bg-purple-800/30 hover:border-purple-500/40
              disabled:opacity-50 disabled:cursor-not-allowed
              text-purple-100 font-medium transition-all duration-300
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <span className="text-purple-300/70">Claiming...</span>
            ) : (
              <>
                <span>Claim Rewards</span>
                {userInfo.pendingRewards && userInfo.pendingRewards !== '0' && (
                  <span className="text-purple-300">→</span>
                )}
              </>
            )}
          </button>
        </div>
      </BaseCard>

      <AnimatePresence>
        {transactionInfo && <TransactionToast {...transactionInfo} />}
      </AnimatePresence>
    </>
  );
};

export default RewardsCard;
