import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import useProvider from '../blockchain/useProvider'; // Updated import path
import ABI from '../../Abi/StakingContract.json';
import { globalCache } from '../../utils/cache/CacheManager';

export function useStakingContract() {
  const { provider, isInitialized } = useProvider();
  const [contract, setContract] = useState(null);
  const [contractState, setContractState] = useState({
    isContractPaused: false,
    isMigrated: false,
    treasuryAddress: null,
    totalPoolBalance: '0'
  });

  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || "";

  const getSignerAddress = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Error getting signer address:", error);
      return null;
    }
  }, []);

  const getSignedContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
    } catch (error) {
      console.error("Error getting signed contract:", error);
      throw error;
    }
  }, [CONTRACT_ADDRESS]);

  const getContractStatus = useCallback(async (contractInstance = contract) => {
    if (!contractInstance || !provider || !isInitialized) return null;

    try {
      return await globalCache.get(
        'contract_status',
        async () => {
          const [paused, migrated, treasury, balance] = await Promise.all([
            contractInstance.paused().catch(() => false),
            contractInstance.migrated().catch(() => false),
            contractInstance.treasury().catch(() => null),
            contractInstance.getContractBalance().catch(() => BigInt(0))
          ]);

          const data = {
            isContractPaused: !!paused,
            isMigrated: !!migrated,
            treasuryAddress: treasury,
            totalPoolBalance: balance?.toString() || '0'
          };

          setContractState(data);
          return data;
        },
        300000 // 5 minutes cache
      );
    } catch (error) {
      console.error("Error getting contract status:", error);
      return null;
    }
  }, [contract, provider, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !provider || !CONTRACT_ADDRESS) return;

    const initializeContract = async () => {
      try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at address');
        }

        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        contractInstance.provider = provider;

        setContract(contractInstance);

        try {
          await getContractStatus(contractInstance);
        } catch (statusError) {
          console.warn("Initial status fetch failed:", statusError);
        }
      } catch (err) {
        console.error("Contract initialization error:", err);
      }
    };

    initializeContract();
  }, [provider, isInitialized, CONTRACT_ADDRESS, getContractStatus]);

  return { 
    contract, 
    isInitialized, 
    getSignedContract, 
    getSignerAddress, 
    getContractStatus,
    ...contractState 
  };
}
