import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useStaking } from '../context/StakingContext';
import { WalletContext } from '../context/WalletContext';
import { useContext } from 'react';

function ButtonWithdrawAll() {
  const { account } = useContext(WalletContext);
  const { state, contract } = useStaking();
  const { isPending, isContractPaused, isMigrated } = state;
  
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (!contract || !account) {
      console.error("Contract or account not available");
      displayNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      // Verificar balance del contrato y rewards
      const contractBalance = await contract.getContractBalance();
      const userInfo = await contract.getUserInfo(account);
      const totalToWithdraw = userInfo.totalDeposited + userInfo.pendingRewards;
      
      console.log('Contract balance:', ethers.formatEther(contractBalance));
      console.log('Total to withdraw:', ethers.formatEther(totalToWithdraw));

      if (contractBalance < totalToWithdraw) {
        displayNotification(
          'The contract currently has insufficient funds. Please try again later or contact support.',
          'error'
        );
        return;
      }

      // Si hay fondos suficientes, mostrar el modal de confirmación
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error checking balances:", error);
      displayNotification('Error checking contract balance', 'error');
      return;
    }
  };

  const handleConfirm = async () => {
    if (!contract || !account || isContractPaused || isMigrated) {
      displayNotification('Cannot proceed with withdrawal', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setShowConfirmation(false);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      // Intentar estimar el gas primero
      try {
        const gasEstimate = await contractWithSigner.withdrawAll.estimateGas();
        console.log("Estimated gas:", gasEstimate.toString());
        
        const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
        const tx = await contractWithSigner.withdrawAll({ gasLimit });
        
        console.log("Transaction sent:", tx.hash);
        displayNotification('Transaction submitted, please wait...', 'info');

        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);

        if (receipt.status === 1) {
          await fetchUserData();
          displayNotification('Successfully withdrawn all funds! 🎉', 'success');
        }
      } catch (error) {
        if (error.message.includes("Insufficient contract balance")) {
          displayNotification(
            'The contract currently has insufficient funds to process your withdrawal. Please try again later.',
            'error'
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('WithdrawAll error:', error);
      
      let errorMessage = 'Failed to withdraw funds';
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message?.includes("user rejected")) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = 'Insufficient funds for gas';
      }
      
      displayNotification(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        disabled={isProcessing || isPending || !account || isContractPaused || isMigrated}
        className={`
          w-full px-6 py-3 rounded-xl font-medium
          bg-gradient-to-r from-purple-600 to-pink-600
          hover:from-purple-700 hover:to-pink-700
          text-white transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isProcessing || isPending ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing...
          </div>
        ) : (
          <span>Withdraw All Funds 💎</span>
        )}
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 p-6 rounded-2xl border border-purple-500/20 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">⚠️ Warning</h3>
              <p className="text-gray-300 mb-6">
                By withdrawing all your rewards and deposits, you will stop participating in the staking program. 
                This action cannot be undone. Are you sure you want to proceed?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Yes, withdraw all
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`
              mt-4 p-4 rounded-xl text-white text-center
              ${notification.type === 'error' ? 'bg-red-500/20' : 
                notification.type === 'success' ? 'bg-green-500/20' : 
                'bg-blue-500/20'}
            `}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ButtonWithdrawAll;