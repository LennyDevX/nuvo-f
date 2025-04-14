import React from 'react';
import SpaceBackground from '../../effects/SpaceBackground';
import HeroSection from './HeroSection';
import FeatureCards from './FeatureCards';
import ProductTabs from './ProductTabs';
import CallToAction from './CallToAction';

const AIHub = () => {
  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-28 pb-16 flex flex-col items-center">
      <SpaceBackground customClass="" />
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        <HeroSection />
        <FeatureCards />
        <ProductTabs />
        <CallToAction />
      </div>
    </div>
  );
};

export default AIHub;
