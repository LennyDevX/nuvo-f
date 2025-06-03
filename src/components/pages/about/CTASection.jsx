import React from 'react';
import { m } from 'framer-motion';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';

const CTASection = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  // Determine if animations should be disabled
  const disableAnimations = shouldReduceMotion || isLowPerformance;
  
  // Simplified animations for better mobile performance
  const containerAnimation = disableAnimations 
    ? { opacity: 1 }
    : { 
        opacity: [0.8, 1, 0.8],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      };

  const buttonHover = disableAnimations 
    ? {}
    : { 
        scale: 1.02, 
        boxShadow: "0 8px 25px rgba(168, 85, 247, 0.3)",
        transition: { type: "spring", stiffness: 400, damping: 10 }
      };

  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4 overflow-hidden">
      {/* Simplified background with better mobile performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
      
      {/* Mobile-optimized animated accent */}
      <m.div
        className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent"
        animate={containerAnimation}
      ></m.div>

      {/* Compact mobile-first layout */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Content Section - Mobile First */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <m.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.6 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Ready to Tokenize?
              </span>
            </m.h2>
            
            <m.p 
              className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 15 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Transform your assets into digital opportunities. Join our platform today.
            </m.p>
            
            {/* Action Buttons - Stacked on mobile, inline on desktop */}
            <m.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 15 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <m.a
                href="/tokenize"
                className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base md:text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                whileHover={buttonHover}
                whileTap={disableAnimations ? {} : { scale: 0.98 }}
              >
                Start Tokenizing
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </m.a>
              
              <m.a
                href="/nfts"
                className="inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 border-2 border-purple-500/50 text-purple-300 text-base md:text-lg font-medium rounded-xl hover:border-purple-400 hover:text-purple-200 transition-all"
                whileHover={disableAnimations ? {} : { borderColor: "rgba(168, 85, 247, 0.8)" }}
              >
                Learn More
              </m.a>
            </m.div>
          </div>

          {/* Visual Element - Compact for mobile */}
          <div className="order-1 lg:order-2">
            <m.div 
              className="relative mx-auto w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
              whileInView={disableAnimations ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: disableAnimations ? 0 : 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {/* Glowing orb effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-2xl"></div>
              
              {/* Center icon/graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
            </m.div>
          </div>
        </div>

        {/* Quick Stats/Features - Mobile optimized */}
        <m.div 
          className="mt-12 lg:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            { number: "24/7", label: "Support" },
            { number: "0%", label: "Setup Fee" },
            { number: "99.9%", label: "Uptime" },
            { number: "Instant", label: "Transfer" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-purple-900/20 rounded-xl backdrop-blur-sm border border-purple-500/20">
              <div className="text-xl md:text-2xl font-bold text-purple-300 mb-1">{stat.number}</div>
              <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default memoWithName(CTASection);
