import React, { useState, useCallback, memo } from 'react';
import { ethers } from 'ethers';
import { FaPlus, FaArrowRight, FaRecycle } from 'react-icons/fa';
import { ActionButton } from '../../ui/CommonComponents';
import { parseTransactionError } from '../../../../../utils/errors/errorHandling';
import LockupPeriodSelector from '../LockupPeriodSelector';
import { STAKING_CONSTANTS } from '../../../../../utils/staking/constants';
import { useToast } from '../../../../../hooks/useToast';

// Use memo to prevent unnecessary re-renders
const StakingForm = memo(({ 
  isPending, 
  walletBalance, 
  tokenSymbol, 
  fetchingBalance, 
  deposit, 
  showToast,
  showErrorToast,
  onError,
  userInfo,
  rewardsEstimate
}) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedLockupPeriod, setSelectedLockupPeriod] = useState(STAKING_CONSTANTS.LOCKUP_PERIODS.FLEXIBLE);
  const [enableCompounding, setEnableCompounding] = useState(false);
  const { showToast: localShowToast, showErrorToast: localShowErrorToast } = useToast();

  const handleDepositSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!depositAmount || isPending) return;

    // Validate deposit amount before proceeding
    const stakeAmount = parseFloat(depositAmount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      (showErrorToast || localShowErrorToast)('Please enter a valid amount to stake.');
      return;
    }

    if (stakeAmount < 5) {
      (showErrorToast || localShowErrorToast)('Minimum deposit amount is 5 POL.');
      return;
    }

    if (stakeAmount > 10000) {
      (showErrorToast || localShowErrorToast)('Maximum deposit amount is 10,000 POL.');
      return;
    }

    const walletBalanceNum = parseFloat(walletBalance || '0');
    if (stakeAmount > walletBalanceNum) {
      (showErrorToast || localShowErrorToast)(`Insufficient balance. You have ${walletBalanceNum.toFixed(4)} ${tokenSymbol} available.`);
      return;
    }

    try {
      const amountWei = ethers.parseEther(depositAmount);
      const lockupDurationDays = selectedLockupPeriod ? (selectedLockupPeriod.lockupDuration || selectedLockupPeriod.days) : 0;
      setDepositAmount("");
      
      // Let the deposit function handle the error messages
      const result = await deposit(amountWei, lockupDurationDays);
      
      // The transaction hook will handle success/error status updates
      if (!result.success && result.error) {
        (showErrorToast || localShowErrorToast)(result.error);
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      
      // Only handle errors that weren't already handled by the transaction hook
      const parsedError = parseTransactionError(error);
      
      let errorMessage;
      if (parsedError.status === 'rejected') {
        errorMessage = 'You cancelled the staking transaction. No worries, your tokens are safe!';
      } else if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Not enough MATIC for gas fees. Please add more MATIC to your wallet.';
      } else {
        errorMessage = `Unable to complete staking: ${parsedError.message}`;
      }
      
      (showErrorToast || localShowErrorToast)(errorMessage);
    }
  }, [depositAmount, isPending, deposit, showErrorToast]);

  const handleStakeSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isPending || !depositAmount) return;
    
    const stakeAmount = parseFloat(depositAmount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      (showErrorToast || localShowErrorToast)('Please enter a valid amount to stake.');
      return;
    }

    const walletBalanceNum = parseFloat(walletBalance || '0');
    if (stakeAmount > walletBalanceNum) {
      (showErrorToast || localShowErrorToast)(`Insufficient balance. You have ${walletBalanceNum.toFixed(4)} ${tokenSymbol} available.`);
      return;
    }

    try {
      const amountWei = ethers.parseEther(depositAmount);
      const lockupDurationDays = selectedLockupPeriod ? (selectedLockupPeriod.lockupDuration || selectedLockupPeriod.days) : 0;
      await deposit(amountWei, lockupDurationDays);
      setDepositAmount('');
    } catch (error) {
      console.error("Staking failed:", error);
      
      const parsedError = parseTransactionError(error);
      
      let errorMessage;
      if (parsedError.status === 'rejected') {
        errorMessage = 'You cancelled the staking transaction. No worries, your tokens are safe!';
      } else if (parsedError.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Not enough MATIC for gas fees. Please add more MATIC to your wallet.';
      } else {
        errorMessage = `Unable to complete staking: ${parsedError.message}`;
      }
      
      (showErrorToast || localShowErrorToast)(errorMessage);
    }
  }, [depositAmount, isPending, walletBalance, tokenSymbol, deposit, showErrorToast]);

  const availableRewards = parseFloat(rewardsEstimate || 0);
  const canCompound = availableRewards > 0;

  const handleCompoundRewards = useCallback(async () => {
    if (!canCompound || isPending) return;
    
    try {
      // This would compound the available rewards
      // For now, we'll show it as adding to the deposit amount
      const newAmount = (parseFloat(depositAmount) || 0) + availableRewards;
      setDepositAmount(newAmount.toString());
      (showToast || localShowToast)(`Added ${availableRewards.toFixed(4)} POL rewards to your staking amount!`);
    } catch (error) {
      console.error('Compound failed:', error);
      (showErrorToast || localShowErrorToast)('Failed to compound rewards. Please try again.');
    }
  }, [canCompound, isPending, depositAmount, availableRewards, showToast, showErrorToast]);

  return (
    <div className="space-y-4">
      {/* Lockup Period Selector */}
      <LockupPeriodSelector 
        selectedPeriod={selectedLockupPeriod}
        onPeriodChange={setSelectedLockupPeriod}
        stakingAmount={depositAmount}
      />

      {/* Staking Form */}
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
                Balance: {walletBalance} {tokenSymbol}
                {fetchingBalance && <span className="ml-1 animate-pulse">•</span>}
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
                disabled={isPending || !depositAmount || parseFloat(depositAmount) < 5 || parseFloat(depositAmount) > 10000}
                className="whitespace-nowrap btn-nuvo-base bg-nuvo-gradient-button flex-shrink-0"
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

        {/* Compounding Section */}
        {canCompound && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FaRecycle className="text-green-400 mr-2" />
                <span className="text-sm font-medium text-white">Compound Rewards</span>
              </div>
              <span className="text-sm text-green-400">{availableRewards.toFixed(4)} POL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Add your pending rewards to your staking amount
              </span>
              <ActionButton
                onClick={handleCompoundRewards}
                icon={<FaRecycle />}
                label="Compound"
                disabled={isPending}
                className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              />
            </div>
          </div>
        )}

        {/* Selected period info */}
        {selectedLockupPeriod ? (
          <div className="text-xs text-slate-400 py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span><strong className="text-indigo-400">Selected:</strong> {selectedLockupPeriod.label}</span>
              <span className="text-green-400">+{selectedLockupPeriod.bonus}% bonus</span>
            </div>
            <div className="text-slate-500">
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-2 px-3 bg-green-900/20 rounded-lg border border-green-700/30">
            <div className="flex items-center justify-between mb-1">
              <span><strong className="text-green-400">Mode:</strong> Flexible Staking</span>
              <span className="text-slate-400">No lockup period</span>
            </div>
            <div className="text-slate-500">
              0.01% per hour • Withdraw anytime • Automatic compounding included
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default StakingForm;
