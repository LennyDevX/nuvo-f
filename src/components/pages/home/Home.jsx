import React, { Suspense, lazy, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from '../home/HeroSection';

// Lazy load components below the fold
const Features = lazy(() => import('./Features'));
const SwapInfo = lazy(() => import('./SwapInfo'));
const AirdropInfo = lazy(() => import('./AirdropInfo'));
const RewardDeveloper = lazy(() => import('./RewardDeveloper'));
const AnnouncementModal = lazy(() => import('../../modals/AnnouncementModal'));
const TokenomicsSystem = lazy(() => import('./TokenomicsSystem'));
const Header = lazy(() => import('./Header'));

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-nuvo-gradient">
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
  );
};

export default Home;