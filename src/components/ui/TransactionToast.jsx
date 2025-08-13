import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaInfoCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

const icons = {
  success: <FaCheckCircle className="w-5 h-5" />,
  error: <FaExclamationCircle className="w-5 h-5" />,
  loading: <FaSpinner className="w-5 h-5 animate-spin" />,
  info: <FaInfoCircle className="w-5 h-5" />
};

// Refined styles for a more modern look
const toastStyles = {
  success: 'bg-gradient-to-br from-green-900/80 to-black/70 border-green-500/40',
  error: 'bg-gradient-to-br from-red-900/80 to-black/70 border-red-500/40',
  loading: 'bg-gradient-to-br from-blue-900/80 to-black/70 border-blue-500/40',
  info: 'bg-gradient-to-br from-purple-900/80 to-black/70 border-purple-500/40'
};

const textStyles = {
  success: 'text-green-300',
  error: 'text-red-300',
  loading: 'text-blue-300',
  info: 'text-purple-300'
};

// Este es el componente especializado para transacciones blockchain
const TransactionToast = ({ id, message, type = 'info', details, hash, duration = 5000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && type !== 'loading') { // Don't auto-close loading toasts
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, type]); // Depend on id and type

  const handleClose = () => {
    setIsVisible(false);
    // Optionally call a dismiss function passed from parent after animation
    if (onDismiss) {
      // Delay dismissal until animation completes
      setTimeout(() => onDismiss(id), 300);
    }
  };


  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={id} // Use a unique key for AnimatePresence
          layout // Add layout prop for smoother animations if list changes
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          // Position relative to container, appears near staking form
          className={`relative mb-4 z-[100] p-4 rounded-xl backdrop-blur-md border
            ${toastStyles[type]} shadow-lg w-full max-w-md mx-auto`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${textStyles[type]}`}>
              {icons[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0"> {/* Added min-w-0 for text wrapping */}
              <h3 className={`font-semibold text-sm mb-1 ${textStyles[type]}`}>
                {message}
              </h3>
              {details && (
                <p className="text-xs text-gray-300/90 break-words">{details}</p> // Added break-words
              )}
              {hash && (
                <a
                  href={`https://polygonscan.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs mt-2 inline-flex items-center gap-1.5
                    ${textStyles[type]} hover:underline transition-opacity`}
                >
                  View on PolygonScan
                  <FaExternalLinkAlt className="w-2.5 h-2.5" /> {/* Slightly smaller link icon */}
                </a>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 -mt-1 -mr-1 rounded-full hover:bg-white/10" // Adjusted margin and added hover bg
              aria-label="Close toast"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionToast;