import React from 'react';
import { m } from 'framer-motion';
import { FaGift, FaRocket } from 'react-icons/fa';
import { airdropInfo } from './airdropConfig.js';
import { useAnimationConfig } from '../../animation/AnimationProvider';

const AirdropSection = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const disableAnimations = shouldReduceMotion || isLowPerformance;

  const { categories, eligibility } = airdropInfo;

  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4">
      {/* Transparent background */}
      
      {/* Subtle animated accent */}
      <m.div 
        className="absolute top-1/3 right-1/4 w-64 md:w-72 h-64 md:h-72 rounded-full bg-purple-600/5 blur-3xl"
        animate={disableAnimations ? {} : { 
          scale: [1, 1.1, 1], 
          opacity: [0.1, 0.15, 0.1],
          x: [0, -10, 0],
          y: [0, 10, 0] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <m.h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 md:mb-6"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Tokenization Pioneers
          </span>
        </m.h2>
        
        <m.p
          className="text-base md:text-lg lg:text-xl text-center text-gray-300 max-w-3xl mx-auto mb-8 md:mb-12"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Join our early adopter program to tokenize assets and earn NUVO tokens as you help build the bridge between worlds.
        </m.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {categories.map((category, index) => (
            <m.div
              key={index}
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.5, delay: disableAnimations ? 0 : index * 0.1 }}
              viewport={{ once: true, margin: "-30px" }}
              className="backdrop-blur-sm p-6 md:p-8 rounded-xl border border-purple-500/20 shadow-xl hover:border-purple-400/40 transition-all duration-300"
              whileHover={disableAnimations ? {} : { 
                scale: 1.02, 
                boxShadow: "0 8px 25px rgba(168, 85, 247, 0.15)"
              }}
            >
              <m.div 
                className="text-purple-400 text-3xl md:text-4xl mb-4 md:mb-6"
                whileHover={disableAnimations ? {} : { scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaGift />
              </m.div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{category.title}</h3>
              <p className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                  {category.amount}
                </span>
              </p>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">{category.requirements}</p>
            </m.div>
          ))}
        </div>

        <m.div 
          className="backdrop-blur-sm p-6 md:p-8 rounded-xl border border-purple-500/20 shadow-xl"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Program Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {eligibility.map((requirement, index) => (
              <m.div 
                key={index} 
                className="flex items-center gap-3 md:gap-4 text-gray-300"
                initial={disableAnimations ? { opacity: 1 } : { opacity: 0, x: -10 }}
                whileInView={disableAnimations ? {} : { opacity: 1, x: 0 }}
                transition={{ duration: disableAnimations ? 0 : 0.3, delay: disableAnimations ? 0 : 0.05 * index }}
                viewport={{ once: true }}
              >
                <m.div
                  className="text-purple-400 text-lg md:text-xl flex-shrink-0"
                  whileHover={disableAnimations ? {} : { scale: 1.1, rotate: 5 }}
                >
                  <FaRocket />
                </m.div>
                <span className="text-sm md:text-base">{requirement}</span>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default AirdropSection;
