import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaInfoCircle, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';

const icons = {
  success: <FaCheckCircle className="w-4 h-4" />,
  error: <FaExclamationCircle className="w-4 h-4" />,
  loading: <FaSpinner className="w-4 h-4 animate-spin" />,
  info: <FaInfoCircle className="w-4 h-4" />
};

// Updated styles matching your custom CSS design system
const toastStyles = {
  success: 'bg-gradient-to-br from-green-900/95 to-black/90',
  error: 'bg-gradient-to-br from-red-900/95 to-black/90',
  loading: 'bg-gradient-to-br from-purple-900/98 to-black/95',
  info: 'bg-gradient-to-br from-blue-900/95 to-black/90'
};

const iconStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  loading: 'text-pink-400',
  info: 'text-blue-400'
};

// Este es el componente especializado para transacciones blockchain
const TransactionToast = ({ id, message, type = 'info', details, hash, duration = 5000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && type !== 'loading') {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, type]);

  const handleClose = () => {
    setIsVisible(false);
    if (onDismiss) {
      setTimeout(() => onDismiss(id), 300);
    }
  };

  // Determinar si necesita backdrop (para transacciones importantes)
  const needsBackdrop = type === 'loading' || type === 'error';

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop oscuro para transacciones importantes */}
          {needsBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
              style={{ zIndex: 150 }}
            />
          )}

          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed rounded-xl backdrop-blur-md shadow-2xl border-2
              ${toastStyles[type]}
              ${needsBackdrop 
                ? 'z-[200] border-purple-500/60 shadow-[0_0_30px_rgba(139,92,246,0.5)]' 
                : 'z-[100] border-purple-500/30'
              }
              
              // Mobile positioning - above mobile navbar with safe area
              bottom-20 left-3 right-3
              sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-md
              
              // Safe area support for notched devices
              mb-safe-area-mobile
            `}
            style={{
              // Ensure it's above mobile navbar (64px) + safe area
              bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
              // Desktop positioning
              '@media (min-width: 640px)': {
                bottom: '1rem',
                left: 'auto',
                right: '1rem',
                marginBottom: '0'
              }
            }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon with enhanced gradient background for important transactions */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${needsBackdrop 
                    ? 'bg-gradient-to-br from-white/30 to-transparent border border-white/40' 
                    : 'bg-gradient-to-br from-white/20 to-transparent'
                  }
                  ${iconStyles[type]}
                  ${type === 'loading' ? 'animate-pulse' : ''}
                `}>
                  {icons[type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm mb-1 ${iconStyles[type]}`}>
                    {message}
                  </h3>
                  {details && (
                    <p className="text-xs text-gray-300/90 break-words leading-relaxed">
                      {details}
                    </p>
                  )}
                  {hash && (
                    <motion.a
                      href={`https://polygonscan.com/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md
                        text-xs font-medium transition-all duration-200
                        bg-white/10 hover:bg-white/20
                        ${iconStyles[type]} hover:text-white
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View on PolygonScan
                      <FaExternalLinkAlt className="w-2.5 h-2.5" />
                    </motion.a>
                  )}
                </div>

                {/* Close Button - solo visible para transacciones no críticas */}
                {type !== 'loading' && (
                  <motion.button
                    onClick={handleClose}
                    className="
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                      bg-white/10 hover:bg-white/20
                      text-gray-400 hover:text-white transition-all duration-200
                    "
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close notification"
                  >
                    <FaTimes className="w-3 h-3" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionToast;
