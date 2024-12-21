import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from './useProvider';

const useTreasuryBalance = (treasuryAddress) => {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const provider = useProvider();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    const fetchBalance = async () => {
      if (!provider || !treasuryAddress) {
        console.log("Waiting for provider and treasury address...");
        return;
      }

      if (!ethers.isAddress(treasuryAddress)) {
        console.error("Invalid treasury address");
        return;
      }

      try {
        const balance = await provider.getBalance(treasuryAddress);
        if (mounted.current) {
          setBalance(ethers.formatEther(balance));
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching treasury balance:", error);
        if (mounted.current) {
          setBalance('0');
          setLoading(false);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);

    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [provider, treasuryAddress]);

  return { balance, loading };
};

export default useTreasuryBalance;