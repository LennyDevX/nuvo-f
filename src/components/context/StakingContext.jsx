// StakingContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from './WalletContext';
import ABI from '../../Abi/StakingContract.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
export const StakingContext = createContext();

const MIN_DEPOSIT = ethers.utils.parseEther("5");
const MAX_DEPOSIT = ethers.utils.parseEther("10000");
const MAX_DEPOSITS = 300;

export function StakingProvider({ children }) {
  const { account } = useContext(WalletContext);
  const [contract, setContract] = useState(null);
  const [userDeposits, setUserDeposits] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState('0');
  const [remainingSlots, setRemainingSlots] = useState(MAX_DEPOSITS);
  const [isContractPaused, setIsContractPaused] = useState(false);
  const [isMigrated, setIsMigrated] = useState(false);
  const [estimatedRewards, setEstimatedRewards] = useState('0');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  // Initialize contract and setup listeners
  useEffect(() => {
    if (account) {
      initializeContract();
      return () => {
        if (contract) {
          contract.removeAllListeners();
        }
      };
    }
  }, [account]);

  const initializeContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakingContract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
      
      setContract(stakingContract);

      // Setup event listeners
      stakingContract.on("DepositMade", (user, depositId, amount, commission, timestamp) => {
        if (user.toLowerCase() === account.toLowerCase()) {
          fetchUserData();
        }
      });

      // Fetch initial state
      const [paused, migrated, deposits] = await Promise.all([
        stakingContract.paused(),
        stakingContract.migrated(),
        stakingContract.getUserDeposits(account)
      ]);

      setIsContractPaused(paused);
      setIsMigrated(migrated);
      setUserDeposits(deposits);
      setRemainingSlots(MAX_DEPOSITS - deposits.length);

      await fetchUserData();
    } catch (err) {
      console.error("Contract initialization error:", err);
      setError("Failed to initialize contract");
    }
  };

  const fetchUserData = async () => {
    if (!contract || !account) return;
    
    try {
      setIsPending(true);
      const [deposits, rewards, userDeposits] = await Promise.all([
        contract.getTotalDeposit(account),
        contract.calculateRewards(account),
        contract.getUserDeposits(account)
      ]);

      setTotalDeposits(ethers.utils.formatEther(deposits));
      setEstimatedRewards(ethers.utils.formatEther(rewards));
      setUserDeposits(userDeposits);
      setRemainingSlots(MAX_DEPOSITS - userDeposits.length);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
    } finally {
      setIsPending(false);
    }
  };

  const makeDeposit = async (amount) => {
    if (!contract || !account || isContractPaused || isMigrated) return false;

    try {
      setIsPending(true);
      setError(null);

      const amountInWei = ethers.utils.parseEther(amount.toString());

      // Validate deposit amount
      if (amountInWei.lt(MIN_DEPOSIT)) {
        throw new Error("Deposit below minimum (5 MATIC)");
      }
      if (amountInWei.gt(MAX_DEPOSIT)) {
        throw new Error("Deposit exceeds maximum (10000 MATIC)");
      }
      if (userDeposits.length >= MAX_DEPOSITS) {
        throw new Error("Maximum deposits reached");
      }

      const tx = await contract.deposit({ 
        value: amountInWei,
        gasLimit: 300000
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        await fetchUserData();
        return true;
      }
      throw new Error("Transaction failed");

    } catch (err) {
      console.error("Deposit error:", err);
      setError(err.reason || err.message || "Failed to make deposit");
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <StakingContext.Provider value={{
      contract,
      userDeposits,
      totalDeposits,
      remainingSlots,
      isContractPaused,
      isMigrated,
      estimatedRewards,
      isPending,
      error,
      makeDeposit,
      fetchUserData
    }}>
      {children}
    </StakingContext.Provider>
  );
}