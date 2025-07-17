import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import AirdropABI from '../../Abi/Airdrop.json';

export const useAirdropStatus = (provider, account) => {
  const [airdropStatus, setAirdropStatus] = useState({
    isContractDeployed: false,
    isActive: false,
    isFunded: false,
    hasClaimed: false,
    isEligible: false,
    hasMinBalance: false,
    userBalance: '0',
    claimAmount: '10',
    totalClaims: 0,
    maxParticipants: 0,
    contractBalance: '0',
    registrationPeriodEnded: false,
    claimPeriodStarted: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if registration period has ended and claim period has started
  const checkPeriods = useCallback(() => {
    const now = new Date();
    const registrationEndDate = new Date('2025-08-01T00:00:00');
    
    return {
      registrationPeriodEnded: now >= registrationEndDate,
      claimPeriodStarted: now >= registrationEndDate
    };
  }, []);

  // Get airdrop status from contract
  const getAirdropStatus = useCallback(async () => {
    if (!provider || !account) {
      setAirdropStatus(prev => ({
        ...prev,
        ...checkPeriods()
      }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contractAddress = import.meta.env.VITE_AIRDROP_ADDRESS;
      
      if (!contractAddress) {
        setAirdropStatus(prev => ({
          ...prev,
          isContractDeployed: false,
          ...checkPeriods()
        }));
        return;
      }

      const contract = new ethers.Contract(contractAddress, AirdropABI.abi, provider);

      // Check if contract is deployed by trying to call a simple function
      try {
        await contract.owner();
        setAirdropStatus(prev => ({ ...prev, isContractDeployed: true }));
      } catch (error) {
        setAirdropStatus(prev => ({
          ...prev,
          isContractDeployed: false,
          ...checkPeriods()
        }));
        return;
      }

      // Get contract information
      const [
        isActive,
        userEligibility,
        contractBalance,
        airdropStats
      ] = await Promise.all([
        contract.isActive().catch(() => false),
        contract.checkUserEligibility(account).catch(() => [false, false, false, '0']),
        contract.getBalance().catch(() => '0'),
        contract.getAirdropStats().catch(() => ({
          claimedCount: 0,
          maxParticipants: 0,
          tokenBalance: '0'
        }))
      ]);

      const [isEligible, hasClaimed, hasMinBalance, userBalance] = userEligibility;
      const isFunded = ethers.formatEther(contractBalance) > '0';

      setAirdropStatus({
        isContractDeployed: true,
        isActive,
        isFunded,
        hasClaimed,
        isEligible,
        hasMinBalance,
        userBalance: ethers.formatEther(userBalance),
        claimAmount: '10', // 10 POL tokens
        totalClaims: Number(airdropStats.claimedCount || 0),
        maxParticipants: Number(airdropStats.maxParticipants || 0),
        contractBalance: ethers.formatEther(contractBalance),
        ...checkPeriods()
      });

    } catch (error) {
      console.error('Error fetching airdrop status:', error);
      setError(error.message || 'Failed to fetch airdrop status');
      setAirdropStatus(prev => ({
        ...prev,
        isContractDeployed: false,
        ...checkPeriods()
      }));
    } finally {
      setLoading(false);
    }
  }, [provider, account, checkPeriods]);

  // Claim tokens function
  const claimTokens = useCallback(async () => {
    if (!provider || !account || !airdropStatus.isContractDeployed) {
      throw new Error('Contract not available');
    }

    const contractAddress = import.meta.env.VITE_AIRDROP_ADDRESS;
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, AirdropABI.abi, signer);

    const tx = await contract.claimTokens();
    return tx;
  }, [provider, account, airdropStatus.isContractDeployed]);

  // Auto-refresh status periodically
  useEffect(() => {
    getAirdropStatus();
    
    // Refresh every 30 seconds if contract is deployed
    const interval = setInterval(() => {
      if (airdropStatus.isContractDeployed) {
        getAirdropStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [getAirdropStatus]);

  return {
    airdropStatus,
    loading,
    error,
    refreshStatus: getAirdropStatus,
    claimTokens
  };
};
