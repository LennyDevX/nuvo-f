// src/components/layout/TokenomicsDashboard/TokenomicsDashboard.jsx
import React from "react";
import { color, motion } from "framer-motion";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { size } from "lodash";
import MainLayout from '../../layout/MainLayout';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const TokenomicsDashboard = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          padding: 10,
          font: {
            size: typeof window !== 'undefined' ? (window.innerWidth < 640 ? 10 : 14) : 14,
          },
        },
      },
    },
  };

  const tokenDistributionData = {
    labels: ["Staking Rewards", "Treasury", "Community", "Development", "Marketing"],
    datasets: [
      {
        data: [40, 25, 20, 10, 5],
        backgroundColor: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 3,
      },
    ],
  };

  const revenueStreamsData = {
    labels: [
      "Third-Party Staking",
      "DeFi Lending",
      "Algorithmic Trading",
      "Liquidity Provision",
      "Strategic Holdings",
    ],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: ["#7C3AED", "#DB2777", "#0891B2", "#059669", "#D97706"],
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 3,
      },
    ],
  };

  const keyMetrics = [
    {
      title: "Total Supply",
      value: "5,000,000",
      desc: "Fixed supply, no inflation",
    },
    {
      title: "Circulating Supply",
      value: "0",
      desc: "0% in circulation",
    },
    {
      title: "Treasury Holdings",
      value: "$n/a",
      desc: "For protocol stability",
    },
  ];

  return (
    <MainLayout showFooter={true}>
      <div className="min-h-screen pt-4 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full pt-16 pb-6 md:pt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                Tokenomics{" "}
                <span className="text-white">
                  Dashboard
                </span>
              </h1>
              <p className="text-gray-300">
                Understanding our token distribution and revenue model
              </p>
            </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {/* Token Distribution */}
              <motion.div
                  className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
              >
                  <h2 className="text-xl font-bold text-white mb-4 tracking-wide">
                      Token Distribution
                  </h2>
                  <div className="aspect-square max-w-[320px] mx-auto hover:scale-105 transition-transform duration-300">
                      <Pie data={tokenDistributionData} options={options} />
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

                          {/* Revenue Streams */}
              <motion.div
                  className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"                            initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
              >
                  <h2 className="text-xl font-bold text-white mb-4">
                      Revenue Streams
                  </h2>
                  <div className="aspect-square max-w-[350px] mx-auto hover:scale-105 transition-transform duration-300">
                      <Pie data={revenueStreamsData} options={options} />
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
          </div>

          {/* Key Metrics Section */}          
          <div className="grid grid-cols text-white md:grid-cols-3 gap-6 mb-12">
              {keyMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3 className="text-lg text-white font-medium text-purple-400 mb-2">
                    {metric.title}
                  </h3>
                  <p className="text-2xl font-bold text-white mb-1">
                    {metric.value}
                  </p>
                  <p className="text-sm text-white">{metric.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Tokenomics Explanation */}
            <motion.div
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Why Our Tokenomics Matter
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">
                    Sustainable Growth
                  </h3>
                  <p className="text-gray-300">
                    Our tokenomics model is designed for long-term sustainability,
                    with careful allocation of resources to ensure continuous
                    protocol development and reward distribution.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">
                    Community First
                  </h3>
                  <p className="text-gray-300">
                    60% of tokens are dedicated to community benefits through
                    staking rewards and ecosystem growth, ensuring alignment
                    between protocol success and user value.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Remove Roadmap Section */}
          </div>
        </motion.div>

        <style>{`
          .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default TokenomicsDashboard;