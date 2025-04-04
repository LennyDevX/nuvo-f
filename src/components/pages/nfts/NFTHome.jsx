import React, { useEffect } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import NFTHeroSection from './NFTHeroSection';
import NFTExplainerSection from './NFTExplainerSection';
import NFTCallToAction from './NFTCallToAction';
import AnimationProvider from '../../animation/AnimationProvider';
// Import the SpaceBackground component instead of CSS
import SpaceBackground from '../../effects/SpaceBackground';

const NFTsPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  useEffect(() => {
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <AnimationProvider>
      <div className="bg-gradient-to-b from-black via-purple-950/20 to-black min-h-screen">
        <div className="relative">
          {/* Use the SpaceBackground component */}
          <SpaceBackground />
          
          <m.div style={{ y }} className="relative z-10 pt-20">
            <NFTHeroSection />
            <NFTExplainerSection />
            <NFTCallToAction />
          </m.div>
        </div>
      </div>
    </AnimationProvider>
  );
};

export default NFTsPage;
