import { useState, useCallback, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import useProvider from '../blockchain/useProvider';
import ABI from '../../Abi/SmartStaking.json';
import { globalCache } from '../../utils/cache/CacheManager';

export function useStakingContract() {
  const { provider, isInitialized } = useProvider();
  const [contractState, setContractState] = useState({
    isContractPaused: false,
    isMigrated: false,
    treasuryAddress: null,
    totalPoolBalance: '0'
  });

  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS_V2 || "";

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

  const getBrowserProvider = useCallback(() => {
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, []);

  const getSignerAddress = useCallback(async () => {
    const browserProvider = getBrowserProvider();
    if (!browserProvider) {
      console.error('No browser provider available. Please ensure a Web3 wallet (like MetaMask) is installed and enabled.');
      return null;
    }
    try {
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      console.log('✅ Got signer address:', address);
      return address;
    } catch (error) {
      console.error("❌ Error getting signer address:", error);
      return null;
    }
  }, [getBrowserProvider]);

  const getSignedContract = useCallback(async () => {
    const browserProvider = getBrowserProvider();
    if (!browserProvider) throw new Error('No wallet found. Please ensure a Web3 wallet (like MetaMask) is installed and enabled.');
    try {
      const signer = await browserProvider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
    } catch (error) {
      console.error("Error getting signed contract:", error);
      throw error;
    }
  }, [getBrowserProvider, CONTRACT_ADDRESS]);

  const getContractStatus = useCallback(async (contractInstance = contract) => {
    const browserProvider = getBrowserProvider();
    if (!contractInstance || !provider || !isInitialized || !browserProvider) return null;
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
