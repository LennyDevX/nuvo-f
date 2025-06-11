import React from 'react';
import { FaCoins, FaWallet } from 'react-icons/fa';
import { ActionButton } from '../../ui/CommonComponents';

const RewardsPanel = ({ 
  formattedRewards, 
  stakingStats, 
  formatWithdrawDate, 
  hasRewards,
  totalStaked,
  isPending,
  onWithdrawRewards, 
  onWithdrawAll 
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/30 p-4">
      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
        <FaCoins className="text-indigo-400 mr-2" />
        Your Rewards
      </h3>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-slate-400">Available to claim</span>
          {stakingStats?.lastWithdraw > 0 && (
            <span className="text-xs text-slate-500">
              Last claim: {formatWithdrawDate(stakingStats.lastWithdraw)}
            </span>
          )}
        </div>
        <div className="text-2xl font-medium text-white">
          {formattedRewards} <span className="text-base text-slate-300">POL</span>
        </div>
      </div>

      <div className="flex gap-3">
        <ActionButton
          onClick={onWithdrawRewards}
          icon={<FaCoins />}
          label="Claim Rewards"
          isPrimary={hasRewards}
          disabled={isPending || !hasRewards}
          className="flex-1 btn-nuvo-base bg-nuvo-gradient-button" 
        />

        <ActionButton
          onClick={onWithdrawAll}
          icon={<FaWallet />}
          label="Withdraw All"
          isPrimary={false}
          disabled={isPending || totalStaked <= 0}
          className="flex-1 btn-nuvo-base btn-nuvo-outline"
        />
      </div>

      <div className="text-xs text-slate-400 mt-3 py-2 px-3 bg-slate-800/50 rounded-lg">
        <strong className="text-indigo-400">Tip:</strong> Claiming rewards keeps your staked tokens active and earning. Withdrawing all will return both your principal and rewards to your wallet.
      </div>
    </div>
  );
};

export default RewardsPanel;
