// src/hooks/useAirdropData.js
import { useState, useEffect } from 'react';

export const useAirdropData = (walletAddress) => {
  const [airdropData, setAirdropData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setAirdropData(mockData);
        console.log('Airdrop data loaded:', mockData);
      } catch (err) {
        console.error('Error loading airdrop data:', err);
        setError(err.message || 'Failed to load airdrop data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  return { airdropData, loading, error };
};