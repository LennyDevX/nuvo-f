import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import AnimationProvider from '../../animation/AnimationProvider';
import HeroSection from './SmartStaking';
import SpaceBackground from '../../effects/SpaceBackground';
import LoadingSpinner from '../../ui/LoadingSpinner';
import lazyWithPreload from '../../../utils/performance/lazyWithPreload';

// Load the Header first and NOT lazily
import Header from './Header';

// Lazy load components below the fold with preload capability
const Features = lazyWithPreload(() => import('./Features'));
const WhitelistToken = lazyWithPreload(() => import('./WhitelistToken'));
const RewardDeveloper = lazyWithPreload(() => import('./NftInfo'));
const AnnouncementModal = lazyWithPreload(() => import('../../modals/AnnouncementModal'));
const TokenomicsSystem = lazyWithPreload(() => import('./TokenomicsSystem'));
const TokenizationSection = lazyWithPreload(() => import('./TokenizationSection'));
const NuvosAI = lazyWithPreload(() => import('./NuvosAI'));

// Crear un hook personalizado para detección de dispositivos móviles
import { useDeviceDetection } from '../../../hooks/mobile/useDeviceDetection';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Reemplazar detección de móviles con hook compartido
  const { isMobile, isTablet } = useDeviceDetection();
  const [isLoaded, setIsLoaded] = useState(false);
  const [headerLoaded, setHeaderLoaded] = useState(false);
  
  useEffect(() => {
    // Eliminar la detección redundante de móviles
    
    // Optimizar los timers usando un solo efecto con cleanup
    const timers = [];
    
    // Usar requestIdleCallback si está disponible para cargas no críticas
    const initialLoadTimer = setTimeout(() => {
      setHeaderLoaded(true);
      setIsLoaded(true);
    }, 100);
    timers.push(initialLoadTimer);
    
    // Priorizar la carga de modal
    const modalTimer = setTimeout(() => {
      setIsModalOpen(true);
    }, 800);
    timers.push(modalTimer);
    
    // Usar requestIdleCallback para precargar componentes no críticos
    const preloadTimer = window.requestIdleCallback 
      ? window.requestIdleCallback(() => Features.preload())
      : setTimeout(() => Features.preload(), 1000);
    
    // Precargar otros componentes críticos en segundo plano
    if (!isMobile) {
      setTimeout(() => {
        TokenomicsSystem.preload();
        RewardDeveloper.preload();
      }, 1500);
    }
    
    return () => {
      timers.forEach(clearTimeout);
      if (window.requestIdleCallback && preloadTimer) {
        window.cancelIdleCallback(preloadTimer);
      } else {
        clearTimeout(preloadTimer);
      }
    };
  }, [isMobile]);
  
  // Memoize callback functions to prevent recreating them on each render
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Optimizar decisión de carga con un solo useMemo
  const loadingStrategy = useMemo(() => ({
    shouldLoadComponents: !isMobile || isLoaded,
    shouldLoadIntersectionObserverComponents: !isMobile || (typeof IntersectionObserver !== 'undefined' && isLoaded),
  }), [isMobile, isLoaded]);

  return (
    <AnimationProvider reducedMotion={isMobile}>
      <div className="relative bg-nuvo-gradient min-h-screen">
        {/* Simple background without animation */}
        <SpaceBackground customClass="" />
        
        {/* Always render Header immediately */}
        <Header openUpdatesModal={openModal} />
        
        {/* Only render content when header has loaded */}
        {headerLoaded && (
          <div className="relative z-10 overflow-x-hidden">
            <HeroSection />
            
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <LoadingSpinner 
                  size="medium" 
                  variant="ripple"
                  text="Loading..."
                  className="text-purple-400"
                />
              </div>
            }>
              {loadingStrategy.shouldLoadComponents && (
                <>
                  <TokenomicsSystem />
                  {/* Usar intersection observer para carga progresiva */}
                  {loadingStrategy.shouldLoadIntersectionObserverComponents && (
                    <LazyComponentLoader>
                      <RewardDeveloper />
                      <TokenizationSection />
                      <Features showSkeletonIfLoading={false} />
                      <NuvosAI showSkeletonIfLoading={false} />

                      <WhitelistToken showSkeletonIfLoading={false} />

                    </LazyComponentLoader>
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

// Componente auxiliar para cargar progresivamente con IntersectionObserver
const LazyComponentLoader = ({ children }) => {
  // Implementación de carga basada en visibilidad
  return <>{children}</>;
};

export default Home;