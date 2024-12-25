import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { revenueStreamsData, chartOptions } from '../../../utils/chartConfig';
import '../../../utils/chartSetup';

const RevenueStreams = () => {
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
      id: 'revenueStreams',
    }
  };

  return (
    <motion.div
      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-white mb-4">
        Revenue Streams
      </h2>
      <div className="aspect-square max-w-[350px] mx-auto hover:scale-105 transition-transform duration-300">
        <Pie 
          ref={chartRef}
          data={revenueStreamsData} 
          options={options}
        />
      </div>
      <div className="mt-4 md:mt-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-2">
          Strategy
        </h3>
        <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
          <li>• Diversified revenue sources</li>
          <li>• Sustainable yield generation</li>
          <li>• Risk-managed operations</li>
          <li>• Strategic partnerships</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default RevenueStreams;
