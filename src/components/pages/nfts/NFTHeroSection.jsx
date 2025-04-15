import React, { useMemo, useCallback } from 'react';
import { m } from 'framer-motion';
import NFTFeatures from './NFTFeatures';

const NFTHeroSection = () => {
  // Letra por letra animation - memoized for performance
  const letterVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.3, 
        delay: i * 0.03,
        ease: "easeOut"
      }
    })
  }), []);

  // Utility function to split text into letters with proper indexing
  const AnimatedLetters = useCallback(({ text, className, startIndex = 0 }) => {
    return (
      <span className={className}>
        {text.split('').map((letter, i) => (
          <m.span
            key={`${text}-${i}`}
            custom={startIndex + i}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            className="inline-block"
            style={{ 
              marginRight: letter === ' ' ? '0.25em' : '-0.02em',
              display: 'inline-block'
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </m.span>
        ))}
      </span>
    );
  }, [letterVariants]);

  // Floating animation for the bot image
  const floatingAnimation = useMemo(() => ({
    y: [0, -15, 0],
    rotate: [0, 2, 0, -2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }), []);

  // Shadow pulse animation - memoized for performance
  const shadowPulse = useMemo(() => ({
    filter: [
      "drop-shadow(0 10px 15px rgba(139, 92, 246, 0.3))",
      "drop-shadow(0 20px 25px rgba(139, 92, 246, 0.5))",
      "drop-shadow(0 10px 15px rgba(139, 92, 246, 0.3))"
    ],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.5, 1]
    }
  }), []);

  return (
    <section className="relative p-4 overflow-hidden">
      <m.div 
        className="max-w-7xl mx-auto z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Better grid layout that adapts to all screen sizes */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center mb-8 md:mb-16">
          {/* Mobile layout uses a separate nested grid for side-by-side content */}
          <div className="grid grid-cols-5 gap-2 md:hidden items-center">
            {/* Image - 40% width on mobile */}
            <m.div 
              className="col-span-2 flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <m.div className="relative" initial={{ y: 0 }} animate={floatingAnimation}>
                <m.img
                  src="/NFT-X1.webp"
                  alt="Nuvos Bot"
                  className="max-w-full h-auto rounded-xl max-h-[180px]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  style={{ willChange: "filter" }}
                />
                
                {/* Shadow effect and background remain the same */}
                <m.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={shadowPulse}
                  style={{ zIndex: -1 }}
                />
                <m.div
                  className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-blue-500/10 rounded-3xl -z-10"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </m.div>
            </m.div>
            
            {/* Text section - 60% width on mobile */}
            <div className="col-span-3 text-left">
              <div className="relative mb-2">
                <m.div 
                  className="absolute inset-0 w-full h-full bg-black/30 rounded-3xl blur-xl -z-10"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                ></m.div>
                
                <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">
                  <AnimatedLetters text="NUVOS NFT" className="inline-block" startIndex={0} />
                  <br />
                  <AnimatedLetters text="Collection" className="inline-block" startIndex={9} />
                </h1>
              </div>

              <div className="space-y-2">
                <m.p 
                  className="text-lg text-gray-200 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Tokenize your physical assets and unlock their digital potential in the Nuvos ecosystem.
                </m.p>
                
                <m.p 
                  className="text-sm text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  Bridge the physical and digital worlds with our tokenization platform.
                </m.p>
              </div>
            </div>
          </div>
          
          {/* Desktop layout uses the main grid columns - Left column (image) */}
          <m.div 
            className="hidden md:flex md:order-1 justify-center"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <m.div className="relative" initial={{ y: 0 }} animate={floatingAnimation}>
              <m.img
                src="/NFT-X1.webp"
                alt="Nuvos NFTs"
                className="max-w-full h-auto rounded-2xl md:max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ willChange: "filter" }}
              />
              
              <m.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={shadowPulse}
                style={{ zIndex: -1 }}
              />

              <m.div
                className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-blue-500/10 rounded-3xl -z-10"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </m.div>
          </m.div>
          
          {/* Desktop layout - Right column (text) */}
          <div className="hidden md:block md:order-2 text-left">
            <div className="relative mb-6">
              <m.div 
                className="absolute inset-0 w-full h-full bg-black/30 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              ></m.div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-nuvo-gradient-text">
                <AnimatedLetters text="NUVOS NFT" className="inline-block" startIndex={0} />
                <br />
                <AnimatedLetters text="Collection" className="inline-block" startIndex={9} />
              </h1>
            </div>

            <div className="space-y-6">
              <m.p 
                className="text-2xl md:text-3xl text-gray-200 leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Tokenize your physical assets and unlock their digital potential in the Nuvos ecosystem.
              </m.p>
              
              <m.p 
                className="text-lg md:text-xl text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Bridge the physical and digital worlds with our tokenization platform. Transform tangible objects into verified digital assets with real utility, ownership benefits, and interoperable value.
              </m.p>
            </div>
          </div>
        </div>

        {/* NFTFeatures component */}
        <NFTFeatures />
      </m.div>
    </section>
  );
};

export default NFTHeroSection;
