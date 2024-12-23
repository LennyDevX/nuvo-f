import React, { Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from '../home/HeroSection';

// Lazy load components below the fold
const StakingCalculator = lazy(() => import('../../../utils/StakingCalculator'));
const Features = lazy(() => import('../home/Features'));
const AnnouncementModal = lazy(() => import('../../modal/AnnouncementModal'));

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <HeroSection />
      <Suspense fallback={<div>Loading...</div>}>
        <StakingCalculator />
        <Features />
        <AnnouncementModal />
      </Suspense>
    </div>
  );
};

export default Home;