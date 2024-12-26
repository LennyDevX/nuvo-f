import React, { useState } from 'react';
import { FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import BaseCard from './BaseCard';
import { useStaking } from '../../../../context/StakingContext';
import { parseEther } from 'ethers';
import Tooltip from '../Tooltip';
import WithdrawModal from '../../../modals/WithdrawModal';
import TransactionToast from '../../../ui/TransactionToast';

const StakingActionsCard = ({ onDeposit, onWithdraw, showToast }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState(null);
  const { deposit, withdraw, withdrawAll, state } = useStaking();
  const { isContractPaused } = state;

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
      <BaseCard title="Staking Actions" icon={<FaExchangeAlt className="text-purple-300" />}>
        <div className="flex flex-col h-full space-y-4">
          {/* Input Container */}
          <div className="bg-purple-900/10 backdrop-blur-sm p-4 rounded-xl border border-purple-600/20 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-100/70 text-sm">Deposit Amount</span>
              <Tooltip content={`Min: ${MIN_DEPOSIT} POL, Max: ${MAX_DEPOSIT} POL`}>
                <FaInfoCircle className="text-purple-400/60 hover:text-purple-300 w-3.5 h-3.5" />
              </Tooltip>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-purple-900/20 text-purple-50 placeholder-purple-300/30 rounded-lg p-3 outline-none border border-purple-600/20 focus:border-purple-500/40 transition-all"
              placeholder={`Enter amount (${MIN_DEPOSIT}-${MAX_DEPOSIT} POL)`}
              disabled={loading || isContractPaused}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDeposit}
              className={`
                bg-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/30
                hover:bg-purple-800/30 hover:border-purple-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                text-purple-100 font-medium transition-all duration-300
                flex items-center justify-center gap-2
              `}
              disabled={loading || isContractPaused || !amount || parseFloat(amount) < MIN_DEPOSIT || parseFloat(amount) > MAX_DEPOSIT}
            >
              {loading ? (
                <span className="text-purple-300/70">Processing...</span>
              ) : (
                <>
                  <span>Deposit</span>
                  {amount && parseFloat(amount) >= MIN_DEPOSIT && parseFloat(amount) <= MAX_DEPOSIT && (
                    <span className="text-purple-300">→</span>
                  )}
                </>
              )}
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className={`
                bg-pink-800/30 backdrop-blur-sm p-4 rounded-xl border border-pink-600/20
                hover:bg-pink-800/30 hover:border-pink-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                text-pink-100 font-medium transition-all duration-300
                flex items-center justify-center gap-2
              `}
              disabled={loading}
            >
              {loading ? (
                <span className="text-pink-300/70">Processing...</span>
              ) : (
                <>
                  <span>Withdraw All</span>
                  <span className="text-pink-300">←</span>
                </>
              )}
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
