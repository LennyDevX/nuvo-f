import React from 'react';
import { Link } from 'react-router-dom';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { FaShieldAlt, FaChartLine, FaCloud } from 'react-icons/fa';
import StakingCalculator from '../../layout/StakingCalculator';

const HeroSection = () => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-22 sm:pt-18 pb-8 sm:pb-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
        {/* Left Column - Content */}
        <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.2] sm:leading-tight tracking-tight">
              <span className="block mb-2">Elevate Your</span>
              <span className="gradient-text block mb-2">Investment Strategy</span>
              <span className="block">Through Smart Staking</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 max-w-xl mt-6">
              Experience a revolutionary staking protocol combining automated yield optimization 
              with institutional-grade security.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 mt-8"
          >
            {[
              { value: "125%", label: "APY", icon: <FaChartLine /> },
              { value: "100%", label: "Transparent", icon: <FaShieldAlt /> },
              { value: "Token ERC20", label: "Powered By Polygon Network", icon: <FaCloud /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center sm:flex-col sm:items-center p-4 bg-black/20 rounded-xl border border-purple-500/20 gap-3 sm:gap-2"
              >
                <div className="text-purple-400 text-2xl sm:text-xl sm:mb-2">{stat.icon}</div>
                <div className="flex flex-col flex-1 sm:flex-none sm:text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-purple-300 sm:mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10"
          >
            <Link
              to="/staking"
              className="px-6 sm:px-8 py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-1"
            >
              Start Staking
            </Link>
            <Link
              to="/about"
              className="px-6 sm:px-8 py-3 text-center bg-black/30 border border-purple-500/30 rounded-full text-white font-medium hover:bg-purple-500/10 transition-all transform hover:-translate-y-1"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Calculator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mt-8 lg:mt-0"
        >
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-700" />
            </div>
            
            {/* Staking Calculator Integration */}
            <div className="relative">
              <StakingCalculator />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;