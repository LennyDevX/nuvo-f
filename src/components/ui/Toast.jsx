import React from 'react';
import { m } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <FaCheckCircle className="w-5 h-5" />,
    error: <FaExclamationCircle className="w-5 h-5" />,
    warning: <FaExclamationCircle className="w-5 h-5" />,
    info: <FaInfoCircle className="w-5 h-5" />
  };

  const styles = {
    success: 'bg-green-900/10 border-green-600/20 text-green-300',
    error: 'bg-red-900/10 border-red-600/20 text-red-300',
    warning: 'bg-yellow-900/10 border-yellow-600/20 text-yellow-300',
    info: 'bg-blue-900/10 border-blue-600/20 text-blue-300'
  };

  return (
    <m.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`
        fixed top-4 right-4 z-50 p-4 rounded-xl 
        backdrop-blur-sm border shadow-lg
        ${styles[type]} 
        max-w-md
      `}
    >
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0">{icons[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </m.div>
  );
};

export default Toast;
