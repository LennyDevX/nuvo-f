import React from 'react';
import { m } from 'framer-motion';
import { FaGem, FaUnlock } from 'react-icons/fa';
import { fadeIn } from '../../../utils/animationVariants';
import { useAnimationContext } from '../../animation/AnimationProvider';

const RewardDeveloper = () => {
  const { reducedMotion: prefersReducedMotion } = useAnimationContext();

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-18 pb-8 sm:pb-16 lg:py-24">
      {/* Title for mobile that appears above the grid */}
      <div className="block md:hidden mb-6 text-center">
        <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
          <span className="block">Elevate Your Profile</span>
          <span className="gradient-text text-transparent bg-clip-text bg-nuvo-gradient-text">With NFTs</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3 md:gap-6 lg:gap-12 items-center">
        {/* Left Column - NFT Art Image - Optimized for mobile and desktop */}
        <m.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative pb-2 flex justify-center items-center col-span-1"
        >
          <div className="relative overflow-hidden rounded-xl shadow-xl shadow-purple-500/20 border border-purple-500/30 max-w-[250px] md:max-w-[280px] lg:max-w-[320px] mx-auto">
            <m.img 
              src="/NFT-Y1.webp" 
              alt="NFts" 
              className="w-full h-auto object-cover"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-purple-500/30 text-[10px] md:text-xs text-white">
              🏆 Premium
            </div>
          </div>
        </m.div>

        {/* Right Column - Content */}
        <div className="space-y-2 md:space-y-4 col-span-1">
          {/* Title only visible on larger screens */}
          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="hidden md:block">
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                <span className="block mb-2">Elevate Your Profile</span>
                <span className="gradient-text block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">With Utility-Driven NFTs</span>
                <span className="block">Beyond The Blockchain </span>
              </h1>
            </div>
            
            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-300 max-w-xl mt-2 md:mt-6">
              Collect exclusive NFTs that unlock real-world privileges and unique opportunities in our ecosystem. 🌐🔑
            </p>
          </m.div>

          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2 md:mt-8"
          >
            {[
              { value: "Digital Assets 💎", label: "Collectible Artworks", icon: <FaGem /> },
              { value: "Utility Access 🔓", label: "Cross-Platform Benefits", icon: <FaUnlock /> }
            ].map((stat, index) => (
              <m.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center p-2 md:p-4 bg-black/20 rounded-lg md:rounded-xl border border-purple-500/20 gap-1"
              >
                <div className="text-purple-400 text-base md:text-2xl md:mb-2">{stat.icon}</div>
                <div className="flex flex-col text-center">
                  <div className="text-sm md:text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] md:text-sm text-purple-300">{stat.label}</div>
                </div>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default RewardDeveloper;
