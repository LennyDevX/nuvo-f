import React, { Suspense } from 'react';
import SpaceBackground from '../../effects/SpaceBackground';
import AnimationProvider from '../../animation/AnimationProvider';
import lazyWithPreload from '../../../utils/performance/lazyWithPreload';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';

// Lazy load all components
const HeroSection = lazyWithPreload(() => import('./HeroSection'));
const FeatureCards = lazyWithPreload(() => import('./FeatureCards'));
const ProductTabs = lazyWithPreload(() => import('./ProductTabs'));
const CallToAction = lazyWithPreload(() => import('./CallToAction'));

// Placeholders para mostrar mientras se cargan los componentes
const SectionPlaceholder = ({ height = '300px' }) => (
  <div
    className="w-full animate-pulse rounded-xl my-8 bg-purple-900/20 border border-purple-500/10"
    style={{ height }}
  />
);

// Componente que carga de manera diferida basado en visibilidad
const LazySection = ({ component: Component, height = '300px', onVisible, ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Precargar el componente cuando sea visible
  React.useEffect(() => {
    if (isVisible && onVisible) {
      onVisible();
    }
  }, [isVisible, onVisible]);

  return (
    <div ref={ref} className="w-full">
      {isVisible ? (
        <Suspense fallback={<SectionPlaceholder height={height} />}>
          <Component {...props} />
        </Suspense>
      ) : (
        <SectionPlaceholder height={height} />
      )}
    </div>
  );
};

const AIHub = () => {
  // Precargar el primer componente inmediatamente
  React.useEffect(() => {
    HeroSection.preload();
  }, []);

  return (
    <AnimationProvider>
      <div className="relative bg-nuvo-gradient min-h-screen pt-28 pb-16 flex flex-col items-center">
        <SpaceBackground customClass="" />
        <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
          {/* HeroSection se carga inmediatamente */}
          <LazySection
            component={HeroSection}
            height="400px"
            onVisible={() => FeatureCards.preload()}
          />

          <LazySection
            component={FeatureCards}
            height="350px"
            onVisible={() => ProductTabs.preload()}
          />

          <LazySection
            component={ProductTabs}
            height="600px"
            onVisible={() => CallToAction.preload()}
          />

          <LazySection component={CallToAction} height="250px" />
        </div>
      </div>
    </AnimationProvider>
  );
};

export default AIHub;
