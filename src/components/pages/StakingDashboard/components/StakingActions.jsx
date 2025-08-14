import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { FaCoins } from 'react-icons/fa';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { useStaking } from '../../../../context/StakingContext';
import { StakingSection, FriendlyAlert } from '../ui/CommonComponents';
import { WalletContext } from '../../../../context/WalletContext';
import { useToast } from '../../../../hooks/useToast';
import { StakingDebugLogger } from '../../../../utils/staking/debugLogger';

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
      case 'compound':
        return 'You cancelled the compound transaction. Your rewards are still available to claim or compound.';
      default:
        return 'Transaction cancelled. Your funds are safe!';
    }
  }
  
  // Check for specific contract errors first
  const errorMessage = parsedError.message || '';
  
  // Handle contract-specific errors
  if (errorMessage.includes('FundsAreLocked') || errorMessage.includes('funds are locked')) {
    return 'Your funds are still locked. Please wait until the lock-up period expires before withdrawing.';
  }
  
  if (errorMessage.includes('NoRewardsAvailable') || errorMessage.includes('No rewards available')) {
    return 'You don\'t have any rewards to claim or compound yet. Keep staking to earn rewards!';
  }
  
  if (errorMessage.includes('DailyWithdrawalLimitExceeded') || errorMessage.includes('daily withdrawal limit')) {
    return 'You have reached your daily withdrawal limit. Please try again tomorrow or withdraw a smaller amount.';
  }
  
  if (errorMessage.includes('NoDepositsFound') || errorMessage.includes('No deposits found')) {
    return 'You don\'t have any staked tokens. Please stake some tokens first before attempting to withdraw.';
  }
  
  if (errorMessage.includes('InsufficientBalance') || errorMessage.includes('insufficient balance')) {
    return 'The staking pool currently has insufficient funds. This is a temporary issue - please try again later or contact support.';
  }
  
  if (errorMessage.includes('InvalidLockupDuration') || errorMessage.includes('invalid lockup')) {
    return 'Invalid lock-up duration selected. Please choose a valid lock-up period (30, 90, 180, or 365 days).';
  }
  
  // For other errors, provide context-specific messages
  switch (txType) {
    case 'deposit':
      if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        return 'Not enough MATIC to complete your staking transaction. Please add more MATIC to your wallet.';
      }
      if (errorMessage.includes('DepositTooLow')) {
        return 'Deposit amount is too low. Minimum deposit is 5 POL tokens.';
      }
      if (errorMessage.includes('DepositTooHigh')) {
        return 'Deposit amount is too high. Maximum deposit is 10,000 POL tokens.';
      }
      if (errorMessage.includes('MaxDepositsReached')) {
        return 'You have reached the maximum number of deposits (300). Please withdraw some deposits before making new ones.';
      }
      return `Unable to complete staking: ${parsedError.message}`;
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
      } else if (parsedError.message.includes('No deposits found') || parsedError.message.includes('totalDeposited')) {
        return 'You don\'t have any staked tokens to withdraw. Please stake some tokens first before attempting to withdraw.';
      }
      return `Unable to process withdrawal: ${parsedError.message}`;
    case 'compound':
      if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        return 'Not enough MATIC for gas fees to compound rewards. Please add more MATIC to your wallet.';
      }
      return `Unable to compound rewards: ${parsedError.message}`;
    case 'emergency_withdraw':
      if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        return 'Not enough MATIC for gas fees for emergency withdrawal. Please add more MATIC to your wallet.';
      }
      return `Emergency withdrawal failed: ${parsedError.message}`;
    default:
      return parsedError.message || 'Transaction failed. Please try again.';
  }
};

