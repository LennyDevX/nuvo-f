import React, { Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from '../home/HeroSection';

// Lazy load components below the fold
const Features = lazy(() => import('./Features'));
const SwapInfo = lazy(() => import('./SwapInfo'));
const AirdropInfo = lazy(() => import('./AirdropInfo'));
const RewardDeveloper = lazy(() => import('./RewardDeveloper'));
const AnnouncementModal = lazy(() => import('../../modals/AnnouncementModal'));
const TokenomicsSystem = lazy(() => import('./TokenomicsSystem'));

const Home = () => {
  return (
    <div className="bg-nuvo-gradient">
      <HeroSection />
      <Suspense fallback={<div>Loading...</div>}>
        <TokenomicsSystem />
        <SwapInfo />
        <RewardDeveloper />
        <AirdropInfo />
        <Features />
        <AnnouncementModal />
      </Suspense> 
    </div>
  );
};

export default Home;