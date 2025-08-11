import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { FaCoins } from 'react-icons/fa';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { useStaking } from '../../../../context/StakingContext';
import { StakingSection } from '../ui/CommonComponents';
import { WalletContext } from '../../../../context/WalletContext';

// Import modular components
import TransactionHandler from './actions/TransactionHandler';
import RewardsPanel from './actions/RewardsPanel';
import StakingForm from './actions/StakingForm';
import EmergencyControls from './actions/EmergencyControls';

// Import our enhanced logging utilities
import { blockchainLogger, balanceLogger, LogCategory } from '../../../../utils/blockchain/blockchainLogger';
import { parseTransactionError } from '../../../../utils/errors/errorHandling';

// Move helper function outside component to prevent recreation on each render
const getErrorMessageForTransaction = (txType, error) => {
  // Use the enhanced error parser
  const parsedError = parseTransactionError(error);
  
  // If it's a user rejection, return a friendly message
  if (parsedError.status === 'rejected') {
    switch (txType) {
      case 'deposit':
        return 'You cancelled the staking transaction. No worries, your tokens are safe!';
      case 'withdraw_rewards':
        return 'You cancelled claiming your rewards. Your rewards are still there waiting for you!';
      case 'withdraw_all':
        return 'You cancelled the withdrawal. Your staked tokens and rewards remain safe.';
      case 'emergency_withdraw':
        return 'You cancelled the emergency withdrawal. Your funds remain staked.';
      default:
        return 'Transaction cancelled. Your funds are safe!';
    }
  }
  
  // For other errors, provide context-specific messages
  switch (txType) {
    case 'deposit':
      return parsedError.code === 'INSUFFICIENT_FUNDS' 
        ? 'Not enough MATIC to complete your staking transaction. Please add more MATIC to your wallet.'
        : `Unable to complete staking: ${parsedError.message}`;
    case 'withdraw_rewards':
      if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        return 'Not enough MATIC for gas fees to claim rewards. Please add more MATIC to your wallet.';
      } else if (parsedError.code === 'INSUFFICIENT_CONTRACT_BALANCE') {
        return 'The staking pool currently has insufficient funds to pay your rewards. This is a temporary issue - please try again later or contact support.';
      }
      return `Unable to claim rewards: ${parsedError.message}`;
    case 'withdraw_all':
      if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        return 'Not enough MATIC for gas fees to withdraw. Please add more MATIC to your wallet.';
      } else if (parsedError.code === 'INSUFFICIENT_CONTRACT_BALANCE') {
        return 'The staking pool currently has insufficient funds to process your full withdrawal. This is a temporary issue - please try again later or contact support for assistance.';
      }
      return `Unable to process withdrawal: ${parsedError.message}`;
    case 'emergency_withdraw':
      return `Emergency withdrawal failed: ${parsedError.message}`;
    default:
      return parsedError.message;
  }
};

