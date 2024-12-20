import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { globalRateLimiter } from "../utils/RateLimiter";
import { globalCache } from "../utils/CacheManager";

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const retryCount = useRef(0);

  const createProvider = async () => {
    const cacheKey = 'provider_instance';
    
    return globalCache.get(cacheKey, async () => {
      if (!ALCHEMY_KEY) {
        throw new Error("Alchemy API key is required");
      }

      if (!globalRateLimiter.canMakeCall('provider_creation')) {
        throw new Error("Rate limit exceeded for provider creation");
      }

      const httpsUrl = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
      const provider = new ethers.JsonRpcProvider(httpsUrl);

      // Verify connection
      await provider.getNetwork();

      return provider;
    }, 300000); // 5 minutes cache
  };

  const reconnectWithBackoff = async (attempt = 0) => {
    const maxAttempts = 5;
    const baseDelay = 1000;
    const maxDelay = 30000;

    if (attempt >= maxAttempts) {
      setError("Maximum reconnection attempts reached");
      return;
    }

    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    await new Promise(r => setTimeout(r, delay));

    try {
      const newProvider = await createProvider();
      if (newProvider) {
        setProvider(newProvider);
        setError(null);
      }
    } catch (err) {
      console.error(`Reconnection attempt ${attempt + 1} failed:`, err);
      await reconnectWithBackoff(attempt + 1);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        const newProvider = await createProvider();
        if (mounted && newProvider) {
          setProvider(newProvider);
          retryCount.current = 0;
        }
      } catch (err) {
        console.error("Provider initialization error:", err);
        if (mounted) {
          setError(err.message);
          reconnectWithBackoff();
        }
      }
    };

    init();

    return () => {
      mounted = false;
      globalCache.clear('provider_instance');
    };
  }, []);

  return { provider, error };
};

export default useProvider;
