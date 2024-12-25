import React, { useState, useContext, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../../context/WalletContext';
import WalletUtils from "../web3/WalletUtils";
import { isMobile, openWalletApp } from '../../utils/MobileUtils';
import MetaMaskLogo from '/metamask-logo.png';
import TrustWalletLogo from '/trustwallet-logo.png'; // Asegúrate de tener este asset

const WalletConnect = ({ className }) => {
  const { 
    setAccount, 
    setNetwork, 
    setBalance, 
    setWalletConnected,
    balance, // Añadir balance del contexto
    network  // Añadir network del contexto
  } = useContext(WalletContext); 
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  // Agregar efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWalletOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async (provider, account, networkName) => {
    try {
      setIsLoading(true);
      
      // Verificar si estamos en la red correcta
      const network = await provider.getNetwork();
      const targetChainId = 137; // Polygon Mainnet
      
      if (Number(network.chainId) !== targetChainId) {
        console.log('Red actual:', network.chainId, 'Red objetivo:', targetChainId);
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // 137 en hex
          });
          
          // Esperar un momento para que el cambio de red se complete
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
                    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY}`,
                    'https://polygon-rpc.com'
                  ],
                  blockExplorerUrls: ['https://polygonscan.com']
                }]
              });
              
              // Esperar un momento para que la adición de red se complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (addError) {
              console.error('Error adding network:', addError);
              throw new Error('Could not add Polygon network to wallet');
            }
          } else {
            throw new Error('Could not switch to Polygon network');
          }
        }
        
        // Verificar nuevamente la red después del cambio
        const updatedNetwork = await provider.getNetwork();
        if (Number(updatedNetwork.chainId) !== targetChainId) {
          throw new Error('Please make sure you are connected to Polygon network');
        }
      }

      // Add retry logic for balance fetch
      let retries = 3;
      while (retries > 0) {
        try {
          const balance = await provider.getBalance(account);
          const formattedBalance = ethers.formatEther(balance);
          setBalance(formattedBalance);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
  
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
  };

  const getNetworkName = async (provider) => {
    const network = await provider.getNetwork();
    const networkId = network.chainId;
    return WalletUtils.getNetworkName(networkId.toString());
  };

  const handleWalletSelection = (wallet) => {
    setSelectedWallet(wallet);
    if (isMobileDevice) {
      openWalletApp(wallet);
    }
    connectToWallet(wallet);
  };

  const connectToWallet = async (walletType = 'metamask') => {
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
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get network name
      const networkName = await getNetworkName(provider);
      
      await handleConnect(provider, accounts[0], networkName);

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (newAccounts) => {
        if (newAccounts.length > 0) {
          await handleConnect(provider, newAccounts[0], networkName);
        } else {
          setConnected(false);
          setAccounts([]);
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', async () => {
        const newNetworkName = await getNetworkName(provider);
        setNetwork(newNetworkName);
        
        // Refresh provider and account info
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
  };

  const handleDisconnect = () => {
    setAccount(null);
    setBalance(null);
    setNetwork(null);
    setWalletConnected(false);
    setConnected(false);
    setAccounts([]);
    setSelectedWallet(null);
    // Limpiar los listeners de eventos
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  };

  const renderWalletButtons = () => {
    if (connected) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowWalletOptions(prev => !prev)}
            className="px-4 py-2 rounded-lg shadow-md bg-white text-gray-800 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center">
              <img 
                src={selectedWallet === 'metamask' ? MetaMaskLogo : TrustWalletLogo} 
                alt="Wallet Logo" 
                className="w-5 h-5 mr-2" 
              />
              <strong>{WalletUtils.censorAccount(accounts[0])}</strong>
            </div>
          </button>

          {showWalletOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-black/90 backdrop-blur-sm border border-purple-500/20 overflow-hidden z-50">
              <div className="p-2 space-y-1">
                {/* Cambiar Wallet */}
                <button
                  onClick={() => handleWalletSelection('metamask')}
                  className="w-full px-4 py-2 flex items-center text-white hover:bg-purple-500/20 rounded transition-colors duration-200"
                >
                  <img src={MetaMaskLogo} alt="MetaMask" className="w-5 h-5 mr-2" />
                  MetaMask
                </button>
                <button
                  onClick={() => handleWalletSelection('trust')}
                  className="w-full px-4 py-2 flex items-center text-white hover:bg-purple-500/20 rounded transition-colors duration-200"
                >
                  <img src={TrustWalletLogo} alt="Trust Wallet" className="w-5 h-5 mr-2" />
                  Trust Wallet
                </button>
                
                <div className="border-t border-purple-500/20 my-1"></div>
                
                {/* Info de la Wallet - Modificado para usar balance del contexto */}
                <div className="px-4 py-2 text-sm text-gray-300">
                  <p>Balance: {balance ? parseFloat(balance).toFixed(4) : '0.0000'} MATIC</p>
                  <p>Network: {network || 'Not Connected'}</p>
                </div>
                
                <div className="border-t border-purple-500/20 my-1"></div>
                
                {/* Botón de Desconexión */}
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 rounded transition-colors duration-200"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button 
          className={`px-4 py-2 rounded-lg shadow-md flex items-center bg-white text-gray-800 hover:bg-gray-100 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setShowWalletOptions(prev => !prev)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <>
              <strong>CONNECT</strong>
              <div className="flex items-center ml-2">
                <img src={MetaMaskLogo} alt="MetaMask Logo" className="w-5 h-5" />
                <img src={TrustWalletLogo} alt="Trust Wallet Logo" className="w-5 h-5 ml-1" />
              </div>
            </>
          )}
        </button>

        {showWalletOptions && !connected && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-black/90 backdrop-blur-sm border border-purple-500/20 overflow-hidden z-50">
            <button
              className="w-full px-4 py-2 flex items-center text-white hover:bg-purple-500/20 transition-colors duration-200"
              onClick={() => handleWalletSelection('metamask')}
            >
              <img src={MetaMaskLogo} alt="MetaMask" className="w-5 h-5 mr-2" />
              MetaMask
            </button>
            <button
              className="w-full px-4 py-2 flex items-center text-white hover:bg-purple-500/20 transition-colors duration-200"
              onClick={() => handleWalletSelection('trust')}
            >
              <img src={TrustWalletLogo} alt="Trust Wallet" className="w-5 h-5 mr-2" />
              Trust Wallet
            </button>
          </div>
        )}

        {isMobileDevice && showWalletOptions && (
          <p className="absolute top-full mt-2 text-sm text-white/80 bg-black/90 p-2 rounded-lg backdrop-blur-sm w-48">
            Open in wallet browser for best experience
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {renderWalletButtons()}
      {error && (
        <p className="text-red-500 mt-2 text-sm bg-black/90 px-4 py-2 rounded-lg backdrop-blur-sm">
          {error}
        </p>
      )}
    </div>
  );
};

export default WalletConnect;