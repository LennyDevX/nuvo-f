import React, { useMemo } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { FaImage, FaLock, FaExchangeAlt, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TokenizationSection = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Memoize the motion status check
  const useSimpleAnimation = useMemo(() => 
    prefersReducedMotion, 
    [prefersReducedMotion]
  );

  // Floating animation properties for the image
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
          y: [0, -15, 0],
          scale: [0.98, 1.02, 0.98],
          rotate: [-2, 2, -2]
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

  // Benefits of tokenization
  const tokenizationBenefits = [
    { icon: <FaImage />, text: "Transform any image into a verifiable digital asset" },
    { icon: <FaLock />, text: "Secure ownership with immutable blockchain records" },
    { icon: <FaExchangeAlt />, text: "Trade and transfer your NFTs in our marketplace" },
    { icon: <FaMoneyBillWave />, text: "Unlock new value from your digital creations" }
  ];

  const handleExploreTokenization = () => {
    navigate('/tokenize');
  };

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Title for mobile that appears above the grid */}
        <div className="block md:hidden mb-6 text-center">
          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
            <span className="block">Transform Images</span>
            <span className="gradient-text text-transparent bg-clip-text bg-nuvo-gradient-text">Into Unique NFTs</span>
          </h2>
        </div>
        
        {/* Modified grid to be 2 columns on all screen sizes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-12 items-center">
          {/* Left Content - Animated Image - Smaller on mobile and desktop */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center items-center relative col-span-1"
          >
            <div className="relative w-[120px] h-[120px] xs:w-[150px] xs:h-[150px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px]">
              {!useSimpleAnimation && (
                <m.div 
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
              
              <m.div
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
                  src="/GiftBoxNFT.webp" 
                  alt="NFT Gift Box" 
                  className="w-full h-full object-contain"
                  style={{
                    filter: useSimpleAnimation 
                      ? 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' 
                      : 'drop-shadow(0 0 15px rgba(139,92,246,0.5))'
                  }}
                />
              </m.div>
              
              {/* Only show particles on larger screens */}
              {!useSimpleAnimation && window.innerWidth > 768 && (
                <>
                  <m.div 
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
                  <m.div 
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
          </m.div>
          
          {/* Right Content - Text */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="col-span-1"
          >
            {/* Title only visible on non-mobile screens */}
            <div className="hidden md:block">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
                <span className="block mb-2">Transform Images</span>
                <span className="gradient-text block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">Into Unique NFTs</span>
                <span className="block">Own Your Digital Assets</span>
              </h2>
            </div>
            
            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-300 max-w-xl mt-2 md:mt-6 mb-3 md:mb-8">
              Tokenization converts assets into blockchain tokens, giving you verifiable ownership of your digital creations. 🖼️✨
            </p>
            
            {/* Benefits optimized for mobile */}
            <div className="space-y-1 md:space-y-4 mb-4 md:mb-8">
              {tokenizationBenefits.map((benefit, index) => (
                <m.div 
                  key={index}
                  className="flex items-center gap-2 md:gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="text-purple-400 text-xs md:text-base">{benefit.icon}</div>
                  <p className="text-gray-300 text-xs xs:text-sm md:text-base">{benefit.text}</p>
                </m.div>
              ))}
            </div>
            
            <m.button
              onClick={handleExploreTokenization}
              className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Tokenizing Now
            </m.button>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default TokenizationSection;
