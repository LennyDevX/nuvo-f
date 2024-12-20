import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="relative overflow-hidden mb-10 sm:mb-20">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      
      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-16 md:py-24">
        <motion.div 
          className="text-center"
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent px-2">
            Build the Future of DeFi
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Join our community of developers and contributors shaping the next generation of decentralized finance
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Earn NUVO Tokens</h3>
            <p className="text-gray-400">Get rewarded for your contributions with NUVO tokens and governance rights</p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">Join the DAO</h3>
            <p className="text-gray-400">Participate in key decisions and shape the future of the protocol</p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">Build Together</h3>
            <p className="text-gray-400">Collaborate with top developers and innovate in the DeFi space</p>
          </div>
        </motion.div>

        <motion.div 
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
            Start Contributing
          </button>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full border border-purple-500/50 text-white font-semibold hover:bg-purple-500/10 transition-all duration-300">
            Learn More
          </button>
        </motion.div>

        <motion.div 
          className="mt-8 sm:mt-16 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            <div>
              <span className="block text-2xl font-bold text-white">$10M+</span>
              Total Rewards
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">1000+</span>
              Contributors
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">50+</span>
              Active Projects
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
