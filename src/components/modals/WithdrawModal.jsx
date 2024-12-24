import React from 'react';
import { FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

const WithdrawModal = ({ isOpen, onClose, onConfirm, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-800">
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">
            Confirm Full Withdrawal
          </h3>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <FaExclamationCircle className="flex-shrink-0 text-red-400" />
                <p className="text-sm text-left text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="space-y-4 mb-6">
            {!error ? (
              <>
                <p className="text-gray-300">
                  You are about to withdraw <span className="text-pink-500 font-semibold">all your staked tokens</span>.
                </p>
                <div className="bg-yellow-500/10 p-4 rounded-lg">
                  <p className="text-yellow-500 text-sm">
                    Please note: This action cannot be undone and will reset your staking position.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">
                  You can try again later or contact support if the problem persists.
                </p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            >
              {error ? 'Close' : 'Cancel'}
            </button>
            {!error && (
              <button
                onClick={onConfirm}
                className="flex-1 py-3 px-4 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Confirm Withdrawal'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;