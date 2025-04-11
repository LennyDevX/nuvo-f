import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import submitWhitelistEntry from '../firebase/submitWhitelistEntry';

const WhitelistModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    walletAddress: '',
    name: '',
    telegram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Simple wallet address validation
  const isValidWalletAddress = (address) => {
    // Basic check for Ethereum address format (0x followed by 40 hex characters)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Simple email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Form validation
      if (!formData.email || !formData.walletAddress) {
        throw new Error('Email and wallet address are required');
      }

      if (!isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!isValidWalletAddress(formData.walletAddress)) {
        throw new Error('Please enter a valid Ethereum wallet address');
      }

      // Submit to Firebase
      await submitWhitelistEntry({
        email: formData.email,
        walletAddress: formData.walletAddress,
        name: formData.name || null,
        telegram: formData.telegram || null
      });
      
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again later.');
      console.error('Whitelist submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="whitelist-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-xl w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Join NUVO Whitelist</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="h-px w-full bg-purple-500/20 mb-5" />

          {!isSubmitted ? (
            <>
              <p className="text-gray-300 text-sm mb-5">
                Join our whitelist to secure your position for the NUVO token pre-sale in Q4 2025 and 
                get exclusive benefits when we officially launch in Q1 2026.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Wallet Address *</label>
                    <input 
                      type="text" 
                      name="walletAddress"
                      value={formData.walletAddress}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0x..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Must be a valid Ethereum address starting with 0x</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Your name (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Telegram Username</label>
                    <input 
                      type="text" 
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="@username (optional)"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                      <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg
                             text-white font-medium hover:from-purple-700 hover:to-pink-700
                             transition-all transform hover:-translate-y-0.5
                             disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? 'Submitting...' : 'Join Whitelist'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="flex justify-center mb-4">
                <FaCheckCircle className="text-green-500 text-5xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You're on the List!</h3>
              <p className="text-gray-300 text-sm mb-5">
                Thank you for joining the NUVO whitelist. We'll keep you updated on our progress 
                towards the Q4 2025 pre-sale and Q1 2026 launch.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg
                         text-white text-sm transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WhitelistModal;
