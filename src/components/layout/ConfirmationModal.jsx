import React from 'react';
import { motion } from 'framer-motion';

function ConfirmationModal({ amount, netAmount, estimatedReturn, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Confirm Deposit</h3>
        <div className="space-y-2 mb-6">
          <p>Amount: {amount} MATIC</p>
          <p>Net deposit: {netAmount} MATIC</p>
          <p>Max return: {estimatedReturn} MATIC</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ConfirmationModal;