// ButtonDeposit.jsx
import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../context/WalletContext';
import { StakingContext } from '../context/StakingContext';

const DEPOSIT_PRESETS = [5, 10, 50, 100, 500, 1000];
const COMMISSION_RATE = 0.06;

function ButtonDeposit() {
  const { account } = useContext(WalletContext);
  const { 
    makeDeposit, 
    isPending, 
    error, 
    remainingSlots,
    userDeposits,
    isContractPaused,
    fetchUserData 
  } = useContext(StakingContext);

  const [depositAmount, setDepositAmount] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

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
  };

  const validateDeposit = () => {
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      displayNotification('Please enter a valid deposit amount.', 'error');
      return false;
    }

    if (parseFloat(depositAmount) < 5) {
      displayNotification('Minimum deposit is 5 MATIC', 'error');
      return false;
    }
    
    if (parseFloat(depositAmount) > 10000) {
      displayNotification('Maximum deposit is 10,000 MATIC', 'error');
      return false;
    }

    if (remainingSlots <= 0) {
      displayNotification('Maximum deposits reached', 'error');
      return false;
    }

    return true;
  };

    // ButtonDeposit.jsx - Updated handleSubmit
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateDeposit()) return;
  
    try {
      const success = await makeDeposit(depositAmount);
      if (success) {
        displayNotification('Your deposit was successful! 🎉', 'success');
        setDepositAmount('');
        await fetchUserData();
      } else {
        displayNotification('Transaction failed', 'error');
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
      className="rounded-xl p-5 bg-black/20 backdrop-blur-sm border border-purple-500/20"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(139, 92, 246, 0.1)' }}
    >
      {isContractPaused && (
        <div className="mb-4 px-3 py-2 bg-yellow-500/20 text-yellow-200 text-sm rounded-lg">
          Contract is currently paused
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="relative">
            <input
              type="number"
              placeholder="Enter deposit amount"
              onChange={e => setDepositAmount(e.target.value)}
              value={depositAmount}
              min="5"
              max="10000"
              step="0.1"
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/20 
                rounded-lg text-white placeholder-gray-400 focus:outline-none 
                focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 my-4">
            {DEPOSIT_PRESETS.map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                className="px-3 py-2 text-sm bg-purple-500/20 text-white 
                  rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                {amount} MATIC
              </button>
            ))}
          </div>

          {depositAmount && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 p-3 bg-black/20 rounded-lg text-sm"
            >
              <p className="text-gray-400">
                Commission (6%): {(parseFloat(depositAmount || 0) * COMMISSION_RATE).toFixed(4)} MATIC
              </p>
              <p className="text-gray-400">
                Net deposit: {netAmount} MATIC
              </p>
              <p className="text-purple-400">
                Est. max return: {estimatedReturn} MATIC
              </p>
              <p className="text-gray-400">
                Remaining slots: {remainingSlots}/300
              </p>
              <p className="text-gray-400">
                Your deposits: {userDeposits.length}
              </p>
            </motion.div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isPending || !account || isContractPaused}
          className={`relative px-6 py-3 rounded-lg font-medium text-white
            bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </div>
          ) : (
            'Level Up 🚀'
          )}
        </motion.button>
      </form>

      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-lg text-white text-center ${
              notification.type === 'error' ? 'bg-red-500/20' :
              notification.type === 'success' ? 'bg-green-500/20' :
              'bg-blue-500/20'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ButtonDeposit;