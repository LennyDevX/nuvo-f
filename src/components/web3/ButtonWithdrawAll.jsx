// ButtonWithdrawAll.jsx
import React from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { WalletContext } from "../../components/context/WalletContext";
import ABI from "../../Abi/StakingContract.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || '';

const ButtonWithdrawAll = ({ onSuccess }) => {
  const { account } = React.useContext(WalletContext);

  const handleWithdrawAll = async () => {
    if (!account) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);

      const tx = await contract.withdrawAll();
      await tx.wait();

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("WithdrawAll error:", error);
    }
  };

  return (
    <motion.button
      onClick={handleWithdrawAll}
      className="w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all transform"
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      Withdraw All
    </motion.button>
  );
};

export default ButtonWithdrawAll;