import React, { useEffect, Suspense } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import lazyWithPreload from '../../../utils/performance/lazyWithPreload';
import Footer from '../../layout/Footer';
import AnimationProvider, { useAnimationConfig } from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground';
import { isMobileDevice } from '../../../utils/mobile/MobileUtils';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';

// Lazy load sections
const HeroSection = lazyWithPreload(() => import('./HeroSection'));
const MissionSection = lazyWithPreload(() => import('./MissionSection'));
const StakingSection = lazyWithPreload(() => import('./StakingSection'));
const TechnologySection = lazyWithPreload(() => import('./TechnologySection'));
const AirdropSection = lazyWithPreload(() => import('./AirdropSection'));
const CTASection = lazyWithPreload(() => import('./CTASection'));

// Loading placeholder
const SectionPlaceholder = () => (
  <div className="py-24 px-4 bg-gradient-to-b from-transparent to-purple-900/10 animate-pulse">
    <div className="max-w-4xl mx-auto">
      <div className="h-12 bg-purple-800/20 rounded-lg mb-6 w-3/4"></div>
      <div className="h-6 bg-purple-800/20 rounded mb-4 w-full"></div>
      <div className="h-6 bg-purple-800/20 rounded mb-4 w-5/6"></div>
      <div className="h-6 bg-purple-800/20 rounded mb-4 w-4/5"></div>
    </div>
  </div>
);

// Preload next sections when the previous one becomes visible
const LazySection = ({ component: Component, onVisible, ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (isVisible && onVisible) {
      onVisible();
    }
  }, [isVisible, onVisible]);

  return (
    <div ref={ref}>
      <Suspense fallback={<SectionPlaceholder />}>
        <Component {...props} />
      </Suspense>
    </div>
  );
};

const About = () => {
  const { scrollYProgress } = useScroll();
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const isMobile = isMobileDevice();
  
  // Disable parallax effects if reduced motion is preferred or on low-performance devices
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    // Disable parallax if reduced motion is enabled or on low-performance devices
    shouldReduceMotion || isLowPerformance ? [0, 0] : [0, -50]
  );
  
  useEffect(() => {
    // Preload the first two sections immediately
    HeroSection.preload();
    MissionSection.preload();
    
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <AnimationProvider>
      <div className="bg-nuvo-gradient min-h-screen relative">
        <SpaceBackground customClass="" />
        
        <div className="relative">
          <m.div 
            style={{ y: shouldReduceMotion ? 0 : y }} 
            className="relative z-10"
          >
            <LazySection 
              component={HeroSection} 
              onVisible={() => TechnologySection.preload()} 
            />
            <LazySection 
              component={MissionSection} 
              onVisible={() => AirdropSection.preload()} 
            />
            <LazySection 
              component={TechnologySection} 
              onVisible={() => StakingSection.preload()} 
            />
            <LazySection 
              component={AirdropSection} 
              onVisible={() => CTASection.preload()} 
            />
            <LazySection 
              component={StakingSection} 
            />
            <LazySection 
              component={CTASection} 
            />
          </m.div>
          <Footer />
        </div>
      </div>
    </AnimationProvider>
  );
};

export default About;