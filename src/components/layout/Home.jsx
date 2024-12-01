// Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaLock, FaTrophy } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const Home = () => {
  const [stakingAmount, setStakingAmount] = useState('5');
  const contractAddress = "0xc23242a0bbaad97280b2e73d6dc240df2bc5dee4";

  const calculateReturns = (amount) => {
    const daily = (amount * 0.6) / 100;
    const monthly = daily * 30;
    const sixMonths = daily * 180;
    const yearly = monthly * 12;
    return { daily, monthly, sixMonths, yearly };
  };

  
  const { daily, monthly, sixMonths, yearly } = calculateReturns(parseFloat(stakingAmount) || 0);

  return (
    <div className="min-h-screen pt-4 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
            {/* Enhanced Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 text-center pt-32 pb-24">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent" />
        
        {/* Main Content */}
        <motion.div className="relative z-10">
          <motion.span
            className="inline-block px-4 py-1 mb-6 text-sm font-medium text-purple-400 bg-purple-400/10 rounded-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Institutional-Grade Staking Protocol
          </motion.span>
      
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Elevate Your Investment Strategy Through <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-500">Smart Staking</span>
          </motion.h1>
      
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Experience a revolutionary staking protocol that combines automated yield optimization with institutional-grade security. Earn consistent <span className="text-purple-400">0.025% hourly returns</span>, with potential earnings up to <span className="text-purple-400">130% ROI</span> through our advanced DeFi strategies.
          </motion.p>
      
          {/* Key Features */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              { title: "Audited Security", value: "3 Audits", desc: "by leading firms" },
              { title: "Total Locked", value: "$2.5M+", desc: "in protocol" },
              { title: "Active Users", value: "1000+", desc: "growing community" }
            ].map((stat, index) => (
              <div key={stat.title} className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <h3 className="text-purple-400 font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.desc}</p>
              </div>
            ))}
          </motion.div>
      
          {/* CTAs */}
          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              to="/staking"
              className="px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-1"
            >
              Begin Your Investment Journey →
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 text-lg font-medium rounded-full bg-black/30 text-white border border-purple-500/30 hover:bg-purple-500/10 transition-all transform hover:-translate-y-1"
            >
              Learn More About Protocol
            </Link>
          </motion.div>
      
          {/* Trust Indicators */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <span className="text-sm text-gray-400 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Audited by Certik
            </span>
            <span className="text-sm text-gray-400 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              KYC Verified Team
            </span>
            <span className="text-sm text-gray-400 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Insurance Coverage
            </span>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Add to your global styles */}
      <style jsx global>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add your benefit items here */}
        </div>
      </section>

      <motion.h2
        className="text-3xl md:text-4xl font-bold text-white mb-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tokenomics & Revenue Distribution
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            className="bg-black/40 rounded-2xl p-10 border border-purple-500/30 flex flex-col items-center shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-semibold text-purple-400 mb-8">
              Token Distribution
            </h3>
            <div className="relative h-[320px] w-full">
              <Pie
                data={{
                  labels: ['Staking Rewards', 'Treasury', 'Community', 'Development', 'Marketing'],
                  datasets: [{
                    data: [40, 25, 20, 10, 5],
                    backgroundColor: [
                      '#8B5CF6',
                      '#EC4899',
                      '#06B6D4',
                      '#10B981',
                      '#F59E0B'
                    ],
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 2
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#fff',
                        padding: 20,
                        font: {
                          size: 14
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className="bg-black/40 rounded-2xl p-10 border border-purple-500/30 flex flex-col items-center shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-semibold text-purple-400 mb-8">
              Revenue Streams
            </h3>
            <div className="relative h-[320px] w-full">
              <Pie
                data={{
                  labels: ['Third-Party Staking', 'DeFi Lending', 'Algorithmic Trading', 'Liquidity Provision', 'Strategic Holdings'],
                  datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                      '#7C3AED',
                      '#DB2777',
                      '#0891B2',
                      '#059669',
                      '#D97706'
                    ],
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 2
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#fff',
                        padding: 20,
                        font: {
                          size: 14
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-8 py-20">
        <motion.div
          className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-3xl p-12 border border-purple-500/30 backdrop-blur-sm shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Calculate Your Potential Returns
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <label className="block text-gray-200 mb-4 text-xl font-medium">
                Staking Amount (POL)
              </label>
              <input
                type="number"
                min="5"
                max="10000"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white text-2xl mb-8 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Enter amount..."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  className="bg-black/40 rounded-xl p-6 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-gray-300 text-lg mb-2">Daily Returns (0.6%)</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {daily.toFixed(2)} POL
                  </p>
                </motion.div>
                <motion.div 
                  className="bg-black/40 rounded-xl p-6 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-gray-300 text-lg mb-2">Monthly Returns</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {monthly.toFixed(2)} POL
                  </p>
                </motion.div>
                <motion.div 
                  className="bg-black/40 rounded-xl p-6 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-gray-300 text-lg mb-2">6 Months Returns</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {sixMonths.toFixed(2)} POL
                  </p>
                </motion.div>
              </div>
            </div>
            <p className="text-gray-300 text-base mt-6 text-center">
              *Calculations based on 0.6% daily ROI
            </p>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaLock className="w-12 h-12 text-purple-400" />,
              title: "Connect & Deposit",
              description: "Connect your wallet and deposit a minimum of 5 POL to start earning rewards."
            },
            {
              icon: <FaClock className="w-12 h-12 text-purple-400" />,
              title: "Earn Hourly",
              description: "Receive 0.025% returns every hour, automatically credited to your stake."
            },
            {
              icon: <FaTrophy className="w-12 h-12 text-purple-400" />,
              title: "Maximize Returns",
              description: "Earn up to 130% ROI through consistent staking and bonus rewards."
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              className="bg-black/30 rounded-xl p-8 text-center border border-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="flex justify-center mb-6">{step.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Community Benefits
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Holding Bonus", reward: "+2% APR", requirement: "Hold 1000+ tokens" },
            { title: "Referral Rewards", reward: "+1% per referral", requirement: "Up to 5% bonus" },
            { title: "Community Bonus", reward: "+3% monthly", requirement: "Active participation" },
            { title: "Duration Bonus", reward: "+1% quarterly", requirement: "Long-term staking" }
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-xl font-semibold text-purple-400 mb-3">{benefit.title}</h3>
              <p className="text-2xl font-bold text-white mb-2">{benefit.reward}</p>
              <p className="text-gray-400 text-sm">{benefit.requirement}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Ready to Start Earning?
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-300 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Join our growing community of investors and start earning passive income today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link
            to="/staking"
            className="px-8 py-4 text-lg font-medium rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Get Started →
          </Link>
        </motion.div>
      </section>

      {/* Contract Address Section */}
      <section className="max-w-6xl mx-auto px-6 py-4 text-center">
        <div className="bg-black/40 rounded-xl p-4 border border-purple-500/30 shadow-xl">
          <p className="text-gray-300 text-lg">Contract Address:</p>
          <a 
            href="https://polygonscan.com/address/0xc23242a0bbaad97280b2e73d6dc240df2bc5dee4" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-purple-700 text-white text-sm font-semibold px-3 py-1 rounded-full"
          >
            {contractAddress}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
