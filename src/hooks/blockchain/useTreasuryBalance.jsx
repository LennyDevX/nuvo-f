import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from './useProvider';

const POLLING_INTERVAL = 60000;
const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

const useTreasuryBalance = (treasuryAddress) => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const { provider, isInitialized } = useProvider();
  const lastFetchTime = useRef(0);
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  const fetchBalance = async (retryCount = 0) => {
    if (!provider || !isInitialized || !treasuryAddress || !ethers.isAddress(treasuryAddress)) {
      return;
    }

    const now = Date.now();
    if (now - lastFetchTime.current < POLLING_INTERVAL) {
      return;
    }

    try {
      // Verificar que la red esté disponible
      await provider.getNetwork();
      
      const balance = await provider.getBalance(treasuryAddress);
      if (isMounted.current) {
        setBalance(balance.toString());
        setError(null);
        lastFetchTime.current = now;
      }
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
      
      if (retryCount < MAX_RETRIES && isMounted.current) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        timeoutRef.current = setTimeout(() => {
          fetchBalance(retryCount + 1);
        }, delay);
      } else if (isMounted.current) {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;

    // Solo empezar a hacer polling cuando el provider esté inicializado
    if (isInitialized) {
      fetchBalance();
      const interval = setInterval(fetchBalance, POLLING_INTERVAL);
      
      return () => {
        isMounted.current = false;
        clearInterval(interval);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [treasuryAddress, provider, isInitialized]);

  return { balance, error };
};

export default useTreasuryBalance;