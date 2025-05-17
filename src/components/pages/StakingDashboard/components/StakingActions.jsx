import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { FaCoins, FaPlus, FaMinus, FaExclamationTriangle, FaWallet, FaArrowRight } from 'react-icons/fa';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { useStaking } from '../../../../context/StakingContext';
import { StakingSection, ValueDisplay, ActionButton, TransactionStatus } from '../ui/CommonComponents';

// Move helper function outside component to prevent recreation on each render
const getErrorMessageForTransaction = (txType, errorMessage) => {
  const userRejectedPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'rejected by user',
    'transaction was rejected',
    'cancelled by user'
  ];

  const isUserRejection = userRejectedPatterns.some(pattern =>
    errorMessage?.toLowerCase().includes(pattern)
  );

  if (isUserRejection) {
    return "You cancelled the transaction. No changes were made to your account.";
  }

  if (errorMessage?.toLowerCase().includes('gas')) {
    return "There was an issue with the network fees. Please try again with a higher gas limit or later when the network is less congested.";
  }

  switch (txType) {
    case 'deposit':
      return "We couldn't complete your staking transaction. Please check your wallet balance and try again.";
    case 'withdraw_rewards':
      return "We couldn't claim your rewards. Please check your connection and try again later.";
    case 'withdraw_all':
      return "We couldn't process your withdrawal. Please try again later.";
    case 'emergency_withdraw':
      return "The emergency withdrawal couldn't be completed. Please contact support if this persists.";
    default:
      return "Something went wrong with your transaction. Please try again.";
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
  const [depositAmount, setDepositAmount] = useState("");
  const [showEmergencyTooltip, setShowEmergencyTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);
  const previousTxRef = useRef(null);
  const transactionTimerRef = useRef(null);

  const {
    withdrawRewards,
    withdrawAll,
    deposit,
    emergencyWithdraw,
    calculateUserRewards,
    formatWithdrawDate,
    state: { isContractPaused }
  } = useStaking();
  const [rewardsEstimate, setRewardsEstimate] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showEmergencyTooltip &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowEmergencyTooltip(false);
      }
    }

    if (showEmergencyTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmergencyTooltip]);

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

  // Function to reset transaction state
  const resetTransactionState = useCallback(() => {
    if (isPending) {
      setIsPending(false);
      updateStatus('info', 'Transaction state has been reset. You can try again now.');
      
      // Clear any existing timer
      if (transactionTimerRef.current) {
        clearTimeout(transactionTimerRef.current);
        transactionTimerRef.current = null;
      }
      
      // Force refresh user info to ensure we have latest state
      refreshUserInfo(account);
    }
  }, [isPending, setIsPending, updateStatus, refreshUserInfo, account]);

  // Mejora recomendada: Consolidar el reseteo automático
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
      const errorMsg = getErrorMessageForTransaction(currentTx.type, currentTx.error);
      updateStatus('error', errorMsg);
      
      // PROBLEMA POTENCIAL: Este setTimeout podría causar una desincronización 
      // con el estado global si otra parte está también gestionando isPending
      // Es mejor dejar que el efecto dedicado a monitorear transacciones se encargue de esto
      // o usar resetTransactionState directamente
      setTimeout(() => {
        resetTransactionState(); // Usar la función de reinicio consolidada en vez de solo setIsPending
      }, 3000);
    }
  }, [currentTx, setIsPending, updateStatus, refreshUserInfo, account, resetTransactionState]);
  
  // Set up a transaction timeout to automatically clear stuck transactions
  useEffect(() => {
    // Clear any existing timer
    if (transactionTimerRef.current) {
      clearTimeout(transactionTimerRef.current);
      transactionTimerRef.current = null;
    }
    
    // If a transaction is pending, set a timeout to automatically reset after 2 minutes
    if (isPending && currentTx && ['pending', 'awaiting_confirmation', 'preparing'].includes(currentTx.status)) {
      transactionTimerRef.current = setTimeout(() => {
        console.log("Auto-resetting stuck transaction after timeout");
        resetTransactionState();
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (transactionTimerRef.current) {
        clearTimeout(transactionTimerRef.current);
      }
    };
  }, [isPending, currentTx, resetTransactionState]);

  const handleDepositSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!depositAmount || isPending) return;

    try {
      const amountWei = ethers.parseEther(depositAmount);
      setDepositAmount("");
      await deposit(amountWei);
    } catch (error) {
      console.error("Deposit failed:", error);
      updateStatus('error', getErrorMessageForTransaction('deposit', error.message));
    }
  }, [depositAmount, isPending, deposit, updateStatus]);

  const handleWithdrawRewards = useCallback(async () => {
    if (!account || isPending) return;

    try {
      await withdrawRewards();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      updateStatus('error', getErrorMessageForTransaction('withdraw_rewards', error.message));
    }
  }, [account, isPending, withdrawRewards, updateStatus]);

  const handleWithdrawAll = useCallback(async () => {
    if (!account || isPending) return;

    try {
      await withdrawAll();
    } catch (error) {
      console.error("Full withdrawal failed:", error);
      updateStatus('error', getErrorMessageForTransaction('withdraw_all', error.message));
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
      updateStatus('error', getErrorMessageForTransaction('emergency_withdraw', error.message));
    }
  }, [account, isPending, isContractPaused, emergencyWithdraw, updateStatus]);

  const formattedRewards = formatBalance(rewardsEstimate || userInfo?.calculatedRewards || userInfo?.pendingRewards || stakingStats?.pendingRewards || '0');
  const hasRewards = parseFloat(formattedRewards) > 0;

  return (
    <StakingSection title="Rewards & Actions" icon={<FaCoins />} className="h-auto">
      {currentTx && <TransactionStatus tx={currentTx} className="mb-5" onReset={resetTransactionState} />}

      <div className="space-y-8">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/30 p-4">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <FaCoins className="text-indigo-400 mr-2" />
            Your Rewards
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-400">Available to claim</span>
              {stakingStats?.lastWithdraw > 0 && (
                <span className="text-xs text-slate-500">Last claim: {formatWithdrawDate(stakingStats.lastWithdraw)}</span>
              )}
            </div>
            <div className="text-2xl font-medium text-white">{formattedRewards} <span className="text-base text-slate-300">POL</span></div>
          </div>

          <div className="flex gap-3">
            <ActionButton
              onClick={handleWithdrawRewards}
              icon={<FaCoins />}
              label="Claim Rewards"
              isPrimary={hasRewards}
              disabled={isPending || !hasRewards}
              className="flex-1"
            />

            <ActionButton
              onClick={handleWithdrawAll}
              icon={<FaWallet />}
              label="Withdraw All"
              isPrimary={false}
              disabled={isPending || totalStaked <= 0}
              className="flex-1"
            />
          </div>

          <div className="text-xs text-slate-400 mt-3 py-2 px-3 bg-slate-800/50 rounded-lg">
            <strong className="text-indigo-400">Tip:</strong> Claiming rewards keeps your staked tokens active and earning. Withdrawing all will return both your principal and rewards to your wallet.
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/30 p-4">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <FaPlus className="text-indigo-400 mr-2" />
            Stake Tokens
          </h3>

          <form onSubmit={handleDepositSubmit}>
            <div className="mb-4 relative">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="depositAmount" className="text-sm text-slate-400">
                  Amount to stake
                </label>
                <div className="text-xs text-indigo-400">
                  Balance: {formatBalance(userInfo?.walletBalance || '0')} POL
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    id="depositAmount"
                    type="number"
                    min="5"
                    max="10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-800/70 border border-slate-700/40 rounded-lg p-3 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/60 placeholder-slate-500/50 transition-all backdrop-blur-sm"
                    placeholder="Enter amount..."
                    disabled={isPending}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    POL
                  </span>
                </div>

                <ActionButton
                  type="submit"
                  icon={<FaArrowRight />}
                  label="Stake"
                  isPrimary={true}
                  disabled={isPending || !depositAmount || parseFloat(depositAmount) < 5}
                  className="whitespace-nowrap"
                />
              </div>

              <div className="mt-1.5 flex justify-between text-xs">
                <span className="text-slate-500">Min: 5 POL | Max: 10,000 POL</span>
                {depositAmount && (
                  <span className="text-indigo-400">
                    {parseFloat(depositAmount) < 5 && "Amount too small"}
                    {parseFloat(depositAmount) > 10000 && "Amount too large"}
                  </span>
                )}
              </div>
            </div>
          </form>

          <div className="text-xs text-slate-400 mt-1 py-2 px-3 bg-slate-800/50 rounded-lg">
            <strong className="text-indigo-400">Note:</strong> Staked tokens earn compounding rewards. You can add multiple deposits to your staking portfolio over time.
          </div>
        </div>

        {isContractPaused && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-red-400" />
              <h3 className="text-base font-medium text-red-300">Emergency Mode Active</h3>
            </div>
            <p className="text-sm text-red-200/80 mb-3">
              The staking contract is currently paused. Emergency withdrawal is available to recover your funds.
            </p>
            <ActionButton
              onClick={handleEmergencyWithdraw}
              icon={<FaExclamationTriangle />}
              label="Emergency Withdraw"
              isPrimary={false}
              disabled={isPending || totalStaked <= 0}
              className="bg-red-900/50 hover:bg-red-800/70 border-red-700/50 text-red-100"
            />
          </div>
        )}

        {!isContractPaused && totalStaked > 0 && (
          <div className="text-right relative">
            <button
              ref={buttonRef}
              onClick={() => setShowEmergencyTooltip(!showEmergencyTooltip)}
              className="text-xs text-slate-500 underline flex items-center gap-1 ml-auto"
              disabled={isPending}
            >
              <FaExclamationTriangle className="text-slate-500" />
              Emergency Withdraw
            </button>

            {showEmergencyTooltip && (
              <div
                ref={tooltipRef}
                className="absolute right-0 bottom-full mb-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-left max-w-xs z-10"
              >
                <div className="font-medium text-white mb-1">Emergency Withdraw Notice</div>
                <p className="text-slate-300">
                  This function is only available when the contract is paused by the administrator.
                  Currently, the contract is active and operating normally.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <span className="text-green-400">Use "Withdraw All" for normal withdrawals</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StakingSection>
  );
};

export default StakingActions;