const StakingActions = ({
  account,
  userInfo,
  stakingStats,
  userDeposits,
  isPending,
  setIsPending,
  refreshUserInfo,
  currentTx,
  statusMessage,
  setStatusMessage
}) => {
  const previousTxRef = useRef(null);
  const [walletBalance, setWalletBalance] = useState("0");
  const [fetchingBalance, setFetchingBalance] = useState(false);
  
  // Add WalletContext to access the wallet balance
  const { balance: maticBalance } = useContext(WalletContext);
  const { showToast, showErrorToast } = useToast();

  const {
    withdrawRewards,
    withdrawAll,
    deposit,
    emergencyWithdraw,
    compound,
    calculateUserRewards,
    formatWithdrawDate,
    state: { isContractPaused, tokenContract, provider, web3Provider }
  } = useStaking();
  const [rewardsEstimate, setRewardsEstimate] = useState(null);

  const totalStaked = userDeposits?.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.amount || 0);
  }, 0) || parseFloat(userInfo?.totalStaked || 0);

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
      showToast('Transaction state has been reset. You can try again now.');
      
      // Force refresh user info to ensure we have latest state
      refreshUserInfo(account);
    }
  }, [isPending, setIsPending, showToast, refreshUserInfo, account]);

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
        emergency_withdraw: 'Emergency withdrawal successful! Your funds have been returned to your wallet.',
        compound: 'Compound successful! Your rewards have been reinvested and are now earning additional rewards.'
      };

      // Force refresh user info after a successful transaction
      refreshUserInfo(account);
      
      const action = successMessages[currentTx.type] || 'Transaction successful!';
      showToast(action);
    } else if (currentTx.status === 'failed') {
      // The error should already be properly formatted from the transaction hook
      const errorMsg = currentTx.error || getErrorMessageForTransaction(currentTx.type, 'Transaction failed');
      showErrorToast(errorMsg);
      
      setTimeout(() => {
        resetTransactionState();
      }, 3000);
    }
  }, [currentTx, setIsPending, showToast, showErrorToast, refreshUserInfo, account, resetTransactionState]);

  // Action handlers
  const handleWithdrawRewards = useCallback(async () => {
    if (!account || isPending) {
      StakingDebugLogger.logError('WITHDRAW_REWARDS_BLOCKED', new Error('Account not connected or transaction pending'), {
        account: !!account,
        isPending
      });
      return;
    }

    StakingDebugLogger.logButtonState({
      action: 'withdraw_rewards',
      account,
      isPending,
      hasRewards: !!rewardsEstimate && parseFloat(rewardsEstimate) > 0,
      rewardsEstimate
    });

    try {
      await withdrawRewards();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      StakingDebugLogger.logError('WITHDRAW_REWARDS_FAILED', error, {
        account,
        rewardsEstimate,
        isPending
      });
      showErrorToast(getErrorMessageForTransaction('withdraw_rewards', error));
    }
  }, [account, isPending, withdrawRewards, showErrorToast, rewardsEstimate]);

  const handleWithdrawAll = useCallback(async () => {
    if (!account || isPending) return;

    try {
      await withdrawAll();
    } catch (error) {
      console.error("Full withdrawal failed:", error);
      showErrorToast(getErrorMessageForTransaction('withdraw_all', error));
    }
  }, [account, isPending, withdrawAll, showErrorToast]);

  const handleEmergencyWithdraw = useCallback(async () => {
    if (!account || isPending) return;

    if (!isContractPaused) {
      showErrorToast('Emergency withdrawal is only available when the contract is paused.');
      return;
    }

    try {
      showToast('Processing emergency withdrawal...');
      await emergencyWithdraw();
    } catch (error) {
      console.error("Emergency withdrawal failed:", error);
      showErrorToast(getErrorMessageForTransaction('emergency_withdraw', error));
    }
  }, [account, isPending, isContractPaused, emergencyWithdraw, showToast, showErrorToast]);

  const handleCompound = useCallback(async () => {
    if (!account || isPending) {
      StakingDebugLogger.logError('COMPOUND_BLOCKED', new Error('Account not connected or transaction pending'), {
        account: !!account,
        isPending
      });
      return;
    }

    StakingDebugLogger.logButtonState({
      action: 'compound',
      account,
      isPending,
      hasRewards: !!rewardsEstimate && parseFloat(rewardsEstimate) > 0,
      rewardsEstimate
    });

    try {
      await compound();
    } catch (error) {
      console.error("Compound failed:", error);
      StakingDebugLogger.logError('COMPOUND_FAILED', error, {
        account,
        rewardsEstimate,
        isPending
      });
      showErrorToast(getErrorMessageForTransaction('compound', error));
    }
  }, [account, isPending, compound, showErrorToast, rewardsEstimate]);

  const formattedRewards = formatBalance(rewardsEstimate || userInfo?.calculatedRewards || userInfo?.pendingRewards || stakingStats?.pendingRewards || '0');
  const hasRewards = parseFloat(formattedRewards) > 0;
  const displayedBalance = formatBalance(walletBalance || userInfo?.walletBalance || '0');
  const tokenSymbol = maticBalance && !userInfo?.walletBalance && !walletBalance ? 'MATIC' : 'POL';
  
  return (
    <StakingSection title="Rewards & Actions" icon={<FaCoins />} className="h-auto">
      <div className="space-y-6 sm:space-y-8">
        <RewardsPanel 
          formattedRewards={formattedRewards}
          stakingStats={stakingStats}
          formatWithdrawDate={formatWithdrawDate}
          hasRewards={hasRewards}
          totalStaked={totalStaked}
          isPending={isPending}
          onWithdrawRewards={handleWithdrawRewards}
          onCompound={handleCompound}
          onWithdrawAll={handleWithdrawAll}
        />



        <StakingForm 
          isPending={isPending}
          walletBalance={displayedBalance}
          tokenSymbol={tokenSymbol}
          fetchingBalance={fetchingBalance}
          deposit={deposit}
          showToast={showToast}
          showErrorToast={showErrorToast}
          userInfo={userInfo}
          rewardsEstimate={rewardsEstimate}
          onError={(error, txType) => {
            const errorMsg = getErrorMessageForTransaction(txType, error);
            showErrorToast(errorMsg);
          }}
        />

        <EmergencyControls 
          isContractPaused={isContractPaused}
          totalStaked={totalStaked}
          isPending={isPending}
          showToast={showToast}
          showErrorToast={showErrorToast}
          onEmergencyWithdraw={handleEmergencyWithdraw}
        />
      </div>

      {/* Status Message Display - Moved to end of section */}
      {statusMessage && (
        <FriendlyAlert
          type={statusMessage.type}
          title={statusMessage.type === 'error' ? 'Transaction Error' : 'Success'}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* Transaction Handler - Moved to bottom */}
      <TransactionHandler 
        currentTx={currentTx}
        isPending={isPending}
        setIsPending={setIsPending}
        showToast={showToast}
        showErrorToast={showErrorToast}
        refreshUserInfo={refreshUserInfo}
        account={account}
        onReset={resetTransactionState}
      />
    </StakingSection>
  );
};

export default StakingActions;
