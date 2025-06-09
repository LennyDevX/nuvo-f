import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m, useReducedMotion } from 'framer-motion';
import { FaShieldAlt, FaChartLine, FaCloud } from 'react-icons/fa';
import StakingCalculator from '../../layout/StakingCalculator';
import { useAnimationContext } from '../../animation/AnimationProvider';
import { fadeIn, buttonVariants } from '../../../utils/animations/animationVariants';

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const { reducedMotion, enableAnimations } = useAnimationContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setIsMounted(true);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Don't animate at all for mobile or reduced motion
  const shouldAnimate = isMounted && enableAnimations && !prefersReducedMotion && !reducedMotion && !isMobile;

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-24
      md:pt-24 md:pb-8
      ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
        {/* Left Column - Calculator */}
        <div className="relative mt-8 lg:mt-0 order-2 lg:order-1">
          <div className="relative max-w-md mx-auto">
            {/* Omit decorative blurs on mobile */}
            {!isMobile && (
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl" />
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl" />
              </div>
            )}
            
            {/* Staking Calculator Integration */}
            <div className="relative">
              <StakingCalculator mobileOptimized={isMobile} />
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-6 order-1 lg:order-2">
          <m.div
            initial={shouldAnimate ? "hidden" : { opacity: 1 }}
            animate="visible"
            variants={fadeIn}
            className="space-y-4"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-[1.2] sm:leading-tight tracking-tight">
              <span className="block mb-2">Elevate Your</span>
              <span className="gradient-text block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">Investment Strategy</span>
              <span className="block">Through Smart Staking</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-gray-200 max-w-xl mt-4 md:mt-6">
              Experience a revolutionary staking protocol combining automated yield optimization 
              with institutional-grade security.
            </p>
          </m.div>

          {/* The stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 mt-8">
            {[
              { value: "125%", label: "APY", icon: <FaChartLine /> },
              { value: "100%", label: "Transparent", icon: <FaShieldAlt /> },
              { value: "Token ERC20", label: "Powered By Polygon Network", icon: <FaCloud /> }
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center sm:flex-col sm:items-center p-4 bg-black/20 rounded-xl border border-purple-500/20 gap-3 sm:gap-2"
              >
                <div className="text-purple-400 text-2xl sm:text-xl sm:mb-2">{stat.icon}</div>
                <div className="flex flex-col flex-1 sm:flex-none sm:text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-purple-300 sm:mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons - Updated with custom CSS classes */}
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-6 sm:mt-10">
            <Link
              to="/staking"
              className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg text-center"
            >
              Start Staking
            </Link>
            <Link
              to="/about"
              className="btn-nuvo-base btn-nuvo-outline btn-nuvo-lg text-center text-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;