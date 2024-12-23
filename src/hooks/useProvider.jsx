import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const providerRef = useRef(null);
  const networkInitialized = useRef(false);
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY || "";

  useEffect(() => {
    if (!ALCHEMY_KEY || providerRef.current) return;

    const initProvider = async () => {
      try {
        // Create provider with correct network config
        const provider = new ethers.JsonRpcProvider(
          `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
          {
            name: 'polygon',
            chainId: 137
          }
        );

        // Wait for provider to be ready
        await provider.getNetwork();
        
        // Ensure needed methods are bound correctly
        const methods = ['call', 'getBalance', 'getBlock', 'getNetwork', 'getLogs'];
        methods.forEach(method => {
          if (provider[method]) {
            provider[method] = provider[method].bind(provider);
          }
        });

        // Store in refs and state
        providerRef.current = provider;
        networkInitialized.current = true;
        setProvider(provider);
      } catch (error) {
        console.error("Provider initialization error:", error);
        setError(error.message);
      }
    };

    initProvider();

    return () => {
      if (providerRef.current?.removeAllListeners) {
        providerRef.current.removeAllListeners();
      }
    };
  }, [ALCHEMY_KEY]);

  return { 
    provider: providerRef.current, 
    error, 
    isInitialized: networkInitialized.current 
  };
};

export default useProvider;