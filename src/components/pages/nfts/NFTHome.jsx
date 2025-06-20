import React, { useState, lazy, Suspense } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import NFTHeroSection from './NFTHeroSection';
import LoadingSpinner from '../../ui/LoadingSpinner';
// Lazy load components that aren't immediately visible
const NFTExplainerSection = lazy(() => import('./NFTExplainerSection'));
const NFTCallToAction = lazy(() => import('./NFTCallToAction'));
import AnimationProvider from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground';
// Lazy load modal since it's conditionally rendered

// Loading fallback component
const LoadingFallback = () => (
  <div className="p-4 text-center flex justify-center">
    <LoadingSpinner 
      size="medium" 
      variant="gradient"
      text="Loading..."
      className="text-purple-400"
    />
  </div>
);

const NFTHome = () => {
  const { scrollY } = useScroll();
  // Optimize transform calculation with better performance bounds
  const y = useTransform(scrollY, [0, 1000], [0, 200], { clamp: true });
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AnimationProvider>
      <div className="bg-nuvo-gradient min-h-screen relative pb-24">
        <SpaceBackground customClass="" />
        <div className="relative">
          <m.div style={{ y }} className="relative z-10 pt-20">
            <NFTHeroSection />
            <Suspense fallback={<LoadingFallback />}>
              <NFTExplainerSection />
              <NFTCallToAction onOpenModal={() => setIsModalOpen(true)} />
            </Suspense>
          </m.div>
        </div>
        
        
      </div>
    </AnimationProvider>
  );
};

export default React.memo(NFTHome);
