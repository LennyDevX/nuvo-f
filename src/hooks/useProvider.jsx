import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Make sure this is exported as a function declaration, not an arrow function
export function useProvider() {
  const [provider, setProvider] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Initialize ethers provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        // Try to use window.ethereum if available (MetaMask, etc.)
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Get current connected account if any
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setAccount(accounts[0]);
            }
            
            // Get current chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(chainId);
          } catch (error) {
            console.warn("Error getting accounts or chainId:", error);
          }
        } 
        // Fallback to public RPC if window.ethereum not available
        else {
          // Use a public RPC provider (e.g. Infura, Alchemy)
          const rpcUrl = import.meta.env.VITE_RPC_URL || "https://polygon-rpc.com";
          const fallbackProvider = new ethers.JsonRpcProvider(rpcUrl);
          setProvider(fallbackProvider);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing provider:", error);
        setIsInitialized(false);
      }
    };

    initProvider();
  }, []);

  // Setup event listeners for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId) => {
      window.location.reload();
    };

    const handleDisconnect = () => {
      setAccount(null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  return {
    provider,
    isInitialized,
    account,
    chainId
  };
}

export default useProvider;
