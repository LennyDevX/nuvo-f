import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartWrapper from '../../charts/ChartWrapper';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      // Limpiar todas las instancias de Chart al desmontar
      Object.keys(ChartJS.instances).forEach(key => {
        ChartJS.instances[key].destroy();
      });
    };
  }, []);

  // Configuración de los datos para los gráficos
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
    <>
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 sm:pt-20 pb-8 sm:pb-12">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent" />
        <motion.div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1
            className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mt-12 sm:mb-6 leading-tight px-2 sm:px-0"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Elevate Your Investment Strategy Through{" "}
            <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
              Smart Staking
            </span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-300 sm:mb-8 px-2 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Experience a revolutionary staking protocol that combines automated yield optimization with institutional-grade security. Earn consistent{" "}
            <span className="text-purple-400">125% APY</span> through our advanced DeFi strategies. (Launching Soon)
          </motion.p>
          <motion.span
            className="inline-block sm:mt-8 px-3 py-2 mb-6 text-xs sm:text-sm font-medium text-purple-400 bg-purple-400/10 rounded-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Institutional-Grade Staking Protocol (Coming Soon)
          </motion.span>
          {/* Key Features */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              { title: "Solidity Score", value: "78% Average", desc: "Solidity Scan Report" },
              { title: "Total Locked", value: "Projected $1M+", desc: "by Q3 2025" },
              { title: "Active Users", value: "Projected 1K+", desc: "by Q1 2025" }
            ].map((stat) => (
              <div
                key={stat.title}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 text-center"
              >
                <h3 className="text-purple-400 font-medium mb-1">{stat.title}</h3>
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.desc}</p>
              </div>
            ))}
          </motion.div>
          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              to="/staking"
              className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-1 text-center"
            >
              Begin Your Investment Journey →
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium rounded-full bg-black/30 text-white border border-purple-500/30 hover:bg-purple-500/10 transition-all transform hover:-translate-y-1 text-center"
            >
              Learn More About Protocol
            </Link>
          </motion.div>
          {/* Trust Indicators */}
          <motion.div
            className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            
          </motion.div>
        </motion.div>
      </section>
      {/* Tokenomics Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Tokenomics & Revenue Distribution
        </motion.h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Distribution Chart */}
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
          {/* Revenue Streams Chart */}
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
    </>
  );
};

export default HeroSection;