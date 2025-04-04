import React from 'react';
import SupplyTracker from './SupplyTracker';
import KeyMetrics from './KeyMetrics';
import SpaceBackground from '../../effects/SpaceBackground';

const Tokenomics = () => {
  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <SpaceBackground customClass="opacity-80" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 mb-4">
            NUVOS Tokenomics
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore the economic model and token distribution of the NUVOS ecosystem
          </p>
        </div>
        
        <div className="space-y-12">
          <SupplyTracker />
          <KeyMetrics />
        </div>
      </div>
    </div>
  );
};

export default Tokenomics;
