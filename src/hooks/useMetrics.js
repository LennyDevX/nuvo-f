import { useState, useEffect } from 'react';
import { providers } from 'ethers';
import { useQuery } from '@tanstack/react-query';

const CACHE_TIME = 1000 * 60 * 5; // 5 minutes
const RETRY_DELAY = 1000; // 1 second base delay
const MAX_RETRIES = 3;

const fetchWithRetry = async (fetchFn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0 && error?.code === 429) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fetchFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const useMetrics = () => {
  const provider = new providers.AlchemyProvider(
    'mainnet',
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  );

  const { data: poolMetrics, error: poolError } = useQuery(
    ['poolMetrics'],
    () => fetchWithRetry(() => getPoolMetrics(provider)),
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
      retry: MAX_RETRIES,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  const { data: treasuryMetrics, error: treasuryError } = useQuery(
    ['treasuryMetrics'],
    () => fetchWithRetry(() => getTreasuryMetrics(provider)),
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
      retry: MAX_RETRIES,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  const getPoolMetrics = async (provider) => {
    try {
      // ... existing getPoolMetrics logic ...
    } catch (error) {
      console.error('Error getting pool metrics:', error);
      throw error;
    }
  };

  const getTreasuryMetrics = async (provider) => {
    try {
      // ... existing getTreasuryMetrics logic ...
    } catch (error) {
      console.error('Error in getTreasuryMetrics:', error);
      throw error;
    }
  };

  return {
    poolMetrics,
    treasuryMetrics,
    isLoading: !poolMetrics || !treasuryMetrics,
    error: poolError || treasuryError,
  };
};
