import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChartWrapper from '../../charts/ChartWrapper';


const TokenomicsSection = ({ mounted }) => {
  const tokenDistributionData = {
    labels: ['Staking Rewards', 'Treasury', 'Community', 'Development', 'Marketing'],
    datasets: [{
      data: [40, 25, 20, 10, 5],
      backgroundColor: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'],
      borderColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 2,
    }]
  };

  const revenueStreamsData = {
    labels: ['Third-Party Staking', 'DeFi Lending', 'Algorithmic Trading', 'Liquidity Provision', 'Strategic Holdings'],
    datasets: [{
      data: [30, 25, 20, 15, 10],
      backgroundColor: ['#7C3AED', '#DB2777', '#0891B2', '#059669', '#D97706'],
      borderColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          padding: 10,
          font: {
            size: window.innerWidth < 640 ? 10 : 14,
          },
        },
      },
    },
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tokenomics & Revenue Distribution
      </motion.h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          className="bg-black/40 rounded-2xl p-6 sm:p-8 border border-purple-500/30 flex flex-col items-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-6 text-center">
            Token Distribution
          </h3>
          <div className="relative w-full" style={{ height: '250px' }}>
            {mounted && (
              <ChartWrapper
                type="pie"
                data={tokenDistributionData}
                options={chartOptions}
                key="token-distribution-chart"
              />
            )}
          </div>
        </motion.div>
        <motion.div
          className="bg-black/40 rounded-2xl p-6 sm:p-8 border border-purple-500/30 flex flex-col items-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-6 text-center">
            Revenue Streams
          </h3>
          <div className="relative w-full" style={{ height: '250px' }}>
            {mounted && (
              <ChartWrapper
                type="pie"
                data={revenueStreamsData}
                options={chartOptions}
                key="revenue-streams-chart"
              />
            )}
          </div>
        </motion.div>
      </div>
      <div className="text-center mt-8">
        <Link
          to="/tokenomics"
          className="inline-block px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:bg-purple-700 transition-colors"
        >
          Learn More About Tokenomics →
        </Link>
      </div>
    </section>
  );
};

export default TokenomicsSection;
