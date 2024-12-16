import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from './useProvider';

const CACHE_DURATION = 30000; // 30 segundos

const useTreasuryBalance = (treasuryAddress) => {
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const provider = useProvider();
  const fetchingRef = useRef(false);
  const cacheRef = useRef({
    balance: null,
    timestamp: 0
  });

  const fetchTreasuryBalance = async () => {
    // Evitar múltiples llamadas simultáneas
    if (fetchingRef.current) return;
    
    // Verificar caché
    const now = Date.now();
    if (cacheRef.current.balance && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      return;
    }

    if (!provider) {
      console.warn('Provider not initialized');
      return;
    }
    if (!treasuryAddress) {
      console.error('Treasury address not provided');
      setError('Treasury address not configured');
      return;
    }

    try {
      fetchingRef.current = true;
      
      // Normalizar y validar la dirección
      const normalizedAddress = treasuryAddress.toLowerCase();
      if (!ethers.isAddress(normalizedAddress)) {
        throw new Error(`Invalid treasury address: ${treasuryAddress}`);
      }

      // Solo mostrar el log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching treasury balance...');
      }

      const balance = await provider.getBalance(normalizedAddress);
      const formattedBalance = ethers.formatEther(balance);

      // Actualizar caché
      cacheRef.current = {
        balance: formattedBalance,
        timestamp: now
      };
      
      setBalance(formattedBalance);
      setLastUpdate(new Date().toISOString());
      setError(null);

      // Solo mostrar el log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Treasury balance updated:', formattedBalance);
      }
    } catch (err) {
      console.error('Error fetching treasury balance:', err);
      setError(err.message);
      setBalance('0');
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const init = async () => {
      if (provider && treasuryAddress && mounted) {
        await fetchTreasuryBalance();
        // Actualizar cada 30 segundos
        intervalId = setInterval(fetchTreasuryBalance, CACHE_DURATION);
      }
    };

    init();

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [provider, treasuryAddress]);

  return { 
    balance, 
    error,
    lastUpdate,
    refetch: fetchTreasuryBalance 
  };
};

export default useTreasuryBalance;