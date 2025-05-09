import React, { useState } from 'react';
import { ethers } from 'ethers';
import { FaCoins, FaPlus, FaMinus } from 'react-icons/fa';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { useStaking } from '../../../../context/StakingContext';
import { StakingSection, ValueDisplay, ActionButton } from '../ui/CommonComponents';

const StakingActions = ({ 
  account, 
  userInfo, 
  stakingStats, 
  userDeposits, 
  isPending, 
  setIsPending,
  updateStatus,
  refreshUserInfo
}) => {
  const [depositAmount, setDepositAmount] = useState("");
  const { withdrawRewards, withdrawAll, deposit } = useStaking();
  
  // Calculate total staked amount
  const totalStaked = userDeposits?.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.amount || 0);
  }, 0) || 0;
  
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isPending) return;
    
    try {
      setIsPending(true);
      updateStatus('info', 'Processing deposit...');
      
      const amountWei = ethers.parseEther(depositAmount);
      await deposit(amountWei);
      
      updateStatus('success', 'Deposit successful!');
      setDepositAmount("");
      refreshUserInfo(account);
    } catch (error) {
      console.error("Deposit failed:", error);
      updateStatus('error', 'Deposit failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  };
  
  const handleWithdrawRewards = async () => {
    if (!account || isPending) return;
    
    try {
      setIsPending(true);
      updateStatus('info', 'Processing withdrawal...');
      
      await withdrawRewards();
      
      updateStatus('success', 'Rewards withdrawal successful!');
      refreshUserInfo(account);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      updateStatus('error', 'Withdrawal failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  };
  
  const handleWithdrawAll = async () => {
    if (!account || isPending) return;
    
    try {
      setIsPending(true);
      updateStatus('info', 'Processing full withdrawal...');
      
      await withdrawAll();
      
      updateStatus('success', 'Full withdrawal successful!');
      refreshUserInfo(account);
    } catch (error) {
      console.error("Full withdrawal failed:", error);
      updateStatus('error', 'Full withdrawal failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <StakingSection title="Rewards & Actions" icon={<FaCoins />}>
      <div className="space-y-6">
        {/* Rewards Section */}
        <div>
          <ValueDisplay 
            label="Available Rewards" 
            value={formatBalance(userInfo?.pendingRewards || stakingStats?.pendingRewards || '0')} 
            suffix="POL"
            className="mb-4"
          />
          
          {stakingStats?.lastWithdraw > 0 && (
            <div className="text-sm text-slate-400 mb-4">
              Last withdrawal: {new Date(stakingStats.lastWithdraw * 1000).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {/* Deposit Section */}
        <div className="pt-4 border-t border-slate-700/30">
          <form onSubmit={handleDepositSubmit}>
            <div className="mb-4">
              <label htmlFor="depositAmount" className="block text-sm text-slate-400 mb-2">
                Deposit or Withdraw Amount
              </label>
              <div className="relative">
                <input
                  id="depositAmount"
                  type="number"
                  min="5"
                  max="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/60 placeholder-slate-500/50 transition-all backdrop-blur-sm"
                  placeholder="Enter amount to stake..."
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  POL
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Min: 5 POL | Max: 10,000 POL
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-between">
              <ActionButton 
                type="submit"
                icon={<FaPlus />} 
                label="Stake" 
                isPrimary={true}
                disabled={isPending || !depositAmount || parseFloat(depositAmount) < 5}
              />

              <div className="flex gap-2">
                <ActionButton 
                  onClick={handleWithdrawRewards} 
                  icon={<FaCoins />} 
                  label="Claim" 
                  isPrimary={false}
                  disabled={isPending || !(parseFloat(userInfo?.pendingRewards || 0) > 0)}
                />
                
                <ActionButton 
                  onClick={handleWithdrawAll} 
                  icon={<FaMinus />} 
                  label="Withdraw All" 
                  isPrimary={false}
                  disabled={isPending || totalStaked <= 0}
                />
              </div>
            </div>
          </form>

          <div className="text-xs text-slate-400 mt-6 py-2 px-3 bg-slate-800/40 rounded-lg">
            When withdrawing all funds, both your principal and rewards will be sent to your wallet.
            Claiming rewards keeps your staked tokens active and earning.
          </div>
        </div>
      </div>
    </StakingSection>
  );
};

export default StakingActions;
