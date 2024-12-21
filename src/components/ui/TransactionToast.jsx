import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';

const icons = {
  success: <FaCheckCircle className="w-6 h-6" />,
  error: <FaExclamationCircle className="w-6 h-6" />,
  loading: <FaSpinner className="w-6 h-6 animate-spin" />,
  info: <FaInfoCircle className="w-6 h-6" />
};

const toastStyles = {
  success: 'bg-green-900/10 border-green-600/20',
  error: 'bg-red-900/10 border-red-600/20',
  loading: 'bg-blue-900/10 border-blue-600/20',
  info: 'bg-purple-900/10 border-purple-600/20'
};

const textStyles = {
  success: 'text-green-300',
  error: 'text-red-300',
  loading: 'text-blue-300',
  info: 'text-purple-300'
};

// Este es el componente especializado para transacciones blockchain
const TransactionToast = ({ message, type, details, hash }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
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
            <p className="text-sm text-gray-300/80">{details}</p>
          )}
          {hash && (
            <a
              href={`https://polygonscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs mt-2 flex items-center gap-1
                ${textStyles[type]} hover:opacity-80 transition-opacity`}
            >
              View on PolygonScan
              <FaExternalLinkAlt className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionToast;
