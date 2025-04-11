import React from 'react';
import { m } from 'framer-motion';
import { FaGem, FaUnlock } from 'react-icons/fa';
import { fadeIn } from '../../../utils/animationVariants';
import { useAnimationContext } from '../../animation/AnimationProvider';

const RewardDeveloper = () => {
  const { reducedMotion: prefersReducedMotion } = useAnimationContext();

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-18 pb-8 sm:pb-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start lg:items-center">
        {/* Left Column - Content */}
        <div className="space-y-4 sm:space-y-8 pt-2 sm:pt-6">
          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="space-y-3 sm:space-y-4"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              <span className="block mb-2">Elevate Your Profile</span>
              <span className="gradient-text block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">With Utility-Driven NFTs</span>
              <span className="block">Beyond The Blockchain </span>
            </h1>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl mt-4 sm:mt-6">
              Curate your digital identity by collecting exclusive NFTs that unlock real-world privileges, enhanced platform features, and unique opportunities in our ecosystem and beyond. Each NFT represents both artistic value and functional utility. 🌐🔑
            </p>
          </m.div>

          <m.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {[
              { value: "Digital Assets 💎", label: "Collectible Artworks", icon: <FaGem /> },
              { value: "Utility Access 🔓", label: "Cross-Platform Benefits", icon: <FaUnlock /> }
            ].map((stat, index) => (
              <m.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center sm:flex-col sm:items-center p-4 bg-black/20 rounded-xl border border-purple-500/20 gap-3 sm:gap-2"
              >
                <div className="text-purple-400 text-2xl sm:text-xl sm:mb-2">{stat.icon}</div>
                <div className="flex flex-col flex-1 sm:flex-none sm:text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-purple-300 sm:mt-1">{stat.label}</div>
                </div>
              </m.div>
            ))}
          </m.div>
        </div>

        {/* Right Column - NFT Art Image */}
        <m.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative mt-4 sm:mt-8 lg:mt-0 pb-8 sm:pb-0 flex justify-center items-center"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-purple-500/20 border border-purple-500/30">
            <m.img 
              src="/NftArt.webp" 
              alt="Premium NFT Collection" 
              className="w-full h-auto max-w-md object-cover"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-purple-500/30 text-xs text-white">
              🏆 Premium Collection
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default RewardDeveloper;
