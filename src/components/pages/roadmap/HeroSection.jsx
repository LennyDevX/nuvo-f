import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto px-4 mb-16 text-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-nuvo-gradient-text"
        variants={itemVariants}
      >
        Roadmap & Timeline
      </motion.h1>
      
      <motion.div variants={itemVariants} className="space-y-4">
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Charting our ambitious journey from beta to a revolutionary decentralized ecosystem by Q1 2026
        </p>
        
        <p className="text-md md:text-lg text-gray-400 max-w-3xl mx-auto mb-6">
          Currently in <span className="text-yellow-300 font-medium">Beta Phase</span>, building toward a comprehensive 
          platform with integrated services, advanced tokenization capabilities, and innovative financial tools.
        </p>
        
        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-xl max-w-2xl mx-auto p-4">
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-nuvo-gradient-text mb-3">Key Milestones</h3>
          <div className="grid grid-cols-2 gap-3 text-sm sm:text-base text-left">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Token Pre-Sale Launch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Web Platform v1.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Smart Staking 2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Mobile App Release</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="mt-10 flex justify-center"
        variants={itemVariants}
      >
        <div className="inline-flex gap-4 p-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-purple-500/20">
          <span className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full text-purple-300">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Completed
          </span>
          <span className="flex items-center gap-2 px-4 py-2 text-yellow-300">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            In Progress
          </span>
          <span className="flex items-center gap-2 px-4 py-2 text-gray-400">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Planned
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;
