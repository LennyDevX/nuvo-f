import React, { useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { revenueStreamsData, chartOptions } from '../../../utils/ChartConfig';
import '../../../utils/ChartSetup';

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
            const label = context.label || '';
            const value = context.formattedValue;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
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
    <m.div
      className="card-purple-gradient card-purple-wrapper"
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
    </m.div>
  );
};

export default RevenueStreams;
