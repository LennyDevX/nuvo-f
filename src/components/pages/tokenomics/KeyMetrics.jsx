import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaLock } from 'react-icons/fa';

const KeyMetrics = () => {
  const metrics = [
    {
      title: "Total Supply",
      value: "21,000,000",
      desc: "Fixed Maximum Supply",
      icon: <FaLock className="text-purple-400 text-xl" />
    },
    {
      title: "Community Allocation",
      value: "60%",
      desc: "Reserved for Community",
      icon: <FaUsers className="text-purple-400 text-xl" />
    },
    {
      title: "Launch Price Target",
      value: "$0.50",
      desc: "Initial Trading Price",
      icon: <FaChartLine className="text-purple-400 text-xl" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          className="bg-black/30 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            {metric.icon}
            <h3 className="text-lg font-medium text-purple-400">
              {metric.title}
            </h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {metric.value}
          </p>
          <p className="text-sm text-gray-400">{metric.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default KeyMetrics;
