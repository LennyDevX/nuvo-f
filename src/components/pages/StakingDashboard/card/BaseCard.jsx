import React from 'react';
import { motion } from 'framer-motion';

const BaseCard = ({ title, icon, children, className }) => {
  return (
    <motion.div
      className={`rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-teal-900/40 to-slate-900/40 
                  border border-teal-500/30 backdrop-blur-sm w-full shadow-lg 
                  hover:shadow-teal-500/10 transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.01, y: -5 }}
      whileTap={{ scale: 0.99 }}
    >
      {title && (
        <div className="flex items-center gap-3 mb-5 pb-6 border-b border-teal-700/30">
          {icon && <div className="bg-teal-900/50 p-2 rounded-lg">{icon}</div>}
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className={title ? "h-[calc(100%-3.5rem)]" : "h-full"}>
        {children}
      </div>
    </motion.div>
  );
};

export default BaseCard;
