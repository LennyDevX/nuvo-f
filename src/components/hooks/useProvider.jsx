// src/hooks/useProvider.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useProvider = () => {
  const [provider, setProvider] = useState(null);
  const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY || "";
  const RPC_URLS = [
    ALCHEMY_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}` : "",
    "https://rpc.ankr.com/polygon",
    "https://polygon-rpc.com",
  ];

  useEffect(() => {
    const getProvider = async () => {
      if (provider) return provider;

      // Intenta conectar con Alchemy primero si existe la clave API
      if (ALCHEMY_KEY) {
        try {
          const alchemyProvider = new ethers.providers.JsonRpcProvider(RPC_URLS[0]);
          await alchemyProvider.getBlockNumber();
          setProvider(alchemyProvider);
          return;
        } catch (error) {
          console.warn("Failed to connect to Alchemy:", error);
        }
      }

      // Intenta conectarte a los RPC de respaldo
      for (let i = 1; i < RPC_URLS.length; i++) {
        try {
          const fallbackProvider = new ethers.providers.JsonRpcProvider(RPC_URLS[i]);
          await fallbackProvider.getBlockNumber();
          setProvider(fallbackProvider);
          return;
        } catch (error) {
          console.warn(`Error connecting to ${RPC_URLS[i]}:`, error);
        }
      }

      throw new Error("All RPC connections failed");
    };

    getProvider();
  }, [provider, ALCHEMY_KEY, RPC_URLS]);

  return provider;
};

export default useProvider;