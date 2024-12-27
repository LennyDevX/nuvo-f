import React from 'react';
import { motion } from 'framer-motion';

const BaseCard = ({ title, icon, children, className }) => {
  return (
    <motion.div
      className={`card-base h-full p-4 hover:border-purple-500/40 transition-all ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700/50">
        {icon && <span className="text-xl text-purple-400">{icon}</span>}
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="h-[calc(100%-3.5rem)]">
        {children}
      </div>
    </motion.div>
  );
};

export default BaseCard;
