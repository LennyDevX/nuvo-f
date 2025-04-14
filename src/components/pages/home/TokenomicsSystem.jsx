import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={tokenAnimationProps.initial}
            animate={tokenAnimationProps.animate}
            transition={tokenAnimationProps.transition}
          >
            <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              <span className="block mb-2">Revolutionary</span>
              <span className="gradient-text block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">Tokenomics Ecosystem</span>
              <span className="block">Built For The Future</span>
            </h2>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl mt-6">
              Our innovative token distribution creates long-term value with a focus on community governance and sustainable growth. 
              Experience the perfect balance of staking rewards, liquidity incentives, and ecosystem development. ✨💰
            </p>
            
            
            <button
              onClick={handleExploreTokenomics}
              className="px-6 py-4 mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-lg"
            >
              Explore Full Tokenomics
            </button>
          </motion.div>

          {/* Right Content - Updated with subtle, mobile-friendly animation */}
          <motion.div
            initial={tokenAnimationProps.initial}
            animate={tokenAnimationProps.animate}
            transition={tokenAnimationProps.transition}
            className="flex justify-center items-center relative"
          >
            <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
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
                <img 
                  src="/NuvosToken.png" 
                  alt="Nuvos Token" 
                  className="w-full h-full object-contain"
                  style={{
                    filter: useSimpleAnimation 
                      ? 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' 
                      : 'drop-shadow(0 0 15px rgba(139,92,246,0.5))'
                  }}
                />
              </motion.div>
              
              {!useSimpleAnimation && (
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
