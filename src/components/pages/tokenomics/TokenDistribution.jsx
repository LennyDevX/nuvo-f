import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { tokenDistributionData, chartOptions } from '../../../utils/ChartConfig';
import '../../../utils/ChartSetup';

const TokenDistribution = () => {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Throttled resize handler
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  // Memoize chart options based on device type
  const options = useMemo(() => {
    const baseOptions = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        id: 'tokenDistribution',
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: isMobile ? 10 : 12,
              family: "'Inter', sans-serif"
            },
            color: 'rgb(209, 213, 219)',
            padding: isMobile ? 10 : 15,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: isMobile ? 6 : 10
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: isMobile ? 12 : 14,
            weight: 'bold'
          },
          bodyFont: {
            size: isMobile ? 11 : 13
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
        animateRotate: !isMobile,
        animateScale: !isMobile,
        duration: isMobile ? 600 : 1200
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
          hoverOffset: isMobile ? 3 : 5
        }
      },
      responsive: true,
      maintainAspectRatio: true
    };
    
    return baseOptions;
  }, [isMobile]);

  // Memoize key points content
  const keyPointsContent = useMemo(() => (
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
  ), []);

  return (
    <motion.div
      className="bg-gradient-to-b from-purple-700/10 to-black/30 rounded-3xl shadow-lg overflow-hidden p-6"
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
        {keyPointsContent}
      </div>
    </motion.div>
  );
};

export default React.memo(TokenDistribution);
