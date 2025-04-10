import React, { useState, useCallback, useMemo } from 'react';
import { FaExchangeAlt, FaInfoCircle, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import BaseCard from './BaseCard';
import { useStaking } from '../../../../context/StakingContext';
import { parseEther } from 'ethers';
import Tooltip from '../../../ui/Tooltip';
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

  // Memoized validation check
  const isValidAmount = useMemo(() => {
    return amount && !isNaN(amount) && 
           parseFloat(amount) >= MIN_DEPOSIT && 
           parseFloat(amount) <= MAX_DEPOSIT;
  }, [amount]);

  // Optimized amount change handler
  const handleAmountChange = useCallback((e) => {
    setAmount(e.target.value);
  }, []);

  // Optimized deposit handler
  const handleDeposit = useCallback(async () => {
    if (!isValidAmount) {
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
  }, [amount, deposit, isValidAmount, onDeposit, showToast]);

  // Optimized withdraw handler
  const handleWithdraw = useCallback(async () => {
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
  }, [withdraw, onWithdraw, showToast]);

  // Memoized error formatter
  const formatWithdrawError = useCallback((error) => {
    if (error?.reason?.includes("Insufficient contract balance")) {
      return "There are not enough funds in the contract right now. Please try withdrawing a smaller amount or try again later.";
    }
    if (error?.code === "ACTION_REJECTED") {
      return "Transaction was cancelled by user.";
    }
    return "Failed to withdraw funds. Please try again later.";
  }, []);

  // Optimized withdraw all handler
  const handleWithdrawAll = useCallback(async () => {
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
  }, [withdrawAll, formatWithdrawError, onWithdraw, showToast]);

  // Optimized modal handlers
  const openWithdrawModal = useCallback(() => setShowWithdrawModal(true), []);
  const closeWithdrawModal = useCallback(() => {
    setShowWithdrawModal(false);
    setWithdrawError(null);
  }, []);

  // Memoized animation variants
  const buttonVariants = useMemo(() => ({
    idle: { scale: 1 },
    hover: { 
      scale: 1.02,
      boxShadow: '0 0 15px rgba(149, 76, 233, 0.6)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  }), []);

  return (
    <>
      <BaseCard title="Staking Actions" icon={<FaExchangeAlt className="text-purple-300" />}>
        <div className="flex flex-col h-full space-y-4">
          {/* Input Container */}
          <div className=" p-4 rounded-xl border border-violet-700/20 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-100/70 text-sm">Deposit Amount</span>
              <Tooltip content={`Min: ${MIN_DEPOSIT} POL, Max: ${MAX_DEPOSIT} POL`}>
                <FaInfoCircle className="text-purple-400/60 hover:text-purple-300 w-3.5 h-3.5" />
              </Tooltip>
            </div>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-purple-900/20 text-purple-50 placeholder-purple-300/30 rounded-lg p-3 outline-none border border-purple-600/20 focus:border-purple-500/40 transition-all"
              placeholder={`Enter amount (${MIN_DEPOSIT}-${MAX_DEPOSIT} POL)`}
              disabled={loading || isContractPaused}
            />
          </div>

          {/* Action Buttons - Redesigned */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleDeposit}
              variants={buttonVariants}
              initial="idle"
              whileHover={loading || !isValidAmount ? "idle" : "hover"}
              whileTap={loading || !isValidAmount ? "idle" : "tap"}
              className={`
                bg-gradient-to-r from-emerald-600/80 to-teal-500/80 
                backdrop-blur-sm p-4 rounded-xl 
                border border-violet-700/20
                text-white font-medium 
                shadow-lg shadow-emerald-900/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                flex items-center justify-center gap-2
                overflow-hidden relative
              `}
              disabled={loading || isContractPaused || !isValidAmount}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span className="ml-2 text-white/90">Processing...</span>
                </div>
              ) : (
                <>
                  <FaArrowDown className="text-white/80" />
                  <span>Deposit</span>
                  {isValidAmount && (
                    <motion.span 
                      className="absolute right-4 opacity-0"
                      animate={{ x: [10, 0], opacity: [0, 1] }}
                      transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                    >
                      →
                    </motion.span>
                  )}
                </>
              )}
            </motion.button>

            <motion.button
              onClick={openWithdrawModal}
              variants={buttonVariants}
              initial="idle"
              whileHover={loading ? "idle" : "hover"}
              whileTap={loading ? "idle" : "tap"}
              className={`
                bg-gradient-to-r from-rose-600/80 to-pink-500/80
                backdrop-blur-sm p-4 rounded-xl 
                border border-violet-700/20
                text-white font-medium 
                shadow-lg shadow-rose-900/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                flex items-center justify-center gap-2
                overflow-hidden relative
              `}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span className="ml-2 text-white/90">Processing...</span>
                </div>
              ) : (
                <>
                  <FaArrowUp className="text-white/80" />
                  <span>Withdraw All</span>
                  <motion.span 
                    className="absolute right-4 opacity-0"
                    animate={{ x: [-10, 0], opacity: [0, 1] }}
                    transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                  >
                    ←
                  </motion.span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </BaseCard>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={closeWithdrawModal}
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

export default React.memo(StakingActionsCard);
