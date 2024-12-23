// src/components/web3/ButtonClaimAirdrop.jsx
import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { WalletContext } from '../../context/WalletContext';
import { FaGift } from 'react-icons/fa';
import AirdropABI from '../../Abi/Airdrop.json'; 

const ButtonClaimAirdrop = ({ account, isEligible }) => {
  const { provider } = useContext(WalletContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [airdropStats, setAirdropStats] = useState({
    isActive: false,
    isFunded: false,
    hasClaimed: false
  });

  const AIRDROP_CONTRACT_ADDRESS = import.meta.env.VITE_AIRDROP_ADDRESS;

  useEffect(() => {
    if (account && provider) {
      checkAirdropStatus();
      console.log('Current eligibility:', isEligible); // Debug log
    }
  }, [account, provider, isEligible]);

  const checkAirdropStatus = async () => {
    try {
      if (!provider) return;

      const contract = new ethers.Contract(
        import.meta.env.VITE_AIRDROP_ADDRESS,
        AirdropABI.abi,
        provider
      );

      // Verificar el contrato directamente
      const [airdropActive, userEligibility] = await Promise.all([
        contract.isAirdropActive(),
        contract.checkUserEligibility(account)
      ]);

      console.log('Airdrop Contract Check:', {
        address: import.meta.env.VITE_AIRDROP_ADDRESS,
        isActive: airdropActive,
        userEligibility
      });

      setAirdropStats({
        isActive: airdropActive,
        isFunded: true, // Asumimos que está funded si el contrato está desplegado
        hasClaimed: userEligibility.hasClaimed_
      });

    } catch (error) {
      console.error('Contract Check Error:', {
        message: error.message,
        address: import.meta.env.VITE_AIRDROP_ADDRESS
      });
    }
  };

  const handleClick = () => {
    if (!account) {
      displayNotification('Please connect your wallet', 'error');
      return;
    }
    // Removed duplicate eligibility check since it's handled by the prop
    if (airdropStats.hasClaimed) {
      displayNotification('You have already claimed your tokens', 'error');
      return;
    }
    if (!airdropStats.isActive) {
      displayNotification('Airdrop is not active at this moment', 'error');
      return;
    }
    if (!airdropStats.isFunded) {
      displayNotification('Airdrop is not funded at this moment', 'error');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setShowConfirmation(false);

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        AIRDROP_CONTRACT_ADDRESS,
        AirdropABI.abi,  // Changed to use the abi property from the imported JSON
        signer
      );

      const tx = await contract.claimTokens();
      displayNotification('Transaction submitted. Waiting for confirmation...', 'info');

      await tx.wait();
      await checkAirdropStatus(); // Refresh status after claim
      displayNotification('Successfully claimed 10 POL tokens! 🎉', 'success');
    } catch (error) {
      console.error('Claim error:', error);
      if (error.reason?.includes("AirdropActive")) {
        displayNotification('Airdrop is not active at this moment', 'error');
      } else if (error.reason?.includes("AlreadyClaimed")) {
        displayNotification('You have already claimed your tokens', 'error');
      } else if (error.reason?.includes("NotEligible")) {
        displayNotification('You are not eligible for this airdrop', 'error');
      } else if (error.reason?.includes("InsufficientContractBalance")) {
        displayNotification('Airdrop contract has insufficient balance', 'error');
      } else {
        displayNotification(
          'Failed to claim airdrop. Please try again.',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => setShowConfirmation(false);

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  return (
    <div className="w-full">
      {/* Debug info solo en desarrollo */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-400 mb-2">
          Contract: {import.meta.env.VITE_AIRDROP_ADDRESS}
        </div>
      )}

      <motion.button
        onClick={handleClick}
        disabled={isLoading || !account || !isEligible || airdropStats.hasClaimed}
        className={`
          w-full px-6 py-4 rounded-xl font-medium text-lg
          bg-gradient-to-r from-purple-600 to-pink-600
          hover:from-purple-700 hover:to-pink-700
          text-white transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaGift className="text-xl" />
        {isLoading ? "Processing..." : 
         !account ? "Connect Wallet" :
         airdropStats.hasClaimed ? "Already Claimed" : 
         !airdropStats.isActive ? `Airdrop Not Active ${airdropStats.remainingTime ? `(${airdropStats.remainingTime}s)` : ''}` :
         !isEligible ? "Not Eligible" :
         "Claim 10 POL"}
      </motion.button>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          >
            <motion.div
              className="bg-gray-900 p-6 rounded-2xl border border-purple-500/20 max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">🎁 Claim Airdrop</h3>
              <p className="text-gray-300 mb-6">
                You are about to claim your airdrop tokens. This action will initiate a blockchain transaction.
                Are you sure you want to proceed?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Yes, Claim Now
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

      {/* Notificaciones */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            className={`
              mt-4 p-4 rounded-xl text-white text-center
              ${notification.type === 'error' ? 'bg-red-500/20' : 
                notification.type === 'success' ? 'bg-green-500/20' : 
                'bg-blue-500/20'}
            `}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ButtonClaimAirdrop;