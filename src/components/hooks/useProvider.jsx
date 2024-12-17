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
      // Always use HTTPS provider for stability
      const httpsUrl = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      const httpProvider = new ethers.JsonRpcProvider(httpsUrl, {
        chainId: 137,
        name: 'polygon-mainnet',
        // Add rate limiting handling
        pollingInterval: 4000,
        throttleLimit: 1,
        batchMaxSize: 1
      });

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