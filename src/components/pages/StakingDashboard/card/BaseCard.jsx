import React from 'react';
import { motion } from 'framer-motion';

const BaseCard = ({ title, icon, children, className }) => {
  return (
    <motion.div
      className={`rounded-xl p-5 sm:p-6 
                  bg-slate-800/30 border border-slate-700/20 
                  backdrop-blur-sm w-full shadow-sm
                  hover:shadow-md hover:shadow-violet-900/10 
                  transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {title && (
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/15">
          {icon && <div className="text-violet-400">{icon}</div>}
          <h3 className="text-base font-medium text-slate-100">{title}</h3>
        </div>
      )}
      <div className={title ? "h-[calc(100%-3.5rem)]" : "h-full"}>
        {children}
      </div>
    </motion.div>
  );
};

export default BaseCard;
