import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift, FaCheck, FaClock, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import { ethers } from 'ethers';
import AirdropABI from '../../../../Abi/Airdrop.json';

const ClaimTokensComponent = ({ userRegistration, onClose }) => {
  const { account, provider } = useContext(WalletContext);
  const [claimStatus, setClaimStatus] = useState('idle'); // idle, checking, canClaim, claiming, claimed, error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [airdropInfo, setAirdropInfo] = useState({
    isActive: false,
    isFunded: false,
    hasClaimed: false,
    claimAmount: '10',
    registrationDeadlinePassed: false
  });
  const [transactionHash, setTransactionHash] = useState(null);

  // Verificar si la fecha límite de registro ha pasado (1 de agosto 2025)
  const isClaimPeriod = () => {
    const now = new Date();
    const claimStartDate = new Date('2025-08-01T00:00:00');
    return now >= claimStartDate;
  };

  // Verificar el estado del airdrop y elegibilidad del usuario
  useEffect(() => {
    const checkAirdropStatus = async () => {
      if (!account || !provider) return;
      
      setIsLoading(true);
      setClaimStatus('checking');

      try {
        const contractAddress = import.meta.env.VITE_AIRDROP_ADDRESS;
        if (!contractAddress) {
          throw new Error('Airdrop contract not deployed yet');
        }

        const contract = new ethers.Contract(contractAddress, AirdropABI.abi, provider);
        
        // Verificar información del contrato
        const [airdropActive, userEligibility, contractBalance] = await Promise.all([
          contract.isActive().catch(() => false),
          contract.checkUserEligibility(account).catch(() => [false, false, false, '0']),
          contract.getBalance().catch(() => '0')
        ]);

        const [isEligible, hasClaimed, hasMinBalance, userBalance] = userEligibility;
        const isFunded = ethers.formatEther(contractBalance) > '0';

        setAirdropInfo({
          isActive: airdropActive,
          isFunded,
          hasClaimed,
          claimAmount: '10', // 10 POL tokens
          registrationDeadlinePassed: isClaimPeriod()
        });

        // Determinar estado de reclamación
        if (hasClaimed) {
          setClaimStatus('claimed');
        } else if (!isClaimPeriod()) {
          setClaimStatus('waiting');
        } else if (!airdropActive) {
          setClaimStatus('inactive');
        } else if (!isFunded) {
          setClaimStatus('unfunded');
        } else if (isEligible && hasMinBalance) {
          setClaimStatus('canClaim');
        } else {
          setClaimStatus('ineligible');
        }

      } catch (error) {
        console.error('Error checking airdrop status:', error);
        if (error.message?.includes('not deployed')) {
          setClaimStatus('not_deployed');
          setError('Airdrop contract not deployed yet. Please wait for the official launch.');
        } else {
          setClaimStatus('error');
          setError(error.message || 'Failed to check airdrop status');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAirdropStatus();
  }, [account, provider]);

  // Función para reclamar tokens
  const handleClaimTokens = async () => {
    if (!account || !provider || claimStatus !== 'canClaim') return;

    setIsLoading(true);
    setClaimStatus('claiming');
    setError(null);

    try {
      const contractAddress = import.meta.env.VITE_AIRDROP_ADDRESS;
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, AirdropABI.abi, signer);

      // Ejecutar la reclamación
      const tx = await contract.claimTokens();
      setTransactionHash(tx.hash);

      // Esperar confirmación
      await tx.wait();
      
      setClaimStatus('claimed');
      setAirdropInfo(prev => ({ ...prev, hasClaimed: true }));

    } catch (error) {
      console.error('Claim error:', error);
      setClaimStatus('canClaim');
      
      let errorMessage = 'Failed to claim tokens. Please try again.';
      if (error.reason?.includes('already claimed')) {
        errorMessage = 'You have already claimed your tokens.';
        setClaimStatus('claimed');
      } else if (error.reason?.includes('not eligible')) {
        errorMessage = 'You are not eligible for this airdrop.';
        setClaimStatus('ineligible');
      } else if (error.reason?.includes('insufficient balance')) {
        errorMessage = 'Contract has insufficient balance.';
        setClaimStatus('unfunded');
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el mensaje de estado
  const getStatusMessage = () => {
    switch (claimStatus) {
      case 'checking':
        return { message: 'Checking eligibility...', icon: <FaSpinner className="animate-spin" />, color: 'text-blue-400' };
      case 'waiting':
        return { message: 'Claim period starts August 1, 2025', icon: <FaClock />, color: 'text-yellow-400' };
      case 'canClaim':
        return { message: 'Ready to claim your tokens!', icon: <FaGift />, color: 'text-green-400' };
      case 'claiming':
        return { message: 'Processing claim transaction...', icon: <FaSpinner className="animate-spin" />, color: 'text-blue-400' };
      case 'claimed':
        return { message: 'Tokens successfully claimed!', icon: <FaCheck />, color: 'text-green-400' };
      case 'inactive':
        return { message: 'Airdrop is not active', icon: <FaExclamationTriangle />, color: 'text-red-400' };
      case 'unfunded':
        return { message: 'Airdrop contract needs funding', icon: <FaExclamationTriangle />, color: 'text-orange-400' };
      case 'ineligible':
        return { message: 'Not eligible for this airdrop', icon: <FaExclamationTriangle />, color: 'text-red-400' };
      case 'not_deployed':
        return { message: 'Airdrop contract not deployed yet', icon: <FaClock />, color: 'text-yellow-400' };
      case 'error':
        return { message: 'Error checking status', icon: <FaExclamationTriangle />, color: 'text-red-400' };
      default:
        return { message: 'Loading...', icon: <FaSpinner className="animate-spin" />, color: 'text-gray-400' };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-xl font-bold bg-nuvo-gradient-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Claim Your Tokens
        </motion.h2>
        <motion.button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      <motion.div 
        className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-6">
          {/* User Registration Info */}
          <motion.div 
            className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 mb-6 border border-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <FaCheck className="text-green-400" />
              Registration Confirmed
            </h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><span className="text-purple-300">Name:</span> {userRegistration?.name}</p>
              <p><span className="text-purple-300">Email:</span> {userRegistration?.email}</p>
              <p><span className="text-purple-300">Wallet:</span> {userRegistration?.wallet}</p>
              <p><span className="text-purple-300">Registered:</span> {new Date(userRegistration?.submittedAt).toLocaleDateString()}</p>
            </div>
          </motion.div>

          {/* Claim Status */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`flex items-center justify-center gap-3 mb-4 ${statusInfo.color}`}>
              <span className="text-2xl">{statusInfo.icon}</span>
              <span className="text-lg font-medium">{statusInfo.message}</span>
            </div>

            {/* Token Amount Display */}
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {airdropInfo.claimAmount} POL
                </div>
                <div className="text-sm text-purple-300">
                  Polygon Network Tokens
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction Hash */}
            {transactionHash && (
              <motion.div 
                className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-green-400 text-sm">
                  Transaction: 
                  <a 
                    href={`https://polygonscan.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline hover:text-green-300"
                  >
                    {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </a>
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Action Button */}
          <div className="flex justify-center">
            {claimStatus === 'canClaim' && (
              <motion.button
                onClick={handleClaimTokens}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center gap-2"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <FaGift />
                    Claim {airdropInfo.claimAmount} POL Tokens
                  </>
                )}
              </motion.button>
            )}

            {claimStatus === 'claimed' && (
              <motion.button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Close
              </motion.button>
            )}

            {(claimStatus === 'waiting' || claimStatus === 'not_deployed') && (
              <motion.button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Close
              </motion.button>
            )}
          </div>

          {/* Information Notes */}
          <motion.div 
            className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-blue-400 font-medium mb-2">📋 Important Information</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Tokens are distributed on the Polygon network</li>
              <li>• You can only claim once per wallet</li>
              <li>• Claim period starts August 1, 2025</li>
              <li>• Make sure you have POL for transaction fees</li>
              <li>• Tokens can be staked immediately for rewards</li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClaimTokensComponent;
