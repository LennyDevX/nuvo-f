import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { chartOptions } from '../../../utils/chartConfig';
import '../../../utils/chartSetup';

const TokenDistribution = () => {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Nueva distribución de tokens con colores actualizados
  const updatedTokenDistribution = useMemo(() => {
    return {
      labels: [
        'Staking Rewards', 
        'Treasury', 
        'Community Incentives', 
        'Marketing', 
        'Development', 
        'Founder & Team'
      ],
      datasets: [
        {
          data: [20, 15, 20, 15, 20, 10], // Porcentajes actuales
          backgroundColor: [
            'rgba(111, 76, 255, 0.8)',    // Púrpura vibrante
            'rgba(66, 184, 255, 0.8)',    // Azul celeste
            'rgba(255, 84, 174, 0.8)',    // Rosa intenso
            'rgba(255, 177, 27, 0.8)',    // Ámbar
            'rgba(0, 201, 167, 0.8)',     // Verde turquesa
            'rgba(232, 65, 121, 0.8)'     // Rosa frambuesa
          ],
          borderColor: [
            'rgba(111, 76, 255, 1)',
            'rgba(66, 184, 255, 1)',
            'rgba(255, 84, 174, 1)',
            'rgba(255, 177, 27, 1)',
            'rgba(0, 201, 167, 1)',
            'rgba(232, 65, 121, 1)'
          ],
          hoverBackgroundColor: [
            'rgba(111, 76, 255, 0.9)',
            'rgba(66, 184, 255, 0.9)',
            'rgba(255, 84, 174, 0.9)',
            'rgba(255, 177, 27, 0.9)',
            'rgba(0, 201, 167, 0.9)',
            'rgba(232, 65, 121, 0.9)'
          ]
        }
      ]
    };
  }, []);
  
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
                'Community Incentives': 'Ecosystem growth initiatives',
                'Marketing': 'Marketing & partnerships',
                'Development': 'Technical improvements & innovation',
                'Founder & Team': 'Core team allocation'
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

  // Memoize key points content con colores específicos para cada elemento
  const keyPointsContent = useMemo(() => (
    <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-purple-600">•</span>
        <span>20% allocated to staking rewards</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-blue-400">•</span>
        <span>15% treasury allocation</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-pink-400">•</span>
        <span>20% community incentives</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-amber-400">•</span>
        <span>15% marketing</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-green-400">•</span>
        <span>20% development</span>
      </li>
      <li className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
        <span className="text-pink-500">•</span>
        <span>10% founder & team</span>
      </li>
    </ul>
  ), []);

  return (
    <motion.div
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-white mb-4 tracking-wide">
        Token Distribution
      </h2>
      {/* Manteniendo el mismo tamaño para ambos gráficos */}
      <div className="aspect-square max-w-[360px] md:max-w-[400px] mx-auto hover:scale-105 transition-transform duration-300">
        <Pie 
          ref={chartRef}
          data={updatedTokenDistribution} 
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
