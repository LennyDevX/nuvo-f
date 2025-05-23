import { useState, useCallback, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import useProvider from '../blockchain/useProvider';
import ABI from '../../Abi/StakingContract.json';
import { globalCache } from '../../utils/cache/CacheManager';

export function useStakingContract() {
  const { provider, isInitialized } = useProvider();
  const [contractState, setContractState] = useState({
    isContractPaused: false,
    isMigrated: false,
    treasuryAddress: null,
    totalPoolBalance: '0'
  });

  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || "";

  // Memoize contract instance
  const contract = useMemo(() => {
    if (!provider || !CONTRACT_ADDRESS) return null;
    try {
      return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
    } catch {
      return null;
    }
  }, [provider, CONTRACT_ADDRESS]);

  // Memoize cache key per contract address
  const contractStatusCacheKey = useMemo(
    () => `contract_status_${CONTRACT_ADDRESS}`,
    [CONTRACT_ADDRESS]
  );

  // Reuse a single BrowserProvider instance
  const browserProvider = useMemo(() => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, [window.ethereum]);

  const getSignerAddress = useCallback(async () => {
    if (!browserProvider) return null;
    try {
      const signer = await browserProvider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Error getting signer address:", error);
      return null;
    }
  }, [browserProvider]);

  const getSignedContract = useCallback(async () => {
    if (!browserProvider) throw new Error('No wallet found');
    try {
      const signer = await browserProvider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
    } catch (error) {
      console.error("Error getting signed contract:", error);
      throw error;
    }
  }, [browserProvider, CONTRACT_ADDRESS]);

  const getContractStatus = useCallback(async (contractInstance = contract) => {
    if (!contractInstance || !provider || !isInitialized) return null;
    try {
      return await globalCache.get(
        contractStatusCacheKey,
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
  }, [contract, provider, isInitialized, contractStatusCacheKey]);

  useEffect(() => {
    if (!isInitialized || !provider || !CONTRACT_ADDRESS) return;
    let cancelled = false;
    const initializeContract = async () => {
      try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') throw new Error('Contract not deployed at address');
        if (!cancelled && contract) {
          await getContractStatus(contract);
        }
      } catch (err) {
        console.error("Contract initialization error:", err);
      }
    };
    initializeContract();
    return () => { cancelled = true; };
  }, [provider, isInitialized, CONTRACT_ADDRESS, contract, getContractStatus]);

  return {
    contract,
    isInitialized,
    getSignedContract,
    getSignerAddress,
    getContractStatus,
    ...contractState
  };
}
