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
      const provider = new ethers.JsonRpcProvider(httpsUrl);

      // Verify the connection works
      await provider.getNetwork();

      // Add basic event emitter functionality
      if (!provider._events) {
        provider._events = {};
        
        provider.on = function(eventName, listener) {
          if (!this._events[eventName]) {
            this._events[eventName] = [];
          }
          this._events[eventName].push(listener);
          return this;
        };

        provider.removeListener = function(eventName, listener) {
          if (!this._events[eventName]) return this;
          const idx = this._events[eventName].indexOf(listener);
          if (idx > -1) this._events[eventName].splice(idx, 1);
          return this;
        };

        provider.removeAllListeners = function(eventName) {
          if (eventName) {
            delete this._events[eventName];
          } else {
            this._events = {};
          }
          return this;
        };
      }

      return provider;
    } catch (error) {
      console.error("Provider creation error:", error);
      setError(error.message);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let currentProvider = null;

    const init = async () => {
      if (!mounted) return;
      try {
        const newProvider = await createProvider();
        if (mounted && newProvider) {
          setProvider(newProvider);
          currentProvider = newProvider;
          retryCount.current = 0;
        }
      } catch (err) {
        console.error("Provider initialization error:", err);
        if (retryCount.current < MAX_RETRIES && mounted) {
          retryCount.current++;
          setTimeout(init, 2000 * retryCount.current);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (currentProvider?.removeAllListeners) {
        currentProvider.removeAllListeners();
      }
    };
  }, []);

  return provider;
};

export default useProvider;