import React, { useState } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import NFTHeroSection from './NFTHeroSection';
import NFTExplainerSection from './NFTExplainerSection';
import NFTCallToAction from './NFTCallToAction';
import AnimationProvider from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground';
import WhitelistModal from '../../modals/WhitelistModal';

const NFTHome = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AnimationProvider>
      <div className="bg-nuvo-gradient min-h-screen relative pb-24">
        <SpaceBackground customClass="" />
        <div className="relative">
          <m.div style={{ y }} className="relative z-10 pt-20">
            <NFTHeroSection />
            <NFTExplainerSection />
            <NFTCallToAction onOpenModal={() => setIsModalOpen(true)} />
          </m.div>
        </div>
        {isModalOpen && (
          <WhitelistModal onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </AnimationProvider>
  );
};

export default NFTHome;
