import React from 'react';
import { motion } from 'framer-motion';
import { keyMetricsData } from '../../../utils/chartConfig';

const KeyMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {keyMetricsData.map((metric, index) => (
        <motion.div
          key={metric.title}
          className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <h3 className="text-lg text-white font-medium text-purple-400 mb-2">
            {metric.title}
          </h3>
          <p className="text-2xl font-bold text-white mb-1">
            {metric.value}
          </p>
          <p className="text-sm text-white">{metric.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default KeyMetrics;
