import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

// Public RPC fallbacks if Alchemy fails
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
  const providerRef = useRef(null);
  const networkInitialized = useRef(false);
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY || "";
  const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "137");
  
  // Get the RPC URL from environment variables
  const RPC_URL = import.meta.env.VITE_RPC_URL_POLYGON || 
    `https://polygon-${CHAIN_ID === 137 ? 'mainnet' : 'mumbai'}.g.alchemy.com/v2/`;

  useEffect(() => {
    // Add this to prevent duplicate initializations
    if (providerRef.current || networkInitialized.current) {
      console.log("Provider already initialized, skipping");
      return;
    }

    const initProvider = async () => {
      // Set initializing flag to prevent concurrent initialization attempts
      networkInitialized.current = true;
      
      try {
        // Check if the URL already contains the API key to prevent duplication
        let alchemyUrl = RPC_URL;
        
        if (RPC_URL.includes('alchemy.com/v2/') && !RPC_URL.includes(ALCHEMY_KEY)) {
          // Only append the key if the URL is for Alchemy but doesn't already contain the key
          alchemyUrl = `${RPC_URL}${ALCHEMY_KEY}`;
        } else if (RPC_URL.includes('alchemy.com') && !RPC_URL.includes('/v2/')) {
          // If it's Alchemy but missing the v2/ path
          alchemyUrl = `${RPC_URL}/v2/${ALCHEMY_KEY}`;
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
          await provider.getNetwork();
          console.log("Network connection successful!");
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
              
              await fallbackProvider.getNetwork();
              console.log("Fallback connection successful!");
              
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
      } catch (error) {
        console.error("Provider initialization error:", error);
        setError(error.message);
        // Reset initialization flag on error
        networkInitialized.current = false;
      }
    };

    initProvider();

    return () => {
      if (providerRef.current?.removeAllListeners) {
        providerRef.current.removeAllListeners();
      }
    };
  }, [ALCHEMY_KEY, RPC_URL, CHAIN_ID]);

  return { 
    provider: providerRef.current, 
    error, 
    isInitialized: networkInitialized.current && providerRef.current !== null 
  };
};

export default useProvider;