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

// Enhanced loading placeholder with better mobile sizing
const SectionPlaceholder = () => (
  <div className="py-12 md:py-16 lg:py-24 px-4 bg-gradient-to-b from-transparent to-purple-900/10 animate-pulse">
    <div className="max-w-6xl mx-auto">
      <div className="h-8 md:h-10 lg:h-12 bg-purple-800/20 rounded-lg mb-4 md:mb-6 w-3/4 mx-auto"></div>
      <div className="space-y-3 max-w-2xl mx-auto">
        <div className="h-4 md:h-5 bg-purple-800/20 rounded w-full"></div>
        <div className="h-4 md:h-5 bg-purple-800/20 rounded w-5/6"></div>
        <div className="h-4 md:h-5 bg-purple-800/20 rounded w-4/5"></div>
      </div>
    </div>
  </div>
);

// Mobile-optimized section wrapper with better spacing
const LazySection = ({ component: Component, onVisible, className = "", ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (isVisible && onVisible) {
      onVisible();
    }
  }, [isVisible, onVisible]);

  return (
    <div ref={ref} className={`${className}`}>
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
  
  // Reduced parallax effect for better mobile performance
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    shouldReduceMotion || isLowPerformance || isMobile ? [0, 0] : [0, -30]
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
      <div className="bg-nuvo-gradient min-h-screen relative overflow-x-hidden">
        <SpaceBackground customClass="" />
        
        <div className="relative">
          <m.div 
            style={{ y: shouldReduceMotion ? 0 : y }} 
            className="relative z-10"
          >
            {/* Hero - Optimized heights */}
            <LazySection 
              component={HeroSection} 
              onVisible={() => TechnologySection.preload()}
              className="min-h-screen"
            />
            
            {/* Mission - Compact spacing */}
            <LazySection 
              component={MissionSection} 
              onVisible={() => AirdropSection.preload()}
              className="py-6 md:py-10 lg:py-12"
            />
            
            {/* Technology - Mobile optimized */}
            <LazySection 
              component={TechnologySection} 
              onVisible={() => StakingSection.preload()}
              className="py-6 md:py-10 lg:py-12"
            />
            
            {/* Airdrop - Priority section */}
            <LazySection 
              component={AirdropSection} 
              onVisible={() => CTASection.preload()}
              className="py-6 md:py-10 lg:py-12"
            />
            
            {/* CTA - Compact and prominent */}
            <LazySection 
              component={CTASection}
              className="py-6 md:py-10 lg:py-12"
            />
            
            {/* Staking - End section */}
            <LazySection 
              component={StakingSection}
              className="py-6 md:py-10 lg:py-12"
            />
          </m.div>
          
          {/* Footer */}
          <div className="mt-6 md:mt-8">
            <Footer />
          </div>
        </div>
      </div>
    </AnimationProvider>
  );
};

export default About;