// src/components/QuickStats.js
import React from 'react';
import { motion } from 'framer-motion';

const QuickStats = ({ stats }) => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 shadow-sm hover:shadow-md hover:shadow-purple-900/5 transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg text-purple-400">{stat.icon}</span>
            <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
          </div>
          <p className="text-xl font-medium text-slate-100 mt-2">
            {stat.value}
          </p>
          {stat.subtext && (
            <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickStats;