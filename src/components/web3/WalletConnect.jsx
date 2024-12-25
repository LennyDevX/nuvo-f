import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../../context/WalletContext'; 
import WalletUtils from "../web3/WalletUtils"; 
import MetaMaskLogo from '/metamask-logo.png';

const WalletConnect = () => {
  const { setAccount, setNetwork, setBalance, setWalletConnected } = useContext(WalletContext); 
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (provider, account, networkName) => {
    try {
      setIsLoading(true);
  
      // Add error handling for network check
      const network = await provider.getNetwork();
      if (network.chainId !== 137) { // Polygon Mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // 137 in hex
          });
        } catch (switchError) {
          // Handle chain switch error
          if (switchError.code === 4902) {
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
                rpcUrls: ['https://polygon-rpc.com'],
                blockExplorerUrls: ['https://polygonscan.com']
              }]
            });
          }
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
      setError('Failed to connect. Please make sure you are on Polygon network.');
      setIsLoading(false);
    }
  };

  const getNetworkName = async (provider) => {
    const network = await provider.getNetwork();
    const networkId = network.chainId;
    return WalletUtils.getNetworkName(networkId.toString());
  };

  const connectToWallet = async () => {
    try {
      setIsLoading(true);
      if (window.ethereum) {
        // Create provider using ethers v6
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });
        
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

      } else {
        throw new Error('MetaMask is not installed or not enabled in this browser.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask: ', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {connected ? (
        <button className="px-4 py-2 rounded-lg shadow-md bg-white text-gray-800 cursor-not-allowed">
          <strong>{WalletUtils.censorAccount(accounts[0])}</strong>
        </button>
      ) : (
        <button 
          className={`px-4 py-2 rounded-lg shadow-md flex items-center bg-white text-gray-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
          onClick={connectToWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <>
              <strong>WALLET</strong>
              <img src={MetaMaskLogo} alt="MetaMask Logo" className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      )}
      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};

export default WalletConnect;