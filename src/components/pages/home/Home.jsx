import React, { Suspense, lazy, useState } from 'react';
import AnimationProvider from '../../animation/AnimationProvider';
import HeroSection from '../home/HeroSection';
import SpaceBackground from '../../effects/SpaceBackground';

// Lazy load components below the fold
const Features = lazy(() => import('./Features'));
const SwapInfo = lazy(() => import('./SwapInfo'));
const AirdropInfo = lazy(() => import('./AirdropInfo'));
const RewardDeveloper = lazy(() => import('./NftInfo'));
const AnnouncementModal = lazy(() => import('../../modals/AnnouncementModal'));
const TokenomicsSystem = lazy(() => import('./TokenomicsSystem'));
const Header = lazy(() => import('./Header'));

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AnimationProvider>
      <div className="relative bg-nuvo-gradient min-h-screen">
        {/* Space Background restaurado */}
        <SpaceBackground customClass="opacity-90" />
        
        {/* Contenido con z-index para verse sobre el fondo */}
        <div className="relative z-10">
          <Header openUpdatesModal={openModal} />
          <HeroSection />
          <Suspense fallback={<div>Loading...</div>}>
            <TokenomicsSystem />
            <SwapInfo />
            <RewardDeveloper />
            <AirdropInfo />
            <Features />
            <AnnouncementModal isOpen={isModalOpen} closeModal={closeModal} />
          </Suspense> 
        </div>
      </div>
    </AnimationProvider>
  );
};

export default Home;