import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { tokenDistributionData, chartOptions } from '../../../utils/ChartConfig';
import '../../../utils/ChartSetup';

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
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: 'rgb(209, 213, 219)',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const label = context.label;
            return ` ${label}: ${value}%`;
          },
          afterLabel: (context) => {
            const descriptions = {
              'Staking Rewards': 'Long-term holder incentives',
              'Treasury': 'Protocol development & security',
              'Community': 'Ecosystem growth initiatives',
              'Development': 'Technical improvements & marketing'
            };
            return `  ${descriptions[context.label] || ''}`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#000',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2,
        hoverOffset: 5
      }
    }
  };

  return (
    <motion.div
      className="card-purple-gradient card-purple-wrapper"
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
