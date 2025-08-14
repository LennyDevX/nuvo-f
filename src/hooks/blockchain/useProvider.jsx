import { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { globalCache } from '../../utils/cache/CacheManager';
import { getAlchemyRpcUrl, getAlchemyApiKey } from '../../utils/blockchain/alchemy';

// Public RPC fallbacks if primary provider fails
const PUBLIC_RPC_ENDPOINTS = {
  137: [ // Polygon Mainnet
    "https://polygon.drpc.org",
    "https://polygon-rpc.com"
  ],
  80001: [ // Polygon Mumbai
    "https://rpc-mumbai.maticvigil.com",
    "https://polygon-mumbai.g.alchemy.com/v2/demo",
    "https://rpc.ankr.com/polygon_mumbai"
  ]
};

// Provider configuration for FallbackProvider
const getProviderConfigs = (chainId) => {
  const configs = [];
  const networkName = chainId === 137 ? 'polygon-mainnet' : 'polygon-mumbai';
  const networkDisplayName = chainId === 137 ? 'Polygon Mainnet' : 'Mumbai Testnet';
  
  // Try to add Alchemy provider first (priority 1)
  try {
    const alchemyUrl = getAlchemyRpcUrl({ network: networkName });
    configs.push({
      provider: new ethers.JsonRpcProvider(alchemyUrl, { name: chainId === 137 ? 'polygon' : 'mumbai', chainId }),
      priority: 1,
      stallTimeout: 3000,
      weight: 2
    });
  } catch (error) {
    console.warn('Could not initialize Alchemy provider:', error.message);
  }
  
  // Add public RPC endpoints as fallbacks (priority 2)
  const fallbacks = PUBLIC_RPC_ENDPOINTS[chainId] || [];
  fallbacks.forEach((url, index) => {
    try {
      configs.push({
        provider: new ethers.JsonRpcProvider(url, { 
          name: chainId === 137 ? 'polygon' : 'mumbai', 
          chainId,
          timeout: 10000 // 10 second timeout
        }),
        priority: 2,
        stallTimeout: 8000, // Increased timeout
        weight: 1
      });
    } catch (error) {
      console.warn(`Failed to initialize RPC provider ${url}:`, error.message);
    }
  });
  
  return { configs, networkName, networkDisplayName };
};

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const providerRef = useRef(null);
  const networkInitialized = useRef(false);
  const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '137');
  
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
      }
      
      console.log(`Connecting to ${CHAIN_ID === 137 ? 'Polygon Mainnet' : 'Mumbai Testnet'}...`);
      
      // Get provider configurations
      const { configs, networkName, networkDisplayName } = getProviderConfigs(CHAIN_ID);
      
      if (configs.length === 0) {
        throw new Error("No RPC providers available");
      }
      
      // Create FallbackProvider with all available providers
       const fallbackProvider = new ethers.FallbackProvider(configs, CHAIN_ID, {
         quorum: 1, // Only need one provider to respond successfully
         stallTimeout: 8000, // Wait 8 seconds before trying the next provider
         eventQuorum: 1,
         eventStallTimeout: 8000
       });
      
      // Test the connection
      try {
        const network = await fallbackProvider.getNetwork();
        
        // Verify network matches expected chain ID
        if (network.chainId !== BigInt(CHAIN_ID)) {
          throw new Error(`Network chain ID mismatch: expected ${CHAIN_ID}, got ${network.chainId}`);
        }
        
        setChainId(Number(network.chainId));
        console.log("Network connection successful:", network.name);
        await globalCache.set(cacheKey, { chainId: Number(network.chainId), name: network.name }, 30 * 60 * 1000); // 30 minutes
        
        // Store the working provider
        providerRef.current = fallbackProvider;
        networkInitialized.current = true;
        setProvider(fallbackProvider);
        console.log("FallbackProvider successfully initialized with", configs.length, "providers");
        setError(null);
      } catch (networkError) {
        console.error("FallbackProvider initialization failed:", networkError);
        throw networkError;
      }
    } catch (error) {
      console.error("Provider initialization error:", error);
      setError(error.message);
      // Reset initialization flag on error
      networkInitialized.current = false;
      
      // Prevent infinite retry loops by adding a delay
      setTimeout(() => {
        if (!providerRef.current && !networkInitialized.current) {
          console.log("Retrying provider initialization after delay...");
          initProvider();
        }
      }, 10000); // Wait 10 seconds before retry
    }
  }, [CHAIN_ID]);

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
      // Clear explicit disconnect flag when connecting
      localStorage.removeItem('walletExplicitlyDisconnected');
      
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

  // Explicit disconnect function
  const disconnect = useCallback(() => {
    console.log('Explicitly disconnecting wallet');
    localStorage.setItem('walletExplicitlyDisconnected', 'true');
    setAccount(null);
    setChainId(null);
    setError(null);
  }, []);

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
          // Only auto-detect accounts if user hasn't explicitly disconnected
          const isDisconnected = localStorage.getItem('walletExplicitlyDisconnected') === 'true';
          if (isDisconnected) {
            console.log('Wallet was explicitly disconnected, skipping auto-detection');
            return;
          }
          
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
        // Check if user explicitly disconnected
        const isDisconnected = localStorage.getItem('walletExplicitlyDisconnected') === 'true';
        if (isDisconnected) {
          console.log('Ignoring account change - wallet explicitly disconnected');
          return;
        }
        
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
    connect,
    disconnect
  };
};

export default useProvider;