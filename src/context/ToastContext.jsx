import React, { createContext, useState, useCallback, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import TransactionToast from '../components/ui/TransactionToast';
import Toast from '../components/ui/Toast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration: options.duration || 5000,
      details: options.details,
      hash: options.hash,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration (except for loading toasts)
    if (type !== 'loading' && toast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const showErrorToast = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showErrorToast, hideToast, updateToast, toasts }}>
      {children}
      
      {/* Toast Containers */}
      <div className="pointer-events-none z-[9999]">
        <AnimatePresence>
          {toasts.map(toast => {
            // Use TransactionToast for blockchain-related toasts
            if (toast.hash || toast.details) {
              return (
                <TransactionToast
                  key={toast.id}
                  id={toast.id}
                  message={toast.message}
                  type={toast.type}
                  details={toast.details}
                  hash={toast.hash}
                  duration={toast.duration}
                  onDismiss={hideToast}
                />
              );
            }
            
            // Use regular Toast for simple messages
            return (
              <div key={`wrapper-${toast.id}`} className="fixed inset-0 pointer-events-none">
                <Toast
                  key={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onClose={() => hideToast(toast.id)}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
