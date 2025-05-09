import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion as m } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { chartOptions, revenueStreamsData } from '../../../utils/chart/chartConfig';
import '../../../utils/chart/chartSetup';

const RevenueStreams = () => {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Nuevos datos de revenue streams con todos los elementos (incluidos los 2 nuevos)
  const updatedRevenueStreamsData = useMemo(() => ({
    labels: [
      'Diversified Revenue', 
      'Yield Generation', 
      'Risk Management', 
      'Strategic Partnerships',
      'Long Term Investment',
      'Strategic BTC Reserve'
    ],
    datasets: [
      {
        data: [20, 22, 15, 18, 12, 13], // Nueva distribución con %
        backgroundColor: [
          'rgba(66, 184, 255, 0.8)',    // Azul celeste
          'rgba(0, 201, 167, 0.8)',     // Verde turquesa  
          'rgba(255, 177, 27, 0.8)',    // Ámbar
          'rgba(111, 76, 255, 0.8)',    // Púrpura vibrante
          'rgba(232, 65, 121, 0.8)',    // Rosa frambuesa
          'rgba(255, 84, 174, 0.8)'     // Rosa intenso
        ],
        borderColor: [
          'rgba(66, 184, 255, 1)',
          'rgba(0, 201, 167, 1)',
          'rgba(255, 177, 27, 1)',
          'rgba(111, 76, 255, 1)',
          'rgba(232, 65, 121, 1)',
          'rgba(255, 84, 174, 1)'
        ],
        hoverBackgroundColor: [
          'rgba(66, 184, 255, 0.9)',
          'rgba(0, 201, 167, 0.9)',
          'rgba(255, 177, 27, 0.9)',
          'rgba(111, 76, 255, 0.9)',
          'rgba(232, 65, 121, 0.9)',
          'rgba(255, 84, 174, 0.9)'
        ]
      }
    ]
  }), []);

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
            },
            afterLabel: (context) => {
              const descriptions = {
                'Diversified Revenue': 'Multiple income streams',
                'Yield Generation': 'Sustainable protocol earnings',
                'Risk Management': 'Security-first approach',
                'Strategic Partnerships': 'High-value collaborations',
                'Long Term Investment': 'Value-accruing assets',
                'Strategic BTC Reserve': 'Bitcoin treasury holdings'
              };
              return `  ${descriptions[context.label] || ''}`;
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
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-blue-400">•</span>
        <span>Diversified revenue sources</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-green-400">•</span>
        <span>Sustainable yield generation</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-amber-400">•</span>
        <span>Risk-managed operations</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-purple-400">•</span>
        <span>Strategic partnerships</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-pink-500">•</span>
        <span>Long term investment</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-pink-400">•</span>
        <span>Strategic BTC Reserve</span>
      </li>
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
      {/* Aumentado el tamaño máximo del gráfico para mayor visibilidad */}
      <div className="aspect-square max-w-[360px] md:max-w-[400px] mx-auto hover:scale-105 transition-transform duration-300">
        <Pie 
          ref={chartRef}
          data={updatedRevenueStreamsData} 
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
