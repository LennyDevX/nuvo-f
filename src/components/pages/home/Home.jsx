import React, { Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from '../home/HeroSection';

// Lazy load components below the fold
const Features = lazy(() => import('../home/Features'));
const AnnouncementModal = lazy(() => import('../../modals/AnnouncementModal'));

const Home = () => {
  return (
    <div className="bg-nuvo-gradient">
      <HeroSection />
      <Suspense fallback={<div>Loading...</div>}>
        <Features />
        <AnnouncementModal />
      </Suspense>
    </div>
  );
};

export default Home;