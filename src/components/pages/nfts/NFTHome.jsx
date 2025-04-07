import React from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import NFTHeroSection from './NFTHeroSection';
import NFTExplainerSection from './NFTExplainerSection';
import NFTCallToAction from './NFTCallToAction';
import AnimationProvider from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground';

const NFTHome = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <AnimationProvider>
      <div className="bg-nuvo-gradient min-h-screen relative">
        {/* Aplicar el fondo con la misma configuración que Home */}
        <SpaceBackground customClass="opacity-90" />
        
        <div className="relative">
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

export default NFTHome;
