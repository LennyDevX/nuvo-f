import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { tokenDistributionData, chartOptions } from '../../../utils/chartConfig';
import '../../../utils/chartSetup';

const TokenDistribution = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      id: 'tokenDistribution',
    }
  };

  return (
    <motion.div
      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-white mb-4 tracking-wide">
        Token Distribution
      </h2>
      <div className="aspect-square max-w-[320px] mx-auto hover:scale-105 transition-transform duration-300">
        <Pie 
          ref={chartRef}
          data={tokenDistributionData} 
          options={options}
        />
      </div>
      <div className="mt-6 space-y-4">
        <h3 className="text-xl font-semibold text-purple-400 mb-2 tracking-wide">
          Key Points
        </h3>
        <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
          <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
            <span className="text-purple-500">•</span>
            <span>40% allocated to staking rewards</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
            <span className="text-purple-500">•</span>
            <span>25% treasury allocation</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
            <span className="text-purple-500">•</span>
            <span>20% community incentives</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
            <span className="text-purple-500">•</span>
            <span>15% development & marketing</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default TokenDistribution;
