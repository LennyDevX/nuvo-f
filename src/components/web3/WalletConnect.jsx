import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../../context/WalletContext';
import WalletUtils from "../web3/WalletUtils";
import { detectWallet } from '../../utils/blockchain/walletDetector';
import MetaMaskLogo from '/metamask-logo.png';
import TrustWalletLogo from '/trustwallet-logo.png';
import { useNavigate } from 'react-router-dom';
import { getAlchemyRpcUrl } from '../../utils/blockchain/alchemy';

const WalletConnect = ({ className }) => {
  const { 
    setAccount, 
    setNetwork, 
    setBalance, 
    setWalletConnected,
    account,
    balance, 
    network,
    handleDisconnect
  } = useContext(WalletContext); 
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(() => 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [walletInfo, setWalletInfo] = useState(() => detectWallet());
  const navigate = useNavigate();

  const rpcUrls = useMemo(() => [
    getAlchemyRpcUrl({ network: 'polygon-mainnet' }),
    'https://polygon-rpc.com',
    'https://rpc-mainnet.matic.network',
    'https://rpc-mainnet.maticvigil.com'
  ], []);

  const getBalanceWithRetry = useCallback(async (provider, account) => {
    for (const rpcUrl of rpcUrls) {
      try {
        const customProvider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await customProvider.getBalance(account);
        return ethers.formatEther(balance);
      } catch (error) {
        console.warn(`Failed to fetch balance using RPC: ${rpcUrl}`, error);
        continue;
      }
    }

    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to fetch balance with all providers', error);
      return '0';
    }
  }, [rpcUrls]);

  const getNetworkName = useCallback(async (provider) => {
    const network = await provider.getNetwork();
    const networkId = network.chainId;
    return WalletUtils.getNetworkName(networkId.toString());
  }, []);

  const handleConnect = useCallback(async (provider, account, networkName) => {
    try {
      setIsLoading(true);
      
      const network = await provider.getNetwork();
      const targetChainId = 137; 
      
      if (Number(network.chainId) !== targetChainId) {
        console.log('Red actual:', network.chainId, 'Red objetivo:', targetChainId);
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], 
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (switchError) {
          console.log('Switch Error:', switchError);
          
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x89',
                  chainName: 'Polygon Mainnet',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                  },
                  rpcUrls: [
                    getAlchemyRpcUrl({ network: 'polygon-mainnet' }),
                    'https://polygon-rpc.com'
                  ],
                  blockExplorerUrls: ['https://polygonscan.com']
                }]
              });
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (addError) {
              console.error('Error adding network:', addError);
              throw new Error('Could not add Polygon network to wallet');
            }
          } else {
            throw new Error('Could not switch to Polygon network');
          }
        }
        
        const updatedNetwork = await provider.getNetwork();
        if (Number(updatedNetwork.chainId) !== targetChainId) {
          throw new Error('Please make sure you are connected to Polygon network');
        }
      }

      const formattedBalance = await getBalanceWithRetry(provider, account);
      setBalance(formattedBalance);
  
      setAccounts([account]);
      setConnected(true);
      setAccount(account);
      setNetwork(networkName);
      setWalletConnected(true);
      setIsLoading(false);
  
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect. Please make sure you are on Polygon network.');
      setIsLoading(false);
    }
  }, [getBalanceWithRetry, setAccount, setBalance, setError, setIsLoading, setNetwork, setWalletConnected]);

  const handleWalletSelection = useCallback(async (walletType) => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (!walletInfo.available) {
        const links = getWalletDownloadLink(walletType);
        if (walletInfo.isMobile) {
          openWalletDeepLink(walletType, window.location.href);
        } else {
          window.open(links.extension, '_blank');
        }
        throw new Error(`Please install ${walletType} to continue`);
      }

      if (walletInfo.hasMultipleWallets && window.ethereum.providers) {
        const provider = window.ethereum.providers.find(p => {
          return walletType === 'metamask' ? p.isMetaMask : p.isTrust;
        });
        if (provider) {
          window.ethereum = provider;
        }
      }

      await connectToWallet(walletType);
      
    } catch (error) {
      console.error('Wallet selection error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo, setError, setIsLoading]);

  const connectToWallet = useCallback(async (walletType = 'metamask') => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        if (isMobileDevice) {
          throw new Error(`Please open this website in ${walletType === 'metamask' ? 'MetaMask' : 'Trust Wallet'} browser`);
        } else {
          throw new Error('Please install MetaMask or use a Web3 enabled browser');
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const networkName = await getNetworkName(provider);
      
      await handleConnect(provider, accounts[0], networkName);

      window.ethereum.on('accountsChanged', async (newAccounts) => {
        if (newAccounts.length > 0) {
          await handleConnect(provider, newAccounts[0], networkName);
        } else {
          setConnected(false);
          setAccounts([]);
        }
      });

      window.ethereum.on('chainChanged', async () => {
        const newNetworkName = await getNetworkName(provider);
        setNetwork(newNetworkName);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await handleConnect(provider, accounts[0], newNetworkName);
        }
      });

    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [handleConnect, getNetworkName, isMobileDevice, setAccounts, setConnected, setError, setIsLoading, setNetwork]);

  const onDisconnect = useCallback(() => {
    handleDisconnect();
    setConnected(false);
    setAccounts([]);
    setSelectedWallet(null);
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }, [handleDisconnect, setAccounts, setConnected, setSelectedWallet]);

  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install a Web3 wallet (MetaMask or Trust Wallet)');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      if (!accounts?.length) {
        throw new Error('No accounts found');
      }

      const network = await provider.getNetwork();
      const networkName = WalletUtils.getNetworkName(network.chainId.toString());
      
      await handleConnect(provider, accounts[0], networkName);
      
      setWalletInfo(detectWallet());

    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [handleConnect, setError, setIsLoading, setWalletInfo]);

  useEffect(() => {
    if (account) {
      setConnected(true);
      setAccounts([account]);
    } else {
      setConnected(false);
      setAccounts([]);
    }
  }, [account]);

  const renderWalletButton = useCallback(() => {
    if (connected) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowWalletOptions(!showWalletOptions)}
            className="flex items-center gap-2 px-4 py-2 btn-nuvo-base btn-nuvo-outline"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <img 
              src={walletInfo.type === 'metamask' ? MetaMaskLogo : TrustWalletLogo} 
              alt="Wallet Logo" 
              className="w-4 h-4" 
            />
            <span className="text-sm font-medium text-white">
              {WalletUtils.censorAccount(accounts[0])}
            </span>
          </button>

          {showWalletOptions && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-black/90 backdrop-blur-sm border border-purple-500/20 overflow-hidden z-50">
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-900/20">
                  <img 
                    src={walletInfo.type === 'metamask' ? MetaMaskLogo : TrustWalletLogo} 
                    alt="Connected Wallet" 
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-purple-300">
                      {walletInfo.type === 'metamask' ? 'MetaMask' : 'Trust Wallet'}
                    </div>
                    <div className="text-xs text-purple-400/70">Connected</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                
                <div className="space-y-2 p-2 rounded-lg bg-purple-900/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/70">Balance:</span>
                    <span className="text-purple-300">{balance ? parseFloat(balance).toFixed(4) : '0.0000'} MATIC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300/70">Network:</span>
                    <span className="text-purple-300">{network || 'Not Connected'}</span>
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
        onClick={connectWallet}
        disabled={isLoading}
        className={`
          btn-nuvo-base btn-nuvo-outline
          flex items-center gap-2 px-4 py-2
          transition-all duration-300
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
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
  }, [
    connected, connectWallet, isLoading, accounts, walletInfo, 
    showWalletOptions, setShowWalletOptions, balance, network, onDisconnect, navigate
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWalletOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
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