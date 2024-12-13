import React from 'react';
import HeroSection from '../home/HeroSection';
import StakingCalculator from '../../utils/StakingCalculator';
import Features from '../home/Features';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <HeroSection />
      <StakingCalculator />
      <Features />
      <style>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Home;