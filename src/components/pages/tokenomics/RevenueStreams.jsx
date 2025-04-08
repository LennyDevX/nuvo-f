import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion as m } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { revenueStreamsData } from '../../../utils/ChartConfig';
import { chartOptions } from '../../../utils/ChartConfig';
import '../../../utils/ChartSetup';

const RevenueStreams = () => {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
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

  // Memoize chart options to prevent recreation
  const options = useMemo(() => {
    return {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        id: 'revenueStreams',
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
              const label = context.label || '';
              const value = context.formattedValue;
              return `${label}: ${value}%`;
            }
          }
        }
      },
      animation: {
        animateRotate: !isMobile,
        animateScale: !isMobile,
        duration: isMobile ? 500 : 1000
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
      }
    };
  }, [isMobile]);

  // Memoize strategy list for consistent rendering
  const strategyList = useMemo(() => (
    <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
      <li>• Diversified revenue sources</li>
      <li>• Sustainable yield generation</li>
      <li>• Risk-managed operations</li>
      <li>• Strategic partnerships</li>
    </ul>
  ), []);

  return (
    <m.div
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-white mb-4">
        Revenue Streams
      </h2>
      <div className="aspect-square max-w-[320px] mx-auto hover:scale-105 transition-transform duration-300">
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
        {strategyList}
      </div>
    </m.div>
  );
};

export default React.memo(RevenueStreams);
