import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaGem, FaWallet } from 'react-icons/fa';
import ButtonDeposit from '../../web3/ButtonDeposit';
import ButtonWithdraw from '../../web3/ButtonWithdraw';
import { useStaking } from '../../../context/StakingContext';
import BaseCard from './card/BaseCard';

const ActionButtons = ({
  availableRewards,
  fetchContractData,
  handleWithdrawalSuccess,
  handleDepositSuccess,
}) => {
  const { state } = useStaking();
  const {  } = state;

  const onDepositSuccess = async () => {
    await handleDepositSuccess();
    await fetchContractData(true);
  };

  return (
    <motion.div
      className="w-full px-4 py-8 sm:py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-amber-400">
          Manage Your Stake
        </span>
      </h2>
      
      <div className="">
        <BaseCard icon={<FaRocket className="text-amber-400" />} title="Deposit">
          <ButtonDeposit onSuccess={onDepositSuccess} />
        </BaseCard>

        <BaseCard icon={<FaGem className="text-teal-400" />} title="Collect Rewards">
          <ButtonWithdraw 
            disabled={!parseFloat(availableRewards)}
            onSuccess={handleWithdrawalSuccess}
          />
        </BaseCard>

        <BaseCard icon={<FaWallet className="text-amber-400" />} title="Exit Position">
          <ButtonWithdraw
            onSuccess={handleWithdrawalSuccess}
          />
        </BaseCard>
      </div>
    </motion.div>
  );
};

export default ActionButtons;