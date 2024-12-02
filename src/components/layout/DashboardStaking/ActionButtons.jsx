// src/components/layout/DashboardStaking/ActionButtons.jsx 
import React from "react";
import { motion } from "framer-motion";
import ButtonDeposit from "../../web3/ButtonDeposit";
import ButtonWithdraw from "../../web3/ButtonWithdraw";

const ActionButtons = ({
  availableRewards,
  fetchContractData,
  handleWithdrawalSuccess,
}) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm p-1"
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ButtonDeposit 
          onSuccess={() => fetchContractData(true)}
          className="w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all transform"
        />
      </motion.div>

      <motion.div 
        className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm p-1"
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ButtonWithdraw
          disabled={!parseFloat(availableRewards)}
          onSuccess={handleWithdrawalSuccess}
          className="w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all transform disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </motion.div>
    </motion.div>
  );
};

export default ActionButtons;