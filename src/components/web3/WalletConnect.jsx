import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { WalletContext } from '../../context/WalletContext';
import WalletUtils from "../web3/WalletUtils";
import { detectWallet } from '../../utils/blockchain/walletDetector';
import MetaMaskLogo from '/metamask-logo.png';
import TrustWalletLogo from '/trustwallet-logo.png';
import { useNavigate } from 'react-router-dom';

const WalletConnect = ({ className }) => {
  const {
    account,
    balance,
    network,
    walletConnected,
    connectWallet,        // unified connect method from context
    handleDisconnect
  } = useContext(WalletContext);

  // Keep only UI related local state
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [walletInfo, setWalletInfo] = useState(() => detectWallet());
  const navigate = useNavigate();

  const onDisconnect = useCallback(() => {
    handleDisconnect();
    setShowWalletOptions(false);
    setError(null);
  }, [handleDisconnect]);

  const onConnectClick = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const ok = await connectWallet();
      if (!ok) setError('Failed to connect wallet');
      else setWalletInfo(detectWallet());
    } catch (e) {
      setError(e.message || 'Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [connectWallet]);

  const renderWalletButton = useCallback(() => {
    if (walletConnected && account) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowWalletOptions(v => !v)}
            className="flex items-center gap-2 px-4 py-2 btn-nuvo-base btn-nuvo-outline"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <img
              src={walletInfo.type === 'trust' ? TrustWalletLogo : MetaMaskLogo}
              alt="Wallet"
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-white">
              {account ? `${account.slice(0,6)}...${account.slice(-4)}` : '...'}
            </span>
          </button>

            {showWalletOptions && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-black/90 backdrop-blur-sm border border-purple-500/20 overflow-hidden z-50">
                <div className="p-3 space-y-3">
                  {/* Wallet summary */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-900/20">
                    <img
                      src={walletInfo.type === 'trust' ? TrustWalletLogo : MetaMaskLogo}
                      alt="Connected Wallet"
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-purple-300 capitalize">
                        {walletInfo.type || 'Wallet'}
                      </div>
                      <div className="text-xs text-purple-400/70">Connected</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>

                  <div className="space-y-2 p-2 rounded-lg bg-purple-900/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300/70">Balance:</span>
                      <span className="text-purple-300">
                        {balance ? parseFloat(balance).toFixed(4) : '0.0000'} MATIC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300/70">Network:</span>
                      <span className="text-purple-300">{network || '—'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowWalletOptions(false);
                      navigate('/profile');
                    }}
                    className="w-full p-2 text-left text-sm flex items-center gap-2 text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    View Profile
                  </button>

                  <div className="border-t border-purple-500/20"></div>

                  <button
                    onClick={onDisconnect}
                    className="w-full p-2 text-left text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
        </div>
      );
    }

    return (
      <button
        onClick={onConnectClick}
        disabled={isLoading}
        className={`btn-nuvo-base btn-nuvo-outline flex items-center gap-2 px-4 py-2 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isLoading ? (
          <span className="text-sm text-purple-300">Connecting...</span>
        ) : (
          <>
            <span className="text-sm font-medium text-white">Connect Wallet</span>
            <div className="flex items-center gap-1">
              <img src={MetaMaskLogo} alt="MetaMask" className="w-4 h-4" />
              <img src={TrustWalletLogo} alt="Trust Wallet" className="w-4 h-4" />
            </div>
          </>
        )}
      </button>
    );
  }, [walletConnected, account, walletInfo, showWalletOptions, balance, network, onDisconnect, onConnectClick, isLoading, navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowWalletOptions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`relative ${className || ''}`}>
      {renderWalletButton()}
      {error && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-red-500/90 text-white text-xs rounded-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;