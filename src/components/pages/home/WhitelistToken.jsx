import React, { useState, useContext } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaWallet, FaLock } from 'react-icons/fa';
import { WalletContext } from '../../../context/WalletContext';
import submitWhitelistEntry from '../../firebase/submitWhitelistEntry';

const WhitelistToken = () => {
  const { account, walletConnected } = useContext(WalletContext);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    telegram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletConnected || !account) {
      setError('Please connect your wallet to join the whitelist');
      return;
    }
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitWhitelistEntry({
        email: formData.email,
        walletAddress: account,
        name: formData.name || null,
        telegram: formData.telegram || null
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full flex items-center justify-center py-12 min-h-[70vh] bg-transparent">
      <div
        className="
          w-full
          max-w-md
          sm:max-w-lg
          md:max-w-xl
          bg-white/5
          backdrop-blur-xl
          rounded-2xl
          shadow-xl
          px-4 py-8 sm:px-8
          mx-auto
          flex flex-col
          justify-center
          border border-white/10
        "
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
        }}
      >
        {!isSubmitted ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 text-center tracking-tight">Join NUVO Whitelist</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-8 text-center font-light">
              Secure your spot for the NUVO token pre-sale and get exclusive launch benefits.
            </p>
            {!walletConnected && (
              <div className="bg-white/10 border border-purple-400/20 rounded-lg p-3 mb-4 text-center flex flex-col items-center">
                <FaWallet className="text-xl text-purple-400 mb-1" />
                <p className="text-white text-sm font-medium mb-1">Wallet Connection Required</p>
                <p className="text-gray-400 text-xs">
                  Please connect your wallet to join the whitelist.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-200 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-transparent border-0 border-b border-purple-400/40 focus:border-purple-500 focus:ring-0 text-white placeholder-gray-400 text-base px-0 py-2 transition-all"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-200 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-transparent border-0 border-b border-purple-400/40 focus:border-purple-500 focus:ring-0 text-white placeholder-gray-400 text-base px-0 py-2 transition-all"
                  placeholder="Your name (optional)"
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center text-xs font-medium text-gray-200 mb-1">
                  Wallet Address *
                  <FaLock className="ml-1 text-gray-400 text-xs" title="Auto-filled from your connected wallet" />
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={account || 'No wallet connected'}
                  disabled
                  className="bg-transparent border-0 border-b border-purple-400/40 text-gray-400 text-base px-0 py-2 cursor-not-allowed"
                />
                <span className="text-xs text-gray-500 mt-1">
                  {account
                    ? 'This address will receive your future rewards'
                    : 'Connect your wallet to continue'
                  }
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-200 mb-1">Telegram Username</label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  className="bg-transparent border-0 border-b border-purple-400/40 focus:border-purple-500 focus:ring-0 text-white placeholder-gray-400 text-base px-0 py-2 transition-all"
                  placeholder="@username (optional)"
                  autoComplete="off"
                />
              </div>
              {error && (
                <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                  <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !walletConnected}
                className="
                  w-full py-3 mt-2
                  rounded-xl
                  bg-gradient-to-r from-purple-600 to-pink-600
                  text-white font-semibold text-base tracking-wide
                  shadow-md hover:shadow-lg
                  hover:from-purple-700 hover:to-pink-700
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
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
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're on the List!</h3>
            <p className="text-gray-300 text-sm mb-2">
              Thank you for joining the NUVO whitelist. We'll keep you updated on our progress
              towards the Q4 2025 pre-sale and Q1 2026 launch.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhitelistToken;