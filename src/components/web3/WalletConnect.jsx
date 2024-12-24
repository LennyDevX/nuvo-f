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
    setAccounts([account]);
    setConnected(true);
    setIsLoading(false);
    setAccount(account); 
    setNetwork(networkName); 
    setWalletConnected(true);

    // Get balance using ethers v6
    const balance = await provider.getBalance(account);
    const formattedBalance = ethers.formatEther(balance);
    setBalance(formattedBalance);
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