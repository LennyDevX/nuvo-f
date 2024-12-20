import React, { useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import BaseCard from './BaseCard';
import { useStaking } from '../../../context/StakingContext';
import { parseEther } from 'ethers';
import WithdrawModal from '../../../modal/WithdrawModal';
import TransactionToast from '../../../ui/TransactionToast';

const StakingActionsCard = ({ onDeposit, onWithdraw, showToast }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState(null);
  const { deposit, withdraw, withdrawAll, state } = useStaking();
  const { isContractPaused, isMigrated } = state;

  const MIN_DEPOSIT = 5;
  const MAX_DEPOSIT = 10000;

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) < MIN_DEPOSIT || parseFloat(amount) > MAX_DEPOSIT) {
      showToast?.(`Please enter an amount between ${MIN_DEPOSIT} and ${MAX_DEPOSIT}`, 'error');
      return;
    }

    setLoading(true);
    setTransactionInfo({
      message: 'Processing Deposit',
      type: 'loading',
      details: `Depositing ${amount} POL into the staking contract...`
    });

    try {
      if (typeof deposit !== 'function') {
        throw new Error('Deposit function not available');
      }
      const parsedAmount = parseEther(amount.toString());
      const tx = await deposit(parsedAmount);
      setTransactionInfo({
        message: 'Deposit Successful! 🎉',
        type: 'success',
        details: `Successfully deposited ${amount} POL. Your funds are now earning rewards.`,
        hash: tx.hash
      });
      setAmount('');
      if (typeof showToast === 'function') {
        showToast('Deposit successful!', 'success');
      }
      if (typeof onDeposit === 'function') {
        onDeposit();
      }
    } catch (error) {
      console.error('Error depositing:', error);
      setTransactionInfo({
        message: 'Deposit Failed',
        type: 'error',
        details: error.reason || 'There was an error processing your deposit. Please try again.'
      });
      if (typeof showToast === 'function') {
        showToast(error.reason || 'Failed to deposit', 'error');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setTransactionInfo(null), 5000);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setWithdrawError(null);
    setTransactionInfo({
      message: 'Processing Withdrawal',
      type: 'loading',
      details: 'Withdrawing funds from the staking contract...'
    });

    try {
      const success = await withdraw();
      if (success) {
        showToast?.('Withdrawal successful!', 'success');
        onWithdraw?.();
        setTransactionInfo({
          message: 'Withdrawal Successful! 🎉',
          type: 'success',
          details: 'Successfully withdrawn funds from the staking contract.'
        });
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      setTransactionInfo({
        message: 'Withdrawal Failed',
        type: 'error',
        details: error.reason || 'There was an error processing your withdrawal. Please try again.'
      });
      showToast?.(error.reason || 'Failed to withdraw', 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setTransactionInfo(null), 5000);
    }
  };

  const formatWithdrawError = (error) => {
    if (error?.reason?.includes("Insufficient contract balance")) {
      return "There are not enough funds in the contract right now. Please try withdrawing a smaller amount or try again later.";
    }
    if (error?.code === "ACTION_REJECTED") {
      return "Transaction was cancelled by user.";
    }
    return "Failed to withdraw funds. Please try again later.";
  };

  const handleWithdrawAll = async () => {
    if (!withdrawAll) {
      showToast?.('Withdraw function not available', 'error');
      return;
    }

    setLoading(true);
    setWithdrawError(null);
    setTransactionInfo({
      message: 'Processing Withdrawal',
      type: 'loading',
      details: 'Withdrawing all funds from the staking contract...'
    });

    try {
      const success = await withdrawAll();
      if (success) {
        setShowWithdrawModal(false);
        if (typeof showToast === 'function') {
          showToast('All funds withdrawn successfully!', 'success');
        }
        if (typeof onWithdraw === 'function') {
          onWithdraw();
        }
        setTransactionInfo({
          message: 'Withdrawal Successful! 🎉',
          type: 'success',
          details: 'Successfully withdrawn all funds from the staking contract.'
        });
      }
    } catch (error) {
      console.error('Error withdrawing all:', error);
      const errorMessage = formatWithdrawError(error);
      setWithdrawError(errorMessage);
      setTransactionInfo({
        message: 'Withdrawal Failed',
        type: 'error',
        details: errorMessage
      });
      if (typeof showToast === 'function') {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setTransactionInfo(null), 5000);
    }
  };

  return (
    <>
      <BaseCard title="Staking Actions" icon={<FaExchangeAlt />}>
        <div className="flex flex-col h-full">
          <div className="bg-black/40 rounded-lg p-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-lg"
              placeholder={`Enter amount (${MIN_DEPOSIT}-${MAX_DEPOSIT} POL)`}
              disabled={loading || isContractPaused}
            />
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleDeposit}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
              disabled={loading || isContractPaused || !amount || parseFloat(amount) < MIN_DEPOSIT || parseFloat(amount) > MAX_DEPOSIT}
            >
              {loading ? 'Processing...' : 'Deposit'}
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 py-3 px-4 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Withdraw All'}
            </button>
          </div>
        </div>
      </BaseCard>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setWithdrawError(null);
        }}
        onConfirm={handleWithdrawAll}
        loading={loading}
        error={withdrawError}
      />

      <AnimatePresence>
        {transactionInfo && <TransactionToast {...transactionInfo} />}
      </AnimatePresence>
    </>
  );
};

export default StakingActionsCard;
