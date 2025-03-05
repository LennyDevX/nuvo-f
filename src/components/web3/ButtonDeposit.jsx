import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../../context/WalletContext';
import { useStaking } from '../../context/StakingContext';
import { FaCoins, FaChartLine, FaInfoCircle, FaRocket, FaStar } from 'react-icons/fa';

// Constantes
const DEPOSIT_PRESETS = [5, 10, 50];
const COMMISSION_RATE = 0.06;

function ButtonDeposit({ onSuccess }) {
  const { account } = useContext(WalletContext);
  const { state, deposit } = useStaking();
  const { isPending, isContractPaused, userDeposits } = state;

  const [depositAmount, setDepositAmount] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcular slots disponibles
  const remainingSlots = useMemo(() => {
    const maxDepositsPerUser = 300; // Esto debería venir de STAKING_CONSTANTS
    return maxDepositsPerUser - (userDeposits?.length || 0);
  }, [userDeposits]);

  const calculateNetAmount = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0;
    const commission = value * COMMISSION_RATE;
    return (value - commission).toFixed(4);
  };

  const calculateEstimatedReturn = (netAmount) => {
    return (netAmount * 1.3).toFixed(4);
  };

  const handlePresetClick = (amount) => {
    setDepositAmount(amount.toString());
    setIsExpanded(true);
  };

  const validateDeposit = () => {
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      displayNotification('Please enter a valid deposit amount.', 'error');
      return false;
    }

    if (parseFloat(depositAmount) < 5) {
      displayNotification('Minimum deposit is 5 POL', 'error');
      return false;
    }

    if (parseFloat(depositAmount) > 10000) {
      displayNotification('Maximum deposit is 10,000 POL', 'error');
      return false;
    }

    if (remainingSlots <= 0) {
      displayNotification('Maximum deposits reached', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateDeposit()) return;

    try {
      const success = await deposit(depositAmount);
      if (success) {
        displayNotification('Your deposit was successful! 🎉', 'success');
        setDepositAmount('');
        setIsExpanded(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Deposit error:', error);
      displayNotification(
        error.reason || error.message || 'Failed to deposit',
        'error'
      );
    }
  };

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const netAmount = calculateNetAmount(depositAmount);
  const estimatedReturn = calculateEstimatedReturn(netAmount);

  return (
    <motion.div
      className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-teal-900/40 to-slate-900/40 border border-teal-500/30 backdrop-blur-sm w-full shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Título */}
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-teal-700/30">
        <div className="bg-teal-900/50 p-2 rounded-lg">
          <FaStar className="text-amber-400 text-xl" />
        </div>
        <h3 className="text-base font-semibold text-white">Boost Your Earnings</h3>
      </div>

      {/* Alerta de contrato pausado */}
      {isContractPaused && (
        <div className="mb-4 sm:mb-6 px-3 py-2 sm:px-4 sm:py-3 bg-amber-500/20 text-amber-200 text-xs sm:text-sm rounded-xl border border-amber-500/20 backdrop-blur-sm flex items-center gap-2">
          <FaInfoCircle className="text-amber-400 flex-shrink-0" />
          <span>Contract is currently paused</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <input
              type="number"
              placeholder="Enter deposit amount"
              onChange={(e) => setDepositAmount(e.target.value)}
              value={depositAmount}
              min="5"
              max="10000"
              step="0.1"
              className="w-full px-4 sm:px-5 py-3 bg-slate-800/60 border border-teal-500/40 
                rounded-xl text-white placeholder-slate-400 focus:outline-none 
                focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                text-base transition-all duration-300"
            />
            <div className="absolute right-3 top-3 text-amber-400/90 font-medium text-sm">POL</div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {DEPOSIT_PRESETS.map((amount, index) => (
              <motion.button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                className="px-2 sm:px-3 py-2 text-sm text-white bg-gradient-to-r from-teal-600/90 to-emerald-700/90
                  border border-teal-500/40 rounded-xl hover:border-amber-400/60 
                  transition-all duration-300 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -2, boxShadow: '0 5px 15px rgba(20, 184, 166, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {amount} POL
              </motion.button>
            ))}
          </div>

          {isExpanded && depositAmount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 sm:space-y-3 p-4 sm:p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-teal-500/30 backdrop-blur-sm text-sm"
            >
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-amber-400/90 text-xs" />
                  <span>Commission (6%):</span>
                </div>
                <span className="font-mono">
                  {(parseFloat(depositAmount || 0) * COMMISSION_RATE).toFixed(4)} POL
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <FaCoins className="text-amber-400/90 text-xs" />
                  <span>Net deposit:</span>
                </div>
                <span className="font-mono">{netAmount} POL</span>
              </div>
              <div className="flex items-center justify-between text-teal-300 font-medium">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-amber-400/90 text-xs" />
                  <span>Est. max return:</span>
                </div>
                <span className="font-mono">{estimatedReturn} POL</span>
              </div>
              <div className="border-t border-teal-500/20 pt-2 sm:pt-3 mt-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Remaining slots:</span>
                  <span className="font-mono text-teal-300">{remainingSlots}/300</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Your deposits:</span>
                  <span className="font-mono text-teal-300">{userDeposits?.length || 0}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isPending || !account || isContractPaused}
          className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-base sm:text-lg text-white
            bg-gradient-to-r from-teal-600 to-emerald-600 
            hover:from-teal-500 hover:to-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-teal-600/20
            border border-teal-500/50
            transition-all duration-300`}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(20, 184, 166, 0.25)' }}
          whileTap={{ scale: 0.98 }}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </div>
          ) : (
            <>
              <FaRocket className="text-lg" />
              <span>Boost Stake</span>
            </>
          )}
        </motion.button>
      </form>

      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 p-4 rounded-xl text-white text-center border ${
              notification.type === 'error'
                ? 'bg-red-500/20 border-red-500/30'
                : notification.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : 'bg-blue-500/20 border-blue-500/30'
            } backdrop-blur-sm`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ButtonDeposit;