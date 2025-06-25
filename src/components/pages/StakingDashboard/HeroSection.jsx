import React from 'react';
import { m } from 'framer-motion';
import NetworkBadge from '../../web3/NetworkBadge';

const HeroSection = () => {
  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-indigo-900/10 rounded-2xl blur-xl" />
      
      <div className="relative text-center py-8 sm:py-12">
        {/* Main Title */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text mb-4">
            Smart Staking
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <NetworkBadge />
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live Protocol</span>
            </div>
          </div>
        </m.div>
        
        {/* Description */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300/90 mb-4 px-4">
            Maximize your returns with our advanced staking protocol
          </p>
          <p className="text-sm sm:text-base md:text-lg text-slate-400/80 mb-6 px-4">
            Featuring dynamic APY, time-based bonuses, and compound rewards on Polygon Network
          </p>
          
          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              'Dynamic APY',
              'Time Bonuses',
              'Compound Interest',
              'Auto-Reinvest'
            ].map((feature, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                className="px-3 py-1.5 bg-slate-800/30 border border-slate-700/30 text-xs sm:text-sm text-slate-300 rounded-full backdrop-blur-sm"
              >
                {feature}
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </div>
  );
};

export default HeroSection;
