// src/components/QuickStats.js
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateROIProgress } from '../../../../utils/roiCalculations';

const QuickStats = ({ depositAmount, totalWithdrawn, loading, stats }) => {
  const roiProgress = useMemo(() => {
    console.log('QuickStats ROI inputs:', { depositAmount, totalWithdrawn });
    if (loading || !depositAmount) return 0;
    const progress = calculateROIProgress(depositAmount, totalWithdrawn);
    console.log('QuickStats calculated ROI:', progress);
    return progress;
  }, [depositAmount, totalWithdrawn, loading]);

  const updatedStats = useMemo(() => {
    return stats.map(stat => {
      if (stat.label === "ROI Progress") {
        const displayValue = loading 
          ? 'Loading...' 
          : `${roiProgress ? roiProgress.toFixed(2) : '0.00'}%`;
        console.log('QuickStats display value:', displayValue);
        return {
          ...stat,
          value: displayValue
        };
      }
      return stat;
    });
  }, [stats, roiProgress, loading]);

  return (
    <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {updatedStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl text-purple-400">{stat.icon}</span>
            <span className="text-sm text-gray-400">{stat.label}</span>
          </div>
          <p className="text-xl font-semibold text-white mt-2">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickStats;