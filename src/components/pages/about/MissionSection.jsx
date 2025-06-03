import React from 'react';
import { m } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';

const MissionSection = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const disableAnimations = shouldReduceMotion || isLowPerformance;

  const missionItems = [
    {
      title: "Bridging Physical & Digital",
      content: "Pioneering connections between real-world assets and blockchain technology with verifiable ownership and programmable utility.",
      icon: <FaRocket className="text-3xl md:text-4xl" />
    },
    {
      title: "Democratized Tokenization",
      content: "Empowering anyone to tokenize assets without technical expertise, from collectibles to real estate through seamless processes.",
      icon: <FaShieldAlt className="text-3xl md:text-4xl" />
    },
    {
      title: "Ecosystem of Possibilities",
      content: "Foundation where tokenized assets interact with the broader digital economy through NFT marketplace and smart contracts.",
      icon: <FaUsers className="text-3xl md:text-4xl" />
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Transparent background */}
      
      {/* Subtle animated accent */}
      <m.div
        className="absolute left-0 top-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-purple-600/5 blur-3xl"
        animate={disableAnimations ? {} : { 
          x: [-10, 0, -10], 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <m.h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 md:mb-6"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Our Vision & Mission
          </span>
        </m.h2>
        
        <m.p
          className="text-base md:text-lg lg:text-xl text-center text-gray-300 max-w-3xl mx-auto mb-8 md:mb-12"
          initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Creating a world where every physical asset can unlock digital potential, generating new forms of value and experience.
        </m.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {missionItems.map((item, index) => (
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
                className="text-purple-400 mb-4 md:mb-6"
                whileHover={disableAnimations ? {} : { scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </m.div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{item.title}</h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">{item.content}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
