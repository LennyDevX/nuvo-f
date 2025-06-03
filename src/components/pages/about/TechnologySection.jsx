import React from 'react';
import { m } from 'framer-motion';
import { FaNetworkWired } from 'react-icons/fa';
import { SiReact, SiNodedotjs, SiSolidity } from 'react-icons/si';
import { useAnimationConfig } from '../../animation/AnimationProvider';

const TechnologySection = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const disableAnimations = shouldReduceMotion || isLowPerformance;

  const technologies = [
    {
      name: "Polygon Network",
      icon: <FaNetworkWired className="text-3xl md:text-4xl mb-3" />,
      description: "Fast, secure, and low-cost tokenization with minimal environmental impact."
    },
    {
      name: "Smart Contracts",
      icon: <SiSolidity className="text-3xl md:text-4xl mb-3" />,
      description: "Advanced token standards connecting physical and digital assets."
    },
    {
      name: "User Interface",
      icon: <SiReact className="text-3xl md:text-4xl mb-3" />,
      description: "Intuitive platform for anyone to tokenize without technical knowledge."
    },
    {
      name: "Scalable Backend",
      icon: <SiNodedotjs className="text-3xl md:text-4xl mb-3" />,
      description: "Robust infrastructure supporting millions of tokenized assets."
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 relative">
      {/* Transparent background - no additional overlays */}
      
      <div className="container mx-auto px-4 relative z-10">
        <m.div 
          className="text-center mb-8 md:mb-12"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
              Our Tokenization Technology
            </span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
            Innovative solutions that create secure, verifiable connections between physical objects and their digital counterparts.
          </p>
        </m.div>

        {/* Mobile-optimized grid: 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {technologies.map((tech, index) => (
            <m.div
              key={index}
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.4, delay: disableAnimations ? 0 : index * 0.1 }}
              viewport={{ once: true, margin: "-30px" }}
              className="backdrop-blur-sm p-4 md:p-6 lg:p-8 rounded-xl border border-purple-500/20 shadow-xl text-center group hover:border-purple-400/40 transition-all duration-300"
              whileHover={disableAnimations ? {} : { 
                scale: 1.02, 
                boxShadow: "0 8px 25px rgba(168, 85, 247, 0.15)",
                y: -2
              }}
            >
              <m.div 
                className="flex justify-center text-purple-400 group-hover:text-purple-300 transition-colors"
                whileHover={disableAnimations ? {} : { scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {tech.icon}
              </m.div>
              <h3 className="text-sm md:text-base lg:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-purple-200 transition-colors duration-300">
                {tech.name}
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                {tech.description}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
