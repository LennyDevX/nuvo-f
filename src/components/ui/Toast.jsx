import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

// Este es el componente base simple para notificaciones básicas
const Toast = ({ message, type = 'error', onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? FaCheckCircle : FaExclamationCircle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
      >
        <Icon className="text-xl" />
        <p className="text-sm">{message}</p>
        <button onClick={onClose} className="ml-4">
          <FaTimes />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
