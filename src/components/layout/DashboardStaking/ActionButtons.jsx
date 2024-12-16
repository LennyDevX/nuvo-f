import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import ButtonDeposit from '../../web3/ButtonDeposit';
import ButtonWithdraw from '../../web3/ButtonWithdraw';
import ButtonWithdrawAll from '../../web3/ButtonWithdrawAll';
import { StakingContext } from '../../context/StakingContext';

const ActionButtons = ({
  availableRewards,
  fetchContractData,
  handleWithdrawalSuccess,
  handleDepositSuccess,
}) => {
  const { contract, isPending, isContractPaused } = useContext(StakingContext);

  const onDepositSuccess = async () => {
    await handleDepositSuccess();
    await fetchContractData(true);
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div>
        <ButtonDeposit
          onSuccess={onDepositSuccess}
        />
      </div>

      <div>
        <ButtonWithdraw
          disabled={!parseFloat(availableRewards)}
          onSuccess={handleWithdrawalSuccess}
        />
      </div>

      <div>
        <ButtonWithdrawAll
          onSuccess={handleWithdrawalSuccess}
        />
      </div>
    </motion.div>
  );
};

export default ActionButtons;