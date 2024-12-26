import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaLock, FaUsers } from 'react-icons/fa';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-black/60 to-black/70 p-8 md:p-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NUVOS Token
          </h1>
          <p className="text-xl md:text-2xl text-purple-300 mt-2">
            The Foundation of Our Digital Economy
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-3xl">
          <p className="text-gray-300 text-lg mb-6">
            Introducing NUVOS, the cornerstone of our ecosystem with a fixed supply of 21M tokens.
            Built for sustainability, transparency, and community-driven growth.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <FaLock className="text-purple-400 text-2xl mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Fixed Supply</h3>
            <p className="text-gray-400">21M tokens maximum supply, no additional minting capability</p>
          </div>

          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <FaRocket className="text-purple-400 text-2xl mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Launch Timeline</h3>
            <p className="text-gray-400">Pre-release: Q2 2025<br />Official Launch: Q3 2025</p>
          </div>

          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <FaUsers className="text-purple-400 text-2xl mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Community First</h3>
            <p className="text-gray-400">Priority access for community members during pre-release</p>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-8 flex flex-wrap gap-4"
        >
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
            Learn More
          </button>
          <button className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
            Join Waitlist
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
