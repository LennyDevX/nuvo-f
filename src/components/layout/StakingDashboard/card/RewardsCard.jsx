import React, { useState, useEffect } from 'react';
import { FaGift } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../context/StakingContext';
import TransactionToast from '../../../ui/TransactionToast';
import { AnimatePresence } from 'framer-motion';

const RewardsCard = ({ availableRewards, onClaim, showToast }) => {
  const [loading, setLoading] = useState(false);
  const { withdrawRewards, state } = useStaking();
  const { contract, isPending } = state;
  const userInfo = state.userInfo || { pendingRewards: '0', roiProgress: 0 };
  const [transactionInfo, setTransactionInfo] = useState(null);

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

  return (
    <>
      <BaseCard title="Available Rewards" icon={<FaGift />} className="h-full">
        <div className="space-y-4">
          <div className="bg-black/40 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatBalance(userInfo.pendingRewards)} POL
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Accumulated Rewards
            </div>
            {userInfo.roiProgress > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-400">ROI Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(userInfo.roiProgress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  {userInfo.roiProgress.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleClaim}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            disabled={loading || !userInfo.pendingRewards || userInfo.pendingRewards === '0' || isPending}
          >
            {loading ? 'Claiming...' : 'Claim Rewards'}
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
