import React, { useState, useContext, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaWallet, FaLock, FaInfoCircle } from 'react-icons/fa';
import submitWhitelistEntry, { getPendingSubmission } from '../firebase/submitWhitelistEntry';
import { WalletContext } from '../../context/WalletContext';

const WhitelistModal = ({ onClose }) => {
  const { account, walletConnected } = useContext(WalletContext);
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    email: '',
    walletAddress: account || '',
    name: '',
    telegram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [savedLocally, setSavedLocally] = useState(false);

  // Check for pending submissions on load
  useEffect(() => {
    const pendingSubmission = getPendingSubmission();
    if (pendingSubmission) {
      setSavedLocally(true);
    }
  }, []);

  // Update wallet address when account changes
  useEffect(() => {
    if (account) {
      setFormData(prev => ({ ...prev, walletAddress: account }));
    }
  }, [account]);

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

    // Verify wallet is connected
    if (!walletConnected || !account) {
      setError('Please connect your wallet to join the whitelist');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSavedLocally(false);

    try {
      // Form validation
      if (!formData.email) {
        throw new Error('Email is required');
      }

      if (!isValidEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Submit to Firebase with the connected wallet address
      const result = await submitWhitelistEntry({
        email: formData.email,
        walletAddress: account, // Always use the connected wallet
        name: formData.name || null,
        telegram: formData.telegram || null
      });

      // Check if saved locally due to Firebase error
      if (result.savedLocally) {
        setSavedLocally(true);
      }

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
      <m.div
        key="home-whitelist-modal"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <m.div
          initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-xl w-full max-w-lg md:max-w-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
          style={{ maxHeight: '90vh' }}
        >
          {/* Left side: Info/Branding (only visible on desktop) */}
          <div className="hidden md:block md:w-5/12 bg-gradient-to-br from-purple-900/60 to-black/70 p-8 border-r border-purple-500/20">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center justify-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-purple-400 text-3xl" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 text-center">NUVOS Whitelist</h2>
                <p className="text-purple-200 text-center">
                  Secure your spot for the NUVOS token pre-sale and get exclusive launch benefits.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-300 font-medium mb-2">Timeline</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <p className="text-sm text-white">Pre-sale: Q1 2026</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <p className="text-sm text-white">Launch: Q1 2027</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-purple-300">
                  <FaWallet /> Connect your wallet to join
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Form/Content */}
          <div className="flex-1 flex flex-col h-full max-h-[90vh] md:max-h-none md:overflow-visible">
            <div className="flex justify-between items-center px-4 pt-4 pb-2 md:px-6 md:pt-6">
              <h2 className="text-xl font-bold text-white md:text-2xl">Join NUVO Whitelist</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="h-px w-full bg-purple-500/20 mb-3"></div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
              {!isSubmitted ? (
                <>
                  <p className="text-gray-300 text-sm mb-4">
                    Join our whitelist to secure your position for the NUVO token pre-sale in Q1 2026 and
                    get exclusive benefits when we officially launch in Q1 2027.
                  </p>

                  {!walletConnected ? (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4 text-center">
                      <FaWallet className="mx-auto text-xl text-purple-400 mb-1" />
                      <p className="text-white text-sm font-medium mb-1">Wallet Connection Required</p>
                      <p className="text-gray-300 text-xs">
                        Please connect your wallet to join the whitelist.
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-200 mb-1">
                        Wallet Address *
                        <FaLock className="ml-1 text-gray-400 text-xs" title="Auto-filled from your connected wallet" />
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="walletAddress"
                          value={account || 'No wallet connected'}
                          disabled
                          className="w-full bg-black/60 border border-purple-500/20 rounded-lg p-2.5 text-gray-300 text-sm cursor-not-allowed"
                        />
                        {account && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">
                            Connected
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {account
                          ? 'This address will receive your future rewards'
                          : 'Connect your wallet to continue'
                        }
                      </p>
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
                      disabled={isSubmitting || !walletConnected}
                      className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg
                             text-white font-medium hover:from-purple-700 hover:to-pink-700
                             transition-all transform hover:-translate-y-0.5
                             disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting
                        ? 'Submitting...'
                        : !walletConnected
                          ? 'Connect Wallet First'
                          : 'Join Whitelist'
                      }
                    </button>
                  </form>
                </>
              ) : (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="flex justify-center mb-4">
                    <FaCheckCircle className="text-green-500 text-5xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">You're on the List!</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Thank you for joining the NUVO whitelist. We'll keep you updated on our progress
                    towards the Q4 2025 pre-sale and Q1 2026 launch.
                  </p>
                  <div className="bg-black/40 border border-green-500/20 rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs text-gray-300">
                      <span className="block font-medium text-green-400 mb-1">Registered Wallet:</span>
                      <span className="text-white break-all">{account}</span>
                    </p>
                  </div>

                  {savedLocally && (
                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mb-4 flex items-start gap-2">
                      <FaInfoCircle className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-200 text-sm font-medium">Your submission is saved locally</p>
                        <p className="text-gray-300 text-xs mt-1">
                          Due to a temporary connection issue, your submission has been saved on this device.
                          Our team will process it shortly. There's no need to submit again.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg
                           text-white text-sm transition-colors"
                  >
                    Close
                  </button>
                </m.div>
              )}
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
};

export default WhitelistModal;