const StakingActions = ({
  account,
  userInfo,
  stakingStats,
  userDeposits,
  isPending,
  setIsPending,
  updateStatus,
  refreshUserInfo,
  currentTx
}) => {
  const previousTxRef = useRef(null);
  const [walletBalance, setWalletBalance] = useState("0");
  const [fetchingBalance, setFetchingBalance] = useState(false);
  
  // Add WalletContext to access the wallet balance
  const { balance: maticBalance } = useContext(WalletContext);

  const {
    withdrawRewards,
    withdrawAll,
    deposit,
    emergencyWithdraw,
    calculateUserRewards,
    formatWithdrawDate,
    state: { isContractPaused, tokenContract, provider, web3Provider }
  } = useStaking();
  const [rewardsEstimate, setRewardsEstimate] = useState(null);

  const totalStaked = userDeposits?.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.amount || 0);
  }, 0) || 0;

  useEffect(() => {
    if (!account) return;

    const fetchRewards = async () => {
      try {
        const rewards = await calculateUserRewards(account);
        setRewardsEstimate(rewards);
      } catch (error) {
        console.error("Error fetching rewards estimate:", error);
      }
    };

    fetchRewards();

    const interval = setInterval(fetchRewards, 30000);
    return () => clearInterval(interval);
  }, [account, calculateUserRewards]);

  // Fetch wallet balance - optimized version to reduce console spam
  useEffect(() => {
    if (!account) return;

    let isMounted = true;
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 30000; // Increased to 30 seconds from 15 seconds
    const MIN_FETCH_DELAY = 5000; // Minimum 5 seconds between fetches

    const fetchWalletBalance = async () => {
      // Debouncing - prevent multiple rapid fetches
      const now = Date.now();
      if (now - lastFetchTime < MIN_FETCH_DELAY) return;
      
      lastFetchTime = now;
      
      if (!isMounted) return;
      setFetchingBalance(true);
      
      try {
        // First try: Get POL token balance using token contract if available
        if (tokenContract && tokenContract.balanceOf) {
          try {
            const balance = await tokenContract.balanceOf(account);
            const formattedBalance = ethers.formatEther(balance);
            
            if (!isMounted) return;
            
            // Use our enhanced logger
            balanceLogger.logBalanceUpdate(account, 'POL', formattedBalance, 'token_contract');
            
            setWalletBalance(balance.toString());
            setFetchingBalance(false);
            return;
          } catch (err) {
            blockchainLogger.warn(LogCategory.CONTRACT, `Error fetching POL balance: ${err.message}`);
          }
        }
        
        // Second try: Use userInfo.walletBalance if available
        if (userInfo?.walletBalance) {
          if (!isMounted) return;
          
          balanceLogger.logBalanceUpdate(
            account, 
            'POL', 
            userInfo.walletBalance, 
            'user_info'
          );
          
          setWalletBalance(userInfo.walletBalance);
          setFetchingBalance(false);
          return;
        }
        
        // If we get here, we couldn't fetch the POL balance directly
        // Use MATIC balance from WalletContext as a fallback (at least show something)
        if (maticBalance) {
          if (!isMounted) return;
          
          balanceLogger.logBalanceUpdate(
            account, 
            'MATIC', 
            maticBalance, 
            'wallet_context'
          );
          
          setWalletBalance(maticBalance);
          setFetchingBalance(false);
          return;
        }
        
        // If all else fails
        blockchainLogger.warn(LogCategory.WALLET, 'Could not fetch any wallet balance');
      } catch (error) {
        if (!isMounted) return;
        blockchainLogger.error(LogCategory.WALLET, "Error in wallet balance fetch logic", error);
      } finally {
        if (isMounted) {
          setFetchingBalance(false);
        }
      }
    };

    // Initial fetch
    fetchWalletBalance();
    
    // Set up interval for periodic refresh with increased interval
    const interval = setInterval(fetchWalletBalance, FETCH_INTERVAL);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [account, tokenContract, maticBalance, userInfo]);

  // Function to reset transaction state
  const resetTransactionState = useCallback(() => {
    if (isPending) {
      setIsPending(false);
      updateStatus('info', 'Transaction state has been reset. You can try again now.');
      
      // Force refresh user info to ensure we have latest state
      refreshUserInfo(account);
    }
  }, [isPending, setIsPending, updateStatus, refreshUserInfo, account]);

  // Transaction monitoring effect
  useEffect(() => {
    if (
      !currentTx ||
      (previousTxRef.current &&
        previousTxRef.current.status === currentTx.status &&
        previousTxRef.current.type === currentTx.type)
    ) {
      return;
    }

    previousTxRef.current = { ...currentTx };

    // Update isPending based on transaction status
    const isPendingStatus = currentTx.status !== 'confirmed' && currentTx.status !== 'failed';
    setIsPending(isPendingStatus);

    if (currentTx.status === 'confirmed') {
      const successMessages = {
        deposit: 'Deposit successful! Your tokens are now staking and earning rewards.',
        withdraw_rewards: 'Rewards claimed successfully! The tokens have been sent to your wallet.',
        withdraw_all: 'Withdrawal successful! Your principal and rewards have been sent to your wallet.',
        emergency_withdraw: 'Emergency withdrawal successful! Your funds have been returned to your wallet.'
      };

      // Force refresh user info after a successful transaction
      refreshUserInfo(account);
      
      const action = successMessages[currentTx.type] || 'Transaction successful!';
      updateStatus('success', action);
    } else if (currentTx.status === 'failed') {
      // The error should already be properly formatted from the transaction hook
      const errorMsg = currentTx.error || getErrorMessageForTransaction(currentTx.type, 'Transaction failed');
      updateStatus('error', errorMsg);
      
      setTimeout(() => {
        resetTransactionState();
      }, 3000);
    }
  }, [currentTx, setIsPending, updateStatus, refreshUserInfo, account, resetTransactionState]);

  // Action handlers
  const handleWithdrawRewards = useCallback(async () => {
    if (!account || isPending) return;

    try {
      await withdrawRewards();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      updateStatus('error', getErrorMessageForTransaction('withdraw_rewards', error));
    }
  }, [account, isPending, withdrawRewards, updateStatus]);

  const handleWithdrawAll = useCallback(async () => {
    if (!account || isPending) return;

    try {
      await withdrawAll();
    } catch (error) {
      console.error("Full withdrawal failed:", error);
      updateStatus('error', getErrorMessageForTransaction('withdraw_all', error));
    }
  }, [account, isPending, withdrawAll, updateStatus]);

  const handleEmergencyWithdraw = useCallback(async () => {
    if (!account || isPending) return;

    if (!isContractPaused) {
      updateStatus('error', 'Emergency withdrawal is only available when the contract is paused.');
      return;
    }

    try {
      updateStatus('info', 'Processing emergency withdrawal...');
      await emergencyWithdraw();
    } catch (error) {
      console.error("Emergency withdrawal failed:", error);
      updateStatus('error', getErrorMessageForTransaction('emergency_withdraw', error));
    }
  }, [account, isPending, isContractPaused, emergencyWithdraw, updateStatus]);

  const formattedRewards = formatBalance(rewardsEstimate || userInfo?.calculatedRewards || userInfo?.pendingRewards || stakingStats?.pendingRewards || '0');
  const hasRewards = parseFloat(formattedRewards) > 0;
  const displayedBalance = formatBalance(walletBalance || userInfo?.walletBalance || '0');
  const tokenSymbol = maticBalance && !userInfo?.walletBalance && !walletBalance ? 'MATIC' : 'POL';
  
  return (
    <StakingSection title="Rewards & Actions" icon={<FaCoins />} className="h-auto">
      <TransactionHandler 
        currentTx={currentTx}
        isPending={isPending}
        setIsPending={setIsPending}
        updateStatus={updateStatus}
        refreshUserInfo={refreshUserInfo}
        account={account}
        onReset={resetTransactionState}
      />

      <div className="space-y-6 sm:space-y-8">
        <RewardsPanel 
          formattedRewards={formattedRewards}
          stakingStats={stakingStats}
          formatWithdrawDate={formatWithdrawDate}
          hasRewards={hasRewards}
          totalStaked={totalStaked}
          isPending={isPending}
          onWithdrawRewards={handleWithdrawRewards}
          onWithdrawAll={handleWithdrawAll}
        />

        <StakingForm 
          isPending={isPending}
          walletBalance={displayedBalance}
          tokenSymbol={tokenSymbol}
          fetchingBalance={fetchingBalance}
          deposit={deposit}
          updateStatus={updateStatus}
          onError={(error, txType) => {
            const errorMsg = getErrorMessageForTransaction(txType, error);
            updateStatus('error', errorMsg);
          }}
        />

        <EmergencyControls 
          isContractPaused={isContractPaused}
          totalStaked={totalStaked}
          isPending={isPending}
          updateStatus={updateStatus}
          onEmergencyWithdraw={handleEmergencyWithdraw}
        />
      </div>
    </StakingSection>
  );
};

export default StakingActions;
