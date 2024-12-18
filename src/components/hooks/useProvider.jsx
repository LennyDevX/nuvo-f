import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY || "";

  const createProvider = async () => {
    if (!ALCHEMY_KEY) {
      setError("Alchemy API key is required");
      return null;
    }

    try {
      const httpsUrl = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      const httpProvider = new ethers.JsonRpcProvider(httpsUrl, {
        chainId: 137,
        name: 'polygon-mainnet',
        // Mejorar el manejo de rate limiting
        pollingInterval: 15000, // Aumentar a 15 segundos
        throttleLimit: 1,
        batchMaxSize: 1,
        // Agregar retry strategy
        staticNetwork: true,
        retryDelay: 1000,
        maxRetries: 5,
        cacheTimeout: 30000 // Cache de 30 segundos
      });

      // Agregar retries personalizados
      const originalSend = httpProvider.send;
      httpProvider.send = async (...args) => {
        let retries = 0;
        const maxRetries = 5;
        const baseDelay = 1000;

        while (retries < maxRetries) {
          try {
            return await originalSend.apply(httpProvider, args);
          } catch (error) {
            if (error?.code === 429) { // Rate limit error
              retries++;
              if (retries === maxRetries) throw error;
              
              // Exponential backoff
              const delay = baseDelay * Math.pow(2, retries);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw error;
          }
        }
      };

      // Test the connection
      await httpProvider.getNetwork();
      console.log("Provider connected successfully");
      
      // Setup event listeners for the provider
      httpProvider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          console.log("Network changed, reloading...");
          window.location.reload();
        }
      });

      return httpProvider;
    } catch (error) {
      console.error("Provider creation failed:", error);
      return null;
    }
  };

  const initializeProvider = async () => {
    try {
      const newProvider = await createProvider();
      if (newProvider) {
        setProvider(newProvider);
        retryCount.current = 0;
        setError(null);
      } else if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        setTimeout(initializeProvider, 2000 * retryCount.current);
      } else {
        setError("Failed to connect to network after multiple attempts");
      }
    } catch (err) {
      console.error("Provider initialization error:", err);
      setError("Failed to initialize provider");
    }
  };

  useEffect(() => {
    let mounted = true;
    let currentProvider = null;

    const init = async () => {
      if (!mounted) return;
      await initializeProvider();
    };

    init();

    return () => {
      mounted = false;
      if (currentProvider) {
        currentProvider.removeAllListeners();
      }
    };
  }, []);

  // Add reconnection logic
  useEffect(() => {
    if (!provider) return;

    const handleError = (error) => {
      console.error("Provider error:", error);
      initializeProvider();
    };

    provider.on("error", handleError);

    return () => {
      provider.removeListener("error", handleError);
    };
  }, [provider]);

  return provider;
};

export default useProvider;