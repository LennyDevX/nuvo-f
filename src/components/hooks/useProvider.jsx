import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY || "";

  useEffect(() => {
    let mounted = true;

    const initProvider = async () => {
      if (!ALCHEMY_KEY) {
        console.error("Alchemy API key is required");
        return;
      }

      try {
        // Try WebSocket first
        const wsUrl = `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
        const wsProvider = new ethers.WebSocketProvider(wsUrl);
        
        try {
          await wsProvider.getNetwork();
          if (mounted) {
            console.log("Connected via WebSocket");
            setProvider(wsProvider);
            return;
          }
        } catch (wsError) {
          console.warn("WebSocket connection failed, falling back to HTTPS");
        }

        // Fallback to HTTPS
        const httpsUrl = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
        const httpProvider = new ethers.JsonRpcProvider(httpsUrl);
        
        await httpProvider.getNetwork();
        if (mounted) {
          console.log("Connected via HTTPS");
          setProvider(httpProvider);
        }
      } catch (error) {
        console.error("Failed to initialize provider:", error);
      }
    };

    initProvider();

    return () => {
      mounted = false;
    };
  }, [ALCHEMY_KEY]);

  return provider;
};

export default useProvider;