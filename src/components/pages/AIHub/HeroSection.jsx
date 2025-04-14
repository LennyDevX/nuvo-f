import React from 'react';
import { motion } from 'framer-motion';
import AnimatedAILogo from '../../effects/AnimatedAILogo';

const HeroSection = () => {
  // Letter-by-letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.2,
        ease: "easeIn"
      }
    })
  };

  // Container animation for title
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
      {/* Left side: Text content */}
      <div className="w-full md:w-3/5 text-left md:pr-4">
        {/* Title with letter-by-letter animation */}
        <motion.div
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 overflow-hidden"
        >
          {Array.from("NUVOS AI").map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              variants={letterVariants}
              className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text text-5xl md:text-6xl font-bold"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 0, x: 5 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: 2.0, duration: 1 }}
          className="text-gray-300 text-lg leading-relaxed"
        >
          Experience the power of artificial intelligence within the Nuvos ecosystem. Our AI-driven solutions 
          enhance every aspect of your journey, from optimizing rewards to personalized assistance and exclusive benefits.
        </motion.p>
      </div>
      
      {/* Right side: Animated AI Logo */}
      <div className="w-full md:w-2/5 flex justify-center items-center">
        <div className="w-full max-w-xs">
          <AnimatedAILogo />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
