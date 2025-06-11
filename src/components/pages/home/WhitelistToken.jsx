import React, { useState, useContext } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaWallet, FaLock, FaCopy } from 'react-icons/fa';
import { WalletContext } from '../../../context/WalletContext';
import submitWhitelistEntry from '../../firebase/submitWhitelistEntry';

const WhitelistToken = ({ showSkeletonIfLoading }) => {
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

  // Copiar wallet address
  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  // Recorta el address para mostrarlo compacto
  const shortAccount = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  // Skeleton loading (simple placeholder)
  if (showSkeletonIfLoading) {
    return (
      <section className="w-full flex items-center justify-center py-4 min-h-[70vh] bg-transparent">
        <div className="w-full max-w-sm nuvos-card h-96 animate-pulse bg-gray-800/40 rounded-2xl" />
      </section>
    );
  }

  return (
    <section className="w-full flex items-center justify-center py-4 min-h-[70vh] bg-transparent">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-0 md:gap-8 items-center justify-center">
        {/* Info Block - Only visible on desktop */}
        <div className="hidden md:flex flex-col justify-center flex-1 h-full">
          <div className="nuvos-card  shadow-lg mr-0 md:mr-2 px-8 py-10">
            <h2 className="text-xl font-bold text-white mb-4">Why Join the NUVO Whitelist?</h2>
            <ul className="list-disc list-inside text-purple-200 text-base space-y-3 mb-4">
              <li>✅ Early access to NUVO token pre-sale</li>
              <li>✅ Exclusive launch rewards for whitelisted users</li>
              <li>✅ Priority for future airdrops and NFT drops</li>
              <li>✅ Be part of the first community to shape NUVO</li>
              <li>✅ Get updates and news before anyone else</li>
            </ul>
            <p className="text-gray-200 text-sm">
              Secure your spot and be part of the next generation of DeFi and AI-powered platforms.
              <br /><br />
              <span className="text-purple-300 font-semibold">No spam.</span> Only relevant updates and opportunities.
            </p>
          </div>
        </div>
        {/* Form Block */}
        <div
          className="
            w-full
            max-w-sm
            nuvos-card
            px-3 py-6
            mx-auto
            flex flex-col
            justify-center
            border border-purple-700/20
          "
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
          }}
        >
          {!isSubmitted ? (
            <>
              <h2 className="text-xl font-bold text-white mb-1 text-center tracking-tight">Join NUVO Whitelist</h2>
              <p className="text-gray-300 text-xs mb-5 text-center font-light">
                Secure your spot for the NUVO token pre-sale and get exclusive launch benefits.
              </p>
              {!walletConnected && (
                <div className="bg-white/10 border border-purple-400/20 rounded-lg p-2 mb-3 text-center flex flex-col items-center">
                  <FaWallet className="text-lg text-purple-400 mb-1" />
                  <p className="text-white text-xs font-medium mb-1">Wallet Connection Required</p>
                  <p className="text-gray-400 text-xs">
                    Please connect your wallet to join the whitelist.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-200 mb-0.5">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="nuvos-input bg-black/30 border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-0 text-white placeholder-gray-400 text-base px-3 py-2 transition-all"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-200 mb-0.5">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="nuvos-input bg-black/30 border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-0 text-white placeholder-gray-400 text-base px-3 py-2 transition-all"
                    placeholder="Your name (optional)"
                    autoComplete="name"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center text-xs font-medium text-gray-200 mb-0.5">
                    Wallet Address *
                    <FaLock className="ml-1 text-gray-400 text-xs" title="Auto-filled from your connected wallet" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="walletAddress"
                      value={shortAccount || 'No wallet connected'}
                      disabled
                      className="nuvos-input bg-black/30 border border-purple-700/30 rounded-lg text-gray-400 text-base px-3 py-2 cursor-not-allowed flex-1"
                    />
                    {account && (
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-2 rounded-lg bg-purple-800 text-purple-200 text-xs active:bg-purple-900"
                        tabIndex={0}
                        aria-label="Copy wallet address"
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {account
                      ? 'This address will receive your future rewards'
                      : 'Connect your wallet to continue'
                    }
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-200 mb-0.5">Telegram Username</label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    className="nuvos-input bg-black/30 border border-purple-700/30 rounded-lg focus:border-purple-500 focus:ring-0 text-white placeholder-gray-400 text-base px-3 py-2 transition-all"
                    placeholder="@username (optional)"
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-2 flex items-start gap-2">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-200 text-xs">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !walletConnected}
                  className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg w-full"
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
              <h3 className="text-lg font-bold text-white mb-2">You're on the List!</h3>
              <p className="text-gray-300 text-sm mb-2">
                Thank you for joining the NUVO whitelist.<br />
                We'll keep you updated on our progress towards the Q4 2025 pre-sale and Q1 2026 launch.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhitelistToken;