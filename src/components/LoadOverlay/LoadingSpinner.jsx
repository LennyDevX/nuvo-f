import React from 'react';
import { motion } from 'framer-motion';

// Unified loading spinner component with customizable size and message
const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizes = {
    small: 'w-6 h-6 border-2',
    default: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-black/60 rounded-lg p-4 flex items-center gap-4">
        <div className={`${sizes[size]} border-purple-500/20 border-t-purple-500 rounded-full animate-spin`} />
        <span className="text-sm text-purple-300">{message}</span>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
