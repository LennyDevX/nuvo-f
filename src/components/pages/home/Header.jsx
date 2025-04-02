import React, { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { FaShieldAlt, FaCubes, FaFingerprint, FaChevronDown } from 'react-icons/fa';

const Header = ({ title, subtitle, openUpdatesModal }) => {
  const titleText = title || "Nuvos Cloud";
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Improved animation with reduced motion support
  const letterVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 3 },
    visible: (i) => (prefersReducedMotion 
      ? { opacity: 1, x: 0 }
      : {
          opacity: 1,
          x: 0,
          transition: {
            delay: i * 0.10,
            duration: 0.1,
            ease: "easeOut"
          }
        }
    )
  };

  // Container animation with reduced motion support
  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.05
      }
    }
  };

  // Feature card hover effect
  const featureCardVariants = {
    hover: {
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Scroll down animation
  const scrollDownVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, 10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <m.div 
          initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 3 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <m.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 m-4 overflow-hidden"
            aria-label={titleText}
          >
            {titleText.split('').map((char, index) => (
              <m.span
                key={index}
                custom={index}
                variants={letterVariants}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 
                           drop-shadow-[2px_3px_1px_rgba(139,92,246,0.8)] 
                           transition-all duration-600"
                style={{
                  textShadow: "0 0 0 rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.3)"
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </m.span>
            ))}
          </m.div>
          <m.p 
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: 0, x: prefersReducedMotion ? 0 : 5 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: prefersReducedMotion ? 0.5 : 1, duration: prefersReducedMotion ? 0 : 1}}
            className="gradient-text text-xl sm:text-2xl font-medium"
          >
            {subtitle || "Build your own blockchain ecosystem"}
          </m.p>
          
          {/* Statistics counter */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0.5 : 1, duration: 1 }}
            className="flex flex-wrap justify-center gap-8 mt-8 text-center"
          >
            {[{ value: "Secure", label: "By POL" }, { value: "Fast", label: "Blockchain" }, { value: "24/7", label: "Open" }].map((stat, index) => (
              <div key={index} className="px-4">
                <div className="text-3xl font-bold text-purple-400">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </m.div>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <m.div
            initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1, delay: prefersReducedMotion ? 0 : 1.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              <span className="gradient-text">Blockchain</span> Is all you need 
            </h2>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              Nuvos Cloud is a minimalist platform that leverages blockchain technology 
              to deliver intelligent services with unmatched security and efficiency.
            </p>
            
            <div className="pt-5 flex flex-wrap gap-4">
              <m.a 
                href="#get-started" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Get Started
              </m.a>
              <m.button 
                onClick={openUpdatesModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all flex items-center"
              >
                <span>Last Updates</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </m.button>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1, delay: prefersReducedMotion ? 0 : 1.8 }}
            className="bg-black/20 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden shadow-lg shadow-purple-500/10"
          >
            <div className="grid grid-cols-1 divide-y divide-purple-500/10">
              {[
                {
                  icon: <FaShieldAlt className="text-purple-400" aria-hidden="true" />,
                  title: "Secure Services",
                  description: "Built on decentralized blockchain infrastructure for unmatched security and transparency"
                },
                {
                  icon: <FaCubes className="text-purple-400" aria-hidden="true" />,
                  title: "Smart Integration",
                  description: "Connecting digital assets with physical products through intelligent synchronization"
                },
                {
                  icon: <FaFingerprint className="text-purple-400" aria-hidden="true" />,
                  title: "Unique Ecosystem",
                  description: "Staking, P2E gaming, and AI tools forming a comprehensive financial environment"
                }
              ].map((item, index) => (
                <m.div 
                  key={index} 
                  className="p-5 cursor-pointer"
                  variants={featureCardVariants}
                  whileHover="hover"
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-4 mt-1">{item.icon}</div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
        
        {/* Scroll down indicator */}
        <m.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <m.a
            href="#get-started"
            className="text-purple-400 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity"
            variants={scrollDownVariants}
            initial="initial"
            animate="animate"
            aria-label="Scroll down to learn more"
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <FaChevronDown />
          </m.a>
        </m.div>
      </section>
    </LazyMotion>
  );
};

export default Header;