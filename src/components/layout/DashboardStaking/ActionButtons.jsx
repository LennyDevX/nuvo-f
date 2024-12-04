// src/components/layout/DashboardStaking/ActionButtons.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ButtonDeposit from '../../web3/ButtonDeposit';
import ButtonWithdraw from '../../web3/ButtonWithdraw';
import ButtonWithdrawAll from '../../web3/ButtonWithdrawAll';

const ActionButtons = ({
  availableRewards,
  fetchContractData,
  handleWithdrawalSuccess,
}) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div>
        <ButtonDeposit
          onSuccess={() => fetchContractData(true)}
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