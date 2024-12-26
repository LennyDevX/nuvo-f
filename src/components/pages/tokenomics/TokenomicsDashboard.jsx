import React from "react";
import { motion } from "framer-motion";
import MainLayout from '../../layout/MainLayout';
import TokenDistribution from './TokenDistribution';
import RevenueStreams from './RevenueStreams';
import HeroSection from "./HeroSection";
import KeyMetrics from './KeyMetrics';
import '../../../Styles/gradients.css';

const TokenomicsDashboard = () => {
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
            {/* Main Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                Tokenomics <span className="text-white">Dashboard</span>
              </h1>
              <p className="text-gray-300 text-lg">
                Understanding our token distribution and revenue model
              </p>
            </motion.div>

            {/* Hero Section */}
            <div className="mb-16">
              <HeroSection />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              <TokenDistribution />
              <RevenueStreams />
            </div>

            {/* Key Metrics */}
            <KeyMetrics />

            {/* Tokenomics Explanation */}
            <motion.div
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20 mt-8"
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
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default TokenomicsDashboard;