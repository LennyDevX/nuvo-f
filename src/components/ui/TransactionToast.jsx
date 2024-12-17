import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaInfoCircle } from 'react-icons/fa';

const icons = {
  success: <FaCheckCircle className="w-6 h-6" />,
  error: <FaExclamationCircle className="w-6 h-6" />,
  loading: <FaSpinner className="w-6 h-6 animate-spin" />,
  info: <FaInfoCircle className="w-6 h-6" />
};

const toastStyles = {
  success: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/20',
  error: 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/20',
  loading: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/20',
  info: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/20'
};

const textStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  loading: 'text-blue-400',
  info: 'text-purple-400'
};

// Este es el componente especializado para transacciones blockchain
const TransactionToast = ({ message, type, details, hash }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl backdrop-blur-sm border 
        ${toastStyles[type]} shadow-lg max-w-md w-full`}
    >
      <div className="flex items-start gap-3">
        <div className={textStyles[type]}>
          {icons[type]}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium mb-1 ${textStyles[type]}`}>
            {message}
          </h3>
          {details && (
            <p className="text-sm text-gray-300">{details}</p>
          )}
          {hash && (
            <a
              href={`https://polygonscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 mt-2 block"
            >
              View on PolygonScan →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionToast;
