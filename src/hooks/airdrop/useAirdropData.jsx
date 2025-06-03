// src/hooks/useAirdropData.js
import { useState, useEffect, useCallback } from 'react';
import useCachedData from '../cache/useCachedData';

export const useAirdropData = (walletAddress) => {
  // Memoized fetch function for cache
  const fetchAirdropData = useCallback(async () => {
    console.log('Fetching airdrop data for wallet:', walletAddress);

    // Simular datos de airdrop en lugar de buscar en Firebase
    const mockData = walletAddress 
      ? [
          {
            id: 'mock-1',
            wallet: walletAddress,
            type: 'token',
            amount: '10',
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ]
      : [];

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
    console.log('Airdrop data loaded:', mockData);
    return mockData;
  }, [walletAddress]);

  // Usa useCachedData para cachear por walletAddress
  const { data: airdropData, loading, error, refetch } = useCachedData(
    walletAddress ? `airdrop-${walletAddress}` : 'airdrop-none',
    fetchAirdropData,
    { ttl: 5 * 60 * 1000, enabled: !!walletAddress, initialData: [] }
  );

  return { airdropData, loading, error, refetch };
};