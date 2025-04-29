import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

/**
 * Componente de superposición de carga con animación
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.text='Cargando...'] - Texto a mostrar durante la carga
 * @param {string} [props.className] - Clases CSS adicionales
 */
const LoadingOverlay = ({ text = 'Cargando...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="text-purple-500 text-3xl mb-3"
      >
        <FaSpinner />
      </motion.div>
      <p className="text-gray-300 text-sm">{text}</p>
    </div>
  );
};

export default LoadingOverlay;