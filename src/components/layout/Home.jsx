// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChartLine, FaShieldAlt, FaRocket } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-12">
        <section className="max-w-6xl mx-auto px-6 text-center pt-16">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Elevate Your Investment Strategy Through Staking
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Experience institutional-grade staking with our audited protocol. Benefit from consistent <span className="text-purple-400">0.025% hourly returns</span>, with potential earnings up to <span className="text-purple-400">130% ROI</span>. Built on blockchain technology ensuring maximum transparency, security, and verifiable performance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
          to="/staking"
          className="px-8 py-4 text-lg font-medium rounded-full bg-black text-white hover:bg-purple-700 transition-colors"
            >
          Begin Your Investment Journey →
            </Link>
          </motion.div>
        </section>

        {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* High ROI Card */}
          <motion.div
            className="bg-white bg-opacity-5 rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FaChartLine className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">High Returns</h3>
            <p className="text-gray-300">
              Earn <span className="font-medium text-purple-400">0.025% hourly</span>, up to <span className="font-medium text-purple-400">130% total ROI</span> on your stakes.
            </p>
          </motion.div>

          {/* Security Card */}
          <motion.div
            className="bg-white bg-opacity-5 rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <FaShieldAlt className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Secure & Transparent</h3>
            <p className="text-gray-300">
              Smart contracts audited for security. Your investments are protected with advanced features.
            </p>
          </motion.div>

          {/* Easy Start Card */}
          <motion.div
            className="bg-white bg-opacity-5 rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <FaRocket className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Easy to Start</h3>
            <p className="text-gray-300">
              Stake as little as <span className="font-medium text-purple-400">5 POL</span>. No complicated setups.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="max-w-4xl mx-auto px-6 mt-24 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Ready to Grow Your Crypto?
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-300 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          Join our staking protocol today and start earning passive income effortlessly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Link
            to="/staking"
            className="px-8 py-4 text-lg font-medium rounded-full bg-black text-white hover:bg-purple-700 transition-colors"
          >
            Get Started Now 🚀
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
