// ButtonWithdraw.jsx
import React, { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../context/WalletContext';
import { StakingContext } from '../context/StakingContext';
import PolygonLogo from "/PolygonLogo.png";

function ButtonWithdraw() {
  const { account } = useContext(WalletContext);
  const { 
    contract,
    estimatedRewards,
    isContractPaused,
    isMigrated,
    isPending,
    fetchUserData 
  } = useContext(StakingContext);

  const [notification, setNotification] = useState({ message: '', type: '' });
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  useEffect(() => {
    if (account) {
      fetchUserData();
    }
  }, [account]);

  const handleWithdraw = async () => {
    if (!contract || !account || isContractPaused || isMigrated) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.withdraw({
        gasLimit: 300000
      });

      displayNotification('Transaction submitted...', 'info');
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        await fetchUserData();
        displayNotification('Withdrawal successful! 🎉', 'success');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      displayNotification(
        error.reason || 'Failed to withdraw rewards',
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
      className="rounded-xl p-5 bg-black/20 backdrop-blur-sm border border-purple-500/20"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(139, 92, 246, 0.1)' }}
    >
      <div className="flex flex-col gap-4">
        {/* Rewards Summary */}
        <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Available to Withdraw</span>
            <span className="text-white font-medium flex items-center gap-2">
              {parseFloat(estimatedRewards).toFixed(6)}
              <img src={PolygonLogo} alt="MATIC" className="h-4 w-4" />
            </span>
          </div>
          
          {parseFloat(estimatedRewards) > 0 && (
            <p className="text-xs text-green-400 mt-1">
              Rewards are ready to be withdrawn! 🎉
            </p>
          )}
        </div>

        {/* Contract Status */}
        {isContractPaused && (
          <div className="bg-red-500/20 text-red-200 text-sm rounded-lg p-3">
            Contract is currently paused
          </div>
        )}
        
        {isMigrated && (
          <div className="bg-yellow-500/20 text-yellow-200 text-sm rounded-lg p-3">
            Contract has been migrated
          </div>
        )}

        {/* Withdraw Button */}
        <motion.button
          onClick={handleWithdraw}
          disabled={isPending || !account || isContractPaused || isMigrated || parseFloat(estimatedRewards) <= 0}
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
            <div className="flex items-center justify-center gap-2">
              Withdraw Rewards
              <span className="text-xl">💎</span>
            </div>
          )}
        </motion.button>

        {/* Help Text */}
        {parseFloat(estimatedRewards) <= 0 && (
          <p className="text-center text-sm text-gray-400">
            No rewards available for withdrawal yet
          </p>
        )}

        {/* Notifications */}
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
      </div>
    </motion.div>
  );
}

export default ButtonWithdraw;