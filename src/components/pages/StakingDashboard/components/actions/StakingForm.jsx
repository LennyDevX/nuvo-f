import React, { useState, useCallback, memo } from 'react';
import { ethers } from 'ethers';
import { FaPlus, FaArrowRight } from 'react-icons/fa';
import { ActionButton } from '../../ui/CommonComponents';
import { parseTransactionError } from '../../../../../utils/errors/errorHandling';

// Use memo to prevent unnecessary re-renders
const StakingForm = memo(({ 
  isPending, 
  walletBalance, 
  tokenSymbol, 
  fetchingBalance, 
  deposit, 
  updateStatus,
  onError
}) => {
  const [depositAmount, setDepositAmount] = useState("");

  const handleDepositSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!depositAmount || isPending) return;

    try {
      const amountWei = ethers.parseEther(depositAmount);
      setDepositAmount("");
      
      // Let the deposit function handle the error messages
      const result = await deposit(amountWei);
      
      // The transaction hook will handle success/error status updates
      if (!result.success && result.error) {
        updateStatus('error', result.error);
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
      
      updateStatus('error', errorMessage);
    }
  }, [depositAmount, isPending, deposit, updateStatus]);

  const handleStakeSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isPending || !depositAmount) return;
    
    const stakeAmount = parseFloat(depositAmount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      updateStatus('error', 'Please enter a valid amount to stake.');
      return;
    }

    const walletBalanceNum = parseFloat(walletBalance || '0');
    if (stakeAmount > walletBalanceNum) {
      updateStatus('error', `Insufficient balance. You have ${walletBalanceNum.toFixed(4)} ${tokenSymbol} available.`);
      return;
    }

    try {
      await deposit(depositAmount);
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
      
      updateStatus('error', errorMessage);
    }
  }, [depositAmount, isPending, walletBalance, tokenSymbol, deposit, updateStatus]);

  return (
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

      <div className="text-xs text-slate-400 mt-1 py-2 px-3 bg-slate-800/50 rounded-lg mb-4 md:mb-0">
        <strong className="text-indigo-400">Note:</strong> Staked tokens earn compounding rewards. You can add multiple deposits to your staking portfolio over time.
      </div>
    </div>
  );
});

export default StakingForm;
