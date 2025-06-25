import { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { globalCache } from '../../utils/cache/CacheManager';
import { getAlchemyRpcUrl, getAlchemyApiKey } from '../../utils/blockchain/alchemy';

// Public RPC fallbacks if primary provider fails
const PUBLIC_RPC_ENDPOINTS = {
  137: [ // Polygon Mainnet
    "https://polygon-rpc.com",
    "https://rpc-mainnet.matic.network",
    "https://matic-mainnet.chainstacklabs.com"
  ],
  80001: [ // Polygon Mumbai
    "https://rpc-mumbai.maticvigil.com",
    "https://matic-mumbai.chainstacklabs.com"
  ]
};

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);  const providerRef = useRef(null);
  const networkInitialized = useRef(false);  const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '137');
    // Safely get RPC URL with error handling - moved inside initProvider
  
  // Helper to safely initialize provider
  const initProvider = useCallback(async () => {
    // Set initializing flag to prevent concurrent initialization attempts
    networkInitialized.current = true;
    const cacheKey = `network-${CHAIN_ID}`;
    
    try {
      const cachedNetwork = await globalCache.get(cacheKey);
      if (cachedNetwork) {
        setChainId(cachedNetwork.chainId);
        console.log("Loaded network info from cache:", cachedNetwork.name);
      }      // Generate RPC URL dynamically to ensure env vars are loaded
      let alchemyUrl;
      try {
        alchemyUrl = getAlchemyRpcUrl({ network: CHAIN_ID === 137 ? 'polygon-mainnet' : 'polygon-mumbai' });
      } catch (error) {
        console.error('Failed to generate Alchemy RPC URL, using fallbacks:', error);
        throw new Error("Alchemy not available, using fallbacks");
      }

      console.log(`Connecting to ${CHAIN_ID === 137 ? 'Polygon Mainnet' : 'Mumbai Testnet'}...`);
      
      // Create provider with correct network config
      const provider = new ethers.JsonRpcProvider(
        alchemyUrl,
        {
          name: CHAIN_ID === 137 ? 'polygon' : 'mumbai',
          chainId: CHAIN_ID
        }
      );

      // Test the connection
      try {
        const network = await provider.getNetwork();
        setChainId(network.chainId);
        console.log("Network connection successful:", network.name);
        await globalCache.set(cacheKey, { chainId: network.chainId, name: network.name }, 30 * 60 * 1000); // 30 minutes
      } catch (networkError) {
        console.error("Primary RPC endpoint failed:", networkError);
        
        // Try fallback RPC endpoints
        const fallbacks = PUBLIC_RPC_ENDPOINTS[CHAIN_ID] || [];
        for (const fallbackUrl of fallbacks) {
          console.log(`Trying fallback RPC: ${fallbackUrl}`);
          try {
            const fallbackProvider = new ethers.JsonRpcProvider(
              fallbackUrl,
              { name: CHAIN_ID === 137 ? 'polygon' : 'mumbai', chainId: CHAIN_ID }
            );
            
            const network = await fallbackProvider.getNetwork();
            setChainId(network.chainId);
            console.log("Fallback connection successful!");
            await globalCache.set(cacheKey, { chainId: network.chainId, name: network.name }, 30 * 60 * 1000); // 30 minutes
            
            // Store the working fallback provider
            providerRef.current = fallbackProvider;
            networkInitialized.current = true;
            setProvider(fallbackProvider);
            return; // Exit if a fallback works
          } catch (fallbackErr) {
            console.warn(`Fallback RPC ${fallbackUrl} failed:`, fallbackErr);
          }
        }
        
        // If all fallbacks fail, throw the original error
        throw networkError;
      }
      
      // If primary connection worked, store it
      providerRef.current = provider;
      networkInitialized.current = true;
      setProvider(provider);
      
      console.log("Provider successfully initialized");
      setError(null);
    } catch (error) {      console.error("Provider initialization error:", error);
      setError(error.message);
      // Reset initialization flag on error
      networkInitialized.current = false;
    }
  }, [CHAIN_ID]); // Removed ALCHEMY_KEY and RPC_URL as they're now generated dynamically

  // Access browser wallet provider for sending transactions
  const getWalletProvider = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No wallet detected");
    }
    
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      return { browserProvider, signer };
    } catch (error) {
      console.error("Failed to get wallet provider:", error);
      throw error;
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No wallet detected. Please install MetaMask or another compatible wallet");
      return false;
    }
    
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Get current chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        // Initialize provider if needed
        if (!providerRef.current) {
          await initProvider();
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Wallet connection error:", error);
      setError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [initProvider]);

  // Initial provider setup
  useEffect(() => {
    if (providerRef.current || networkInitialized.current) {
      console.log("Provider already initialized, skipping");
      return;
    }

    initProvider();
    
    return () => {
      if (providerRef.current?.removeAllListeners) {
        providerRef.current.removeAllListeners();
      }
    };
  }, [initProvider]);

  // Setup account detection & wallet events
  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainId, 16));
        } catch (err) {
          console.error("Failed to get account info:", err);
        }
      }
    };
    
    getAccount();
    
    // Setup event listeners
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
        // Recommended by MetaMask: reload on chain changes 
        // to prevent stale data issues
        window.location.reload();
      };

      const handleDisconnect = () => {
        setAccount(null);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, []);

  // Debug provider status
  useEffect(() => {
    if (providerRef.current) {
      console.log("Provider ready:", !!providerRef.current);
    }
  }, [providerRef.current]);

  return { 
    provider: providerRef.current, 
    getWalletProvider,
    error,
    account,
    chainId,
    isInitialized: networkInitialized.current && providerRef.current !== null,
    isConnecting,
    connect
  };
};

export default useProvider;