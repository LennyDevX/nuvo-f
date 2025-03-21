import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaCubes, FaFingerprint } from 'react-icons/fa';

const Header = ({ title, subtitle, openUpdatesModal }) => {
  const titleText = title || "Nuvos Cloud";
  
  // Improved animation - horizontal movement from left to right
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.15, // Faster delay between letters
        duration: 0.4,   // Shorter duration for smoother effect
        ease: "easeIn"  // Smoother easing function
      }
    })
  };

  // Container animation to ensure proper timing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.4
      }
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 m-4 overflow-hidden"
        >
          {titleText.split('').map((char, index) => (
            <motion.span
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
            </motion.span>
          ))}
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 0, x: 5 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: 1.7, duration: 1 }} // Simplified timing
          className="gradient-text text-xl sm:text-2xl font-medium"
        >
          {subtitle || "Build your own blockchain ecosystem"}
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
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
            <motion.a 
              href="#get-started" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Get Started
            </motion.a>
            <motion.button 
              onClick={openUpdatesModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-transparent border border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all flex items-center"
            >
              <span>Last Updates</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="bg-black/20 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden"
        >
          <div className="grid grid-cols-1 divide-y divide-purple-500/10">
            {[
              {
                icon: <FaShieldAlt className="text-purple-400" />,
                title: "Secure Services",
                description: "Built on decentralized blockchain infrastructure for unmatched security and transparency"
              },
              {
                icon: <FaCubes className="text-purple-400" />,
                title: "Smart Integration",
                description: "Connecting digital assets with physical products through intelligent synchronization"
              },
              {
                icon: <FaFingerprint className="text-purple-400" />,
                title: "Unique Ecosystem",
                description: "Staking, P2E gaming, and AI tools forming a comprehensive financial environment"
              }
            ].map((item, index) => (
              <div key={index} className="p-5 hover:bg-purple-900/5 transition-colors">
                <div className="flex items-start">
                  <div className="text-2xl mr-4 mt-1">{item.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Header;