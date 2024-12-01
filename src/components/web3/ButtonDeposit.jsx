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
      className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
    >
      {isContractPaused && (
        <div className="mb-6 px-4 py-3 bg-yellow-500/20 text-yellow-200 text-sm rounded-xl border border-yellow-500/20 backdrop-blur-sm">
          Contract is currently paused
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="relative">
            <input
              type="number"
              placeholder="Enter deposit amount"
              onChange={e => setDepositAmount(e.target.value)}
              value={depositAmount}
              min="5"
              max="10000"
              step="0.1"
              className="w-full px-6 py-4 bg-black/40 border border-purple-500/20 
                rounded-xl text-white placeholder-gray-400 focus:outline-none 
                focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                text-lg transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {DEPOSIT_PRESETS.map((amount, index) => (
              <motion.button
                key={amount}
                type="button"
                onClick={() => handlePresetClick(amount)}
                className="px-4 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600
                  border border-purple-500/20 rounded-xl hover:bg-purple-500/30 
                  transition-all duration-300 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(139, 92, 246, 0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                {amount} POL
              </motion.button>
            ))}
          </div>

          {depositAmount && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 p-6 bg-black/30 rounded-xl border border-purple-500/20 backdrop-blur-sm"
            >
              <p className="text-gray-300 flex justify-between">
                <span>Commission (6%):</span>
                <span>{(parseFloat(depositAmount || 0) * COMMISSION_RATE).toFixed(4)} MATIC</span>
              </p>
              <p className="text-gray-300 flex justify-between">
                <span>Net deposit:</span>
                <span>{netAmount} MATIC</span>
              </p>
              <p className="text-purple-400 flex justify-between font-medium">
                <span>Est. max return:</span>
                <span>{estimatedReturn} MATIC</span>
              </p>
              <div className="border-t border-purple-500/20 pt-3">
                <p className="text-gray-300 flex justify-between">
                  <span>Remaining slots:</span>
                  <span>{remainingSlots}/300</span>
                </p>
                <p className="text-gray-300 flex justify-between">
                  <span>Your deposits:</span>
                  <span>{userDeposits.length}</span>
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isPending || !account || isContractPaused}
          className={`relative px-8 py-4 rounded-xl font-medium text-lg text-white
            bg-gradient-to-r from-purple-600 to-pink-600 
            hover:from-purple-700 hover:to-pink-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300`}
          whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
          whileTap={{ scale: 0.98 }}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-3">
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
            className={`mt-6 p-4 rounded-xl text-white text-center border ${
              notification.type === 'error' ? 'bg-red-500/20 border-red-500/20' :
              notification.type === 'success' ? 'bg-green-500/20 border-green-500/20' :
              'bg-blue-500/20 border-blue-500/20'
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