// ButtonWithdraw.jsx
import React, { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../../context/WalletContext';
import { useStaking } from '../../context/StakingContext';
import PolygonLogo from "/PolygonLogo.png";

function ButtonWithdraw() {
  const { account } = useContext(WalletContext);
  const { state, withdrawRewards } = useStaking();
  const { 
    isContractPaused,
    isMigrated,
    isPending,
    estimatedRewards 
  } = state;

  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (account) {
      fetchUserData();
    }
  }, [account]);

  const handleWithdraw = async () => {
    if (!account || state.isContractPaused || state.isMigrated) return;

    try {
      const success = await withdrawRewards();
      if (success) {
        displayNotification('Withdrawal successful! 🎉', 'success');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      displayNotification(
        error.reason || 'Failed to withdraw rewards',
        'error'
      );
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!contract || !account || !isContractPaused) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.emergencyUserWithdraw({
        gasLimit: 300000n
      });

      displayNotification('Transaction submitted...', 'info');
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        await fetchUserData();
        displayNotification('Emergency withdrawal successful! 🎉', 'success');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Emergency withdrawal error:', error);
      displayNotification(
        error.reason || 'Failed to withdraw deposits',
        'error'
      );
    }
  };

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  return (
    <motion.div 
      className="rounded-2xl p-4 sm:p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Rewards Summary */}
        <motion.div 
          className="space-y-3 p-4 sm:p-6 bg-black/30 rounded-xl border border-purple-500/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-purple-400 text-lg sm:text-xl font-medium">Available</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl text-white font-bold">
                {parseFloat(estimatedRewards).toFixed(6)}
              </span>
            </div>
          </div>
          
          {parseFloat(estimatedRewards) > 0 && (
            <p className="text-green-400 text-sm mt-2">
              Rewards are ready to be withdrawn! 🎉
            </p>
          )}
        </motion.div>

        {/* Contract Status */}
        {isContractPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 bg-yellow-500/20 text-yellow-200 text-sm rounded-xl border border-yellow-500/20 backdrop-blur-sm"
          >
            Contract is currently paused
          </motion.div>
        )}
        
        {isMigrated && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 bg-yellow-500/20 text-yellow-200 text-sm rounded-xl border border-yellow-500/20 backdrop-blur-sm"
          >
            Contract has been migrated
          </motion.div>
        )}

        {/* Withdraw Button */}
        <motion.button
          onClick={handleWithdraw}
          disabled={isPending || !account || isContractPaused || isMigrated || parseFloat(estimatedRewards) <= 0}
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
            <div className="flex items-center justify-center gap-2">
              Withdraw Rewards
              <span className="text-xl">💎</span>
            </div>
          )}
        </motion.button>

        {/* Emergency Withdraw Button */}
        {isContractPaused && (
          <motion.button
            onClick={handleEmergencyWithdraw}
            disabled={isPending || !account || !isContractPaused}
            className={`relative px-8 py-4 rounded-xl font-medium text-lg text-white
              bg-gradient-to-r from-red-600 to-red-700 
              hover:from-red-700 hover:to-red-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 mt-4`}
            whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(255, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            Emergency Withdraw
          </motion.button>
        )}

        {/* Help Text */}
        {parseFloat(estimatedRewards) <= 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 text-sm"
          >
            No rewards available for withdrawal yet
          </motion.p>
        )}

        {/* Notifications */}
        <AnimatePresence>
          {notification.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-4 rounded-xl text-white text-center border ${
                notification.type === 'error' ? 'bg-red-500/20 border-red-500/20' :
                notification.type === 'success' ? 'bg-green-500/20 border-green-500/20' :
                'bg-blue-500/20 border-blue-500/20'
              } backdrop-blur-sm`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ButtonWithdraw;