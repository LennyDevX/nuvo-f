// src/hooks/useTreasuryBalance.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useTreasuryBalance = () => {
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchTreasuryBalance = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://polygon-mainnet.g.alchemy.com/v2/" + import.meta.env.VITE_ALCHEMY
      );
      
      const balance = await provider.getBalance(import.meta.env.VITE_TREASURY);
      setTreasuryBalance(ethers.utils.formatEther(balance));
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error("Error fetching treasury balance:", error);
    }
  };

  useEffect(() => {
    fetchTreasuryBalance();
    const interval = setInterval(fetchTreasuryBalance, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return { treasuryBalance, lastUpdate };
};

export default useTreasuryBalance;