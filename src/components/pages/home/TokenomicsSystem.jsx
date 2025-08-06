import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../image/OptimizedImage';

const TokenomicsSystem = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize animation condition to prevent recalculation
  const useSimpleAnimation = useMemo(() => 
    prefersReducedMotion || isMobile, 
    [prefersReducedMotion, isMobile]
  );

  // Memoize token data to prevent recreation on each render
 

  // Memoize navigation handler
  const handleExploreTokenomics = useCallback(() => {
    navigate('/tokenomics');
  }, [navigate]);

  // Memoize animation properties based on device capability
  const tokenAnimationProps = useMemo(() => ({
    initial: { opacity: 0, x: useSimpleAnimation ? 0 : 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: useSimpleAnimation ? 0.3 : 0.6 }
  }), [useSimpleAnimation]);

  // Memoize floating animation properties
  const floatingAnimationProps = useMemo(() => {
    if (useSimpleAnimation) {
      return {
        animate: { scale: [0.98, 1.02, 0.98] },
        transition: { 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      };
    } else {
      return {
        animate: {
          y: [0, -10, 0],
          scale: [0.98, 1.02, 0.98],
          rotate: [-1, 1, -1]
        },
        transition: { 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }
      };
    }
  }, [useSimpleAnimation]);

  return (
    <section className="py-8 md:py-16 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title for mobile that appears above the grid */}
        <div className="block md:hidden mb-4 text-center">
          <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
            <span className="block">Revolutionary</span>
            <span className="gradient-text text-transparent bg-clip-text bg-nuvo-gradient-text">Tokenomics</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:gap-12 items-center">
          {/* Left Content - Optimized for mobile */}
          <motion.div
            initial={tokenAnimationProps.initial}
            animate={tokenAnimationProps.animate}
            transition={tokenAnimationProps.transition}
            className="col-span-1"
          >
            {/* Title only visible on larger screens */}
            <div className="hidden md:block">
              <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
                <span className="block mb-2">Revolutionary</span>
                <span className="gradient-text block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">Tokenomics Ecosystem</span>
                <span className="block">Built For The Future</span>
              </h2>
            </div>
            
            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-200 max-w-xl mt-2 md:mt-6">
              Our innovative token distribution creates long-term value with community governance and sustainable growth. 💰
            </p>
            <button
              onClick={handleExploreTokenomics}
              className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg mt-4 md:mt-8"
            >
              Explore Tokenomics
            </button>
          </motion.div>

          {/* Right Content - Image optimized for mobile and desktop */}
          <motion.div
            initial={tokenAnimationProps.initial}
            animate={tokenAnimationProps.animate}
            transition={tokenAnimationProps.transition}
            className="flex justify-center items-center relative col-span-1"
          >
            <div className="relative w-[120px] h-[120px] xs:w-[150px] xs:h-[150px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] lg:w-[280px] lg:h-[280px]">
              {!useSimpleAnimation && (
                <motion.div 
                  className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl"
                  animate={{ 
                    opacity: [0.2, 0.4, 0.2],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              <motion.div
                className="w-full h-full relative"
                animate={floatingAnimationProps.animate}
                transition={floatingAnimationProps.transition}
                style={{ 
                  willChange: "transform", 
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden"
                }}
              >
                <OptimizedImage
                  src="/NuvosToken2.png"
                  alt="Nuvos Token"
                  priority={false}
                  quality={85}
                  className="w-full h-full"
                  style={{
                    filter: useSimpleAnimation 
                      ? 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' 
                      : 'drop-shadow(0 0 15px rgba(139,92,246,0.5))',
                    objectFit: 'contain'
                  }}
                  placeholderColor="transparent"
                  loadingStrategy="lazy"
                />
              </motion.div>
              
              {/* Only show particles on larger screens */}
              {!useSimpleAnimation && window.innerWidth > 768 && (
                <>
                  <motion.div 
                    className="absolute w-4 h-4 rounded-full bg-purple-500/40 blur-sm"
                    animate={{
                      x: [0, 30, -30, 0],
                      y: [0, -30, 30, 0],
                      opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ top: '20%', left: '20%', willChange: "transform, opacity" }}
                  />
                  <motion.div 
                    className="absolute w-3 h-3 rounded-full bg-indigo-500/40 blur-sm"
                    animate={{
                      x: [0, -25, 25, 0],
                      y: [0, 25, -25, 0],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    style={{ bottom: '20%', right: '20%', willChange: "transform, opacity" }}
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSystem;
