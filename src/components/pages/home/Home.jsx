import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import AnimationProvider from '../../animation/AnimationProvider';
import HeroSection from './SmartStaking';
import SpaceBackground from '../../effects/SpaceBackground';
import LoadingFallback from '../../ui/LoadingFallback';
import lazyWithPreload from '../../../utils/lazyWithPreload';

// Lazy load components below the fold with preload capability
const Features = lazyWithPreload(() => import('./Features'));
const SwapInfo = lazyWithPreload(() => import('./SwapInfo'));
const AirdropInfo = lazyWithPreload(() => import('./AirdropInfo'));
const RewardDeveloper = lazyWithPreload(() => import('./NftInfo'));
const AnnouncementModal = lazyWithPreload(() => import('../../modals/AnnouncementModal'));
const TokenomicsSystem = lazyWithPreload(() => import('./TokenomicsSystem'));
const Header = lazyWithPreload(() => import('./Header'));

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Mark as loaded after initial render
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    // Preload some components after initial render
    setTimeout(() => {
      Header.preload();
      Features.preload();
    }, 1000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);
  
  // Memoize callback functions to prevent recreating them on each render
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Memoize the decision for when to load components
  const shouldLoadComponents = useMemo(() => {
    return !isMobile || isLoaded;
  }, [isMobile, isLoaded]);

  // Memoize the decision for loading intersection observer dependent components
  const shouldLoadIntersectionObserverComponents = useMemo(() => {
    return !isMobile || typeof IntersectionObserver !== 'undefined';
  }, [isMobile]);

  return (
    <AnimationProvider reducedMotion={isMobile}>
      <div className="relative bg-nuvo-gradient min-h-screen">
        {/* Conditionally render the space background with different opacity */}
        <SpaceBackground customClass={isMobile ? "opacity-70" : "opacity-90"} />
        
        {/* Content with z-index */}
        <div className="relative z-10">
          <Suspense fallback={<div className="h-20"></div>}>
            <Header openUpdatesModal={openModal} />
          </Suspense>
          
          <HeroSection />
          
          <Suspense fallback={<LoadingFallback height="200px" />}>
            {/* On mobile, only load components when initial render is complete */}
            {shouldLoadComponents && (
              <>
                <TokenomicsSystem />
                <SwapInfo />
                {/* More aggressive lazy loading on mobile */}
                {shouldLoadIntersectionObserverComponents && (
                  <>
                    <RewardDeveloper />
                    <AirdropInfo />
                    <Features />
                  </>
                )}
                <AnnouncementModal isOpen={isModalOpen} closeModal={closeModal} />
              </>
            )}
          </Suspense>
        </div>
      </div>
    </AnimationProvider>
  );
};

export default Home;