import { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import useProvider from './useProvider';

const BASE_POLLING_INTERVAL = 60000; // Base interval for polling

const useTreasuryBalance = (treasuryAddress) => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const { provider, isInitialized } = useProvider();
  const timeoutRef = useRef(null); // For adaptive polling setTimeout
  const isMounted = useRef(true);

  // Core data fetching operation, memoized with useCallback
  const doFetchBalance = useCallback(async () => {
    if (!provider) {
      throw new Error('Provider not available');
    }
    if (!isInitialized) {
      throw new Error('Provider not initialized');
    }
    if (!treasuryAddress || !ethers.isAddress(treasuryAddress)) {
      // This check is also done before starting polling, but good for safety.
      throw new Error('Invalid or missing treasury address');
    }

    await provider.getNetwork(); // Check network availability
    const fetchedBalance = await provider.getBalance(treasuryAddress);
    return fetchedBalance.toString();
  }, [provider, isInitialized, treasuryAddress]);

  useEffect(() => {
    isMounted.current = true;

    // Clear any pending timeout from previous effect runs (e.g., if dependencies change)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const executePolling = async () => {
      if (!isMounted.current) {
        return;
      }

      // Ensure conditions are still met before fetching.
      // This is important as executePolling schedules itself.
      if (!provider || !isInitialized || !treasuryAddress || !ethers.isAddress(treasuryAddress)) {
        if (treasuryAddress && !ethers.isAddress(treasuryAddress)) {
          if (isMounted.current) setError('Invalid treasury address.');
        }
        // If provider or initialization status changed, useEffect will re-run and handle it.
        // No need to reschedule here if basic conditions fail; effect re-run will manage.
        return;
      }

      try {
        const newBalance = await doFetchBalance();
        if (isMounted.current) {
          setBalance(newBalance);
          setError(null);
        }
        
        const nextInterval = document.hidden ? BASE_POLLING_INTERVAL * 3 : BASE_POLLING_INTERVAL;
        if (isMounted.current) {
          timeoutRef.current = setTimeout(executePolling, nextInterval);
        }
      } catch (err) {
        console.error('Error fetching treasury balance:', err);
        if (isMounted.current) {
          setError(err.message || 'Failed to fetch balance.');
          // Backoff on error
          timeoutRef.current = setTimeout(executePolling, BASE_POLLING_INTERVAL * 2);
        }
      }
    };

    // Start polling only if provider is initialized and address is valid
    if (isInitialized && treasuryAddress && ethers.isAddress(treasuryAddress)) {
      executePolling(); // Initial call
    } else if (treasuryAddress && !ethers.isAddress(treasuryAddress)) {
      // Handle invalid address specifically: set error, clear balance, and don't poll.
      if (isMounted.current) {
        setError('Invalid treasury address.');
        setBalance(null);
      }
    } else {
      // Provider not ready or no address yet. Clear previous state.
      if (isMounted.current) {
        setBalance(null);
        setError(null);
      }
    }

    const visibilityHandler = () => {
      // Check isMounted.current before accessing other refs or state
      if (!isMounted.current) return;

      if (!document.hidden && isInitialized && treasuryAddress && ethers.isAddress(treasuryAddress)) {
        // Tab became visible, and we are in a state where polling is active/possible
        clearTimeout(timeoutRef.current); // Clear existing scheduled poll
        executePolling(); // Poll immediately
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
    
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutRef.current);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [treasuryAddress, provider, isInitialized, doFetchBalance]); // doFetchBalance is a dependency

  return { balance, error };
};

export default useTreasuryBalance;