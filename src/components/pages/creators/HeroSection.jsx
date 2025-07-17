import React from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaStar, FaPalette, FaMicrophone, FaRocket, FaHeadset, FaUsers } from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';

const HeroSection = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const reduceAnimations = shouldReduceMotion || isLowPerformance;

  // Simplificar animaciones de iconos para mejor rendimiento
  const creatorIcons = React.useMemo(() => [
    { icon: <FaCamera />, delay: 0.2, position: 'top-1/4 left-1/4' },
    { icon: <FaStar />, delay: 0.4, position: 'top-1/3 right-1/4' },
    { icon: <FaPalette />, delay: 0.6, position: 'bottom-1/3 left-1/3' },
    { icon: <FaMicrophone />, delay: 0.8, position: 'bottom-1/4 right-1/3' }
  ], []);

  // Animaciones más eficientes
  const titleAnimation = React.useMemo(() => 
    reduceAnimations
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { 
          initial: { opacity: 0, y: -10 }, 
          animate: { opacity: 1, y: 0 }, 
          transition: { duration: 0.4, ease: "easeOut" } 
        }
  , [reduceAnimations]);

  const subtitleAnimation = React.useMemo(() =>
    reduceAnimations
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { 
          initial: { opacity: 0, y: 10 }, 
          animate: { opacity: 1, y: 0 }, 
          transition: { duration: 0.4, delay: 0.2 } 
        }
  , [reduceAnimations]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Animated background elements - Reducidos y optimizados */}
      <div className="absolute inset-0">
        {!reduceAnimations && creatorIcons.map((item, index) => (
          <motion.div
            key={index}
            className={`absolute ${item.position} w-8 h-8 text-purple-400/20`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
        
        {/* Gradient overlays simplificados */}
        {!reduceAnimations && (
          <>
            <motion.div 
              className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-purple-500/5 blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1], 
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-pink-500/5 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 10, delay: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto text-center z-20 space-y-6">
        {/* Main title optimizado */}
        <motion.div 
          className="relative"
          {...titleAnimation}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 relative z-10">
            <span className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text">
              Creators
            </span>
            <br />
            <span className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text">
              Economy
            </span>
          </h1>
        </motion.div>

        {/* Subtitle optimizado */}
        <div className="max-w-4xl mx-auto space-y-4 px-4">
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 leading-relaxed font-light"
            {...subtitleAnimation}
          >
            Transform your creative work into valuable digital assets.
          </motion.p>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={reduceAnimations ? {} : { opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Join the next generation of content creators leveraging NFT technology.
          </motion.p>
        </div>

        {/* Call-to-action buttons simplificados */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6"
          initial={reduceAnimations ? { opacity: 1 } : { opacity: 0 }}
          animate={reduceAnimations ? {} : { opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <button className="btn-nuvo-base bg-nuvo-gradient-button text-white rounded-xl flex items-center gap-3 text-lg px-8 py-4">
            <FaRocket />
            Start Your Journey
          </button>
          
          <button className="btn-nuvo-base btn-nuvo-outline text-lg px-8 py-4 rounded-xl">
            Explore Categories
          </button>
        </motion.div>

        {/* Creator stats simplificados */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 px-4"
          initial={reduceAnimations ? { opacity: 1 } : { opacity: 0 }}
          animate={reduceAnimations ? {} : { opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          {[
            { label: "Categories", value: "4", icon: <FaPalette /> },
            { label: "Benefits", value: "10", icon: <FaStar /> },
            { label: "Support", value: "24/7", icon: <FaHeadset /> },
            { label: "Community", value: "Active", icon: <FaUsers /> }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <div className="text-purple-400 mb-2 text-xl">
                {stat.icon}
              </div>
              <div className="text-purple-300 font-medium text-xs mb-1">{stat.label}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

