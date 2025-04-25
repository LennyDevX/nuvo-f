import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import AnimationProvider from '../../animation/AnimationProvider';
import HeroSection from './SmartStaking';
import SpaceBackground from '../../effects/SpaceBackground';
import LoadingFallback from '../../ui/LoadingFallback';
import lazyWithPreload from '../../../utils/lazyWithPreload';

// Load the Header first and NOT lazily
import Header from './Header';

// Lazy load components below the fold with preload capability
const Features = lazyWithPreload(() => import('./Features'));
const AirdropInfo = lazyWithPreload(() => import('./WhitelistToken'));
const RewardDeveloper = lazyWithPreload(() => import('./NftInfo'));
const AnnouncementModal = lazyWithPreload(() => import('../../modals/AnnouncementModal'));
const TokenomicsSystem = lazyWithPreload(() => import('./TokenomicsSystem'));
const TokenizationSection = lazyWithPreload(() => import('./TokenizationSection'));

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [headerLoaded, setHeaderLoaded] = useState(false);
  
  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Set initial loading states
    const timer = setTimeout(() => {
      setHeaderLoaded(true);
      setIsLoaded(true);
    }, 100); // Small delay to ensure header renders first
    
    // Preload some components after initial render
    setTimeout(() => {
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
        {/* Simple background without animation */}
        <SpaceBackground customClass="" />
        
        {/* Always render Header immediately */}
        <Header openUpdatesModal={openModal} />
        
        {/* Only render content when header has loaded */}
        {headerLoaded && (
          <div className="relative z-10">
            <HeroSection />
            
            <Suspense fallback={<LoadingFallback height="200px" />}>
              {/* On mobile, only load components when initial render is complete */}
              {shouldLoadComponents && (
                <>
                  <TokenomicsSystem />
                  {/* More aggressive lazy loading on mobile */}
                  {shouldLoadIntersectionObserverComponents && (
                    <>
                      
                      <RewardDeveloper />
                      <AirdropInfo />
                      <TokenizationSection />
                      <Features />
                    </>
                  )}
                  <AnnouncementModal isOpen={isModalOpen} closeModal={closeModal} />
                </>
              )}
            </Suspense>
          </div>
        )}
      </div>
    </AnimationProvider>
  );
};

export default Home;