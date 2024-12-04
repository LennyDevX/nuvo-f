// ButtonWithdrawAll.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { WalletContext } from "../../components/context/WalletContext";
import ABI from "../../Abi/StakingContract.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS || '';

const ButtonWithdrawAll = ({ onSuccess }) => {
  const { account } = React.useContext(WalletContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

    // ButtonWithdrawAll.jsx
  const handleWithdrawAll = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
  
      // Verificar saldos primero
      const userInfo = await contract.getUserInfo(account);
      const contractBalance = await contract.getContractBalance();
      const totalDeposit = await contract.getTotalDeposit(account);
      
      if (totalDeposit.isZero()) {
        throw new Error("No deposits found");
      }
  
      // Verificar que el contrato tiene suficientes fondos
      const totalAmount = totalDeposit.add(userInfo.pendingRewards);
      if (contractBalance.lt(totalAmount)) {
        throw new Error("Insufficient contract balance");
      }
  
      // Estimar gas antes de la transacción
      const gasEstimate = await contract.estimateGas.withdrawAll();
      const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
  
      // Ejecutar transacción con parámetros optimizados
      const tx = await contract.withdrawAll({
        gasLimit: gasLimit,
        from: account
      });
  
      setError("Transaction submitted. Waiting for confirmation...");
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        if (onSuccess) onSuccess();
        setShowConfirm(false);
        setError(null);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("WithdrawAll error:", error);
      
      // Manejo específico de errores
      if (error.message.includes("execution reverted")) {
        if (error.message.includes("No funds")) {
          setError("No funds available to withdraw");
        } else if (error.message.includes("Contract is underfunded")) {
          setError("Contract currently lacks sufficient funds. Please try again later.");
        } else {
          setError("Transaction failed: " + (error.data?.message || error.message));
        }
      } else {
        setError(error.message || "Transaction failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {!showConfirm ? (
        <motion.button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all transform"
          whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
          whileTap={{ scale: 0.98 }}
        >
          Withdraw All
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-red-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-6 h-6 text-red-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
                <h3 className="text-lg font-semibold text-red-400">
                  Important Notice
                </h3>
              </div>
              
              <p className="text-gray-300 text-sm">
                By withdrawing all your deposits, you will:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-2">
                <li>Stop receiving any further staking rewards</li>
                <li>Leave the staking protocol completely</li>
                <li>Need to make new deposits to participate again</li>
              </ul>

              {error && (
                <p className="text-red-400 text-sm mt-2">
                  {error}
                </p>
              )}

              <div className="flex space-x-4 pt-4">
                <motion.button
                  onClick={handleWithdrawAll}
                  disabled={isLoading}
                  className={`flex-1 py-3 text-sm font-medium text-white rounded-xl transition-all
                    ${isLoading 
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                    }`}
                  whileHover={!isLoading && { scale: 1.02 }}
                  whileTap={!isLoading && { scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Confirm Withdrawal'
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setShowConfirm(false);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className={`flex-1 py-3 text-sm font-medium text-white rounded-xl transition-all
                    ${isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  whileHover={!isLoading && { scale: 1.02 }}
                  whileTap={!isLoading && { scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default ButtonWithdrawAll;