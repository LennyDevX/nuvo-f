import React, { useEffect, useRef } from 'react';
import { Chart } from 'react-chartjs-2';

const ChartWrapper = ({ type, data, options, ...props }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  return (
    <Chart
      ref={chartRef}
      type={type}
      data={data}
      options={{
        ...options,
        plugins: {
          ...options.plugins,
          legend: {
            ...options.plugins?.legend,
            position: 'bottom'
          }
        }
      }}
      {...props}
    />
  );
};

export default React.memo(ChartWrapper);
