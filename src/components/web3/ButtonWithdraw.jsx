import { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../../context/WalletContext';
import { useStaking } from '../../context/StakingContext';
import { FaGem, FaExclamationTriangle } from 'react-icons/fa';

function ButtonWithdraw({ disabled, onSuccess }) {
  const { account } = useContext(WalletContext);
  const { state, withdrawRewards, fetchUserData } = useStaking();
  const { 
    isContractPaused,
    isMigrated,
    isPending,
    estimatedRewards,
    contract
  } = state;

  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (account) {
      // If fetchUserData is available through context, use it
      if (fetchUserData) fetchUserData();
    }
  }, [account, fetchUserData]);

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };
  
  const handleWithdraw = async () => {
    if (!account || state.isContractPaused || state.isMigrated) return;

    try {
      const success = await withdrawRewards();
      if (success) {
        displayNotification('Withdrawal successful! 🎉', 'success');
        if (onSuccess) onSuccess();
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
      
      displayNotification('Processing emergency withdrawal...', 'info');
      
      try {
        const tx = await contractWithSigner.emergencyUserWithdraw({
          gasLimit: 300000n
        });
        
        displayNotification('Transaction submitted...', 'info');
        const receipt = await tx.wait();
  
        if (receipt.status === 1) {
          if (fetchUserData) await fetchUserData();
          displayNotification('Emergency withdrawal successful! 🎉', 'success');
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error('Emergency withdrawal error:', error);
      displayNotification(
        error.reason || 'Failed to withdraw deposits',
        'error'
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Rewards Summary */}
      <motion.div 
        className="space-y-3 p-4 sm:p-6 bg-slate-900/40 rounded-xl border border-teal-500/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="text-teal-400 text-lg sm:text-xl font-medium">Available</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-white font-bold">
              {parseFloat(estimatedRewards).toFixed(6)}
            </span>
          </div>
        </div>
        
        {parseFloat(estimatedRewards) > 0 && (
          <p className="text-amber-400 text-sm mt-2">
            Rewards are ready to be claimed! 🎉
          </p>
        )}
      </motion.div>

      {/* Contract Status */}
      {isContractPaused && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-3 bg-amber-500/20 text-amber-200 text-sm rounded-xl border border-amber-500/20 backdrop-blur-sm"
        >
          Contract is currently paused
        </motion.div>
      )}
      
      {isMigrated && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-3 bg-amber-500/20 text-amber-200 text-sm rounded-xl border border-amber-500/20 backdrop-blur-sm"
        >
          Contract has been migrated
        </motion.div>
      )}

      {/* Withdraw Button */}
      <motion.button
        onClick={handleWithdraw}
        disabled={isPending || !account || isContractPaused || isMigrated || parseFloat(estimatedRewards) <= 0}
        className={`relative px-6 py-4 rounded-xl font-medium text-base text-white
          bg-gradient-to-r from-teal-600 to-emerald-600 
          hover:from-teal-500 hover:to-emerald-500
          disabled:opacity-50 disabled:cursor-not-allowed
          border border-teal-500/50 shadow-lg shadow-teal-600/20
          transition-all duration-300`}
        whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(20, 184, 166, 0.2)" }}
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
          <div className="flex items-center justify-center gap-12">
            Claim Rewards
            <FaGem className="text-amber-300" />
          </div>
        )}
      </motion.button>

      {/* Emergency Withdraw Button */}
      {isContractPaused && (
        <motion.button
          onClick={handleEmergencyWithdraw}
          disabled={!account || !isContractPaused}
          className={`relative px-6 py-4 rounded-xl font-medium text-base text-white
            bg-gradient-to-r from-red-600 to-amber-600 
            hover:from-red-500 hover:to-amber-500
            disabled:opacity-50 disabled:cursor-not-allowed
            border border-red-500/50 shadow-lg shadow-red-600/20
            transition-all duration-300`}
          whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2">
            <FaExclamationTriangle />
            Emergency Withdraw
          </div>
        </motion.button>
      )}

      {/* Help Text */}
      {parseFloat(estimatedRewards) <= 0 && !isContractPaused && (
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
              notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/20' :
              'bg-blue-500/20 border-blue-500/20'
            } backdrop-blur-sm`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ButtonWithdraw;