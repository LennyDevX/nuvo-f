import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaLock, FaUsers } from 'react-icons/fa';

const HeroSection = ({ onOpenTokenModal }) => {
  // Container variants for the whole section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Item variants for features and other elements
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Letter-by-letter animation variants (matching Header component)
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.4,
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
        delayChildren: 0.4
      }
    }
  };

  return (
    <motion.div
      className="card-purple-gradient card-purple-wrapper mt-16 md:mt-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div variants={itemVariants} className="mb-8">
          {/* Title with letter-by-letter animation */}
          <motion.div
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className="mb-4 overflow-hidden"
          >
            {Array.from("NUVOS Token").map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 
                         drop-shadow-[2px_3px_1px_rgba(139,92,246,0.8)] 
                         transition-all duration-600 text-4xl md:text-5xl lg:text-6xl font-bold"
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
            transition={{ delay: 1.7, duration: 1 }}
            className="text-xl md:text-2xl mt-4"
          >
            Powering Our Digital Ecosystem Today
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="text-gray-300 text-lg mb-6">
            Experience NUVOS, the active cornerstone of our ecosystem with a fixed supply of 21M tokens.
            Delivering sustainability, transparency, and community-driven growth across the Nuvos Cloud platform.
          </p>
        </motion.div>

        {/* Feature cards - keep existing structure */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {[
            {
              icon: <FaLock className="text-purple-400 text-2xl mb-4" />,
              title: "Fixed Supply",
              description: "21M tokens maximum supply, no additional minting capability"
            },
            {
              icon: <FaRocket className="text-purple-400 text-2xl mb-4" />,
              title: "Active Utility",
              description: "Currently powering transactions and services across the Nuvos Cloud ecosystem"
            },
            {
              icon: <FaUsers className="text-purple-400 text-2xl mb-4" />,
              title: "Community Governed",
              description: "Token holders participate in governance decisions and ecosystem development"
            }
          ].map((item, index) => (
            <div key={index} className="card-purple-gradient card-purple-wrapper">
              {item.icon}
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-8 flex flex-wrap gap-4"
        >
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            onClick={onOpenTokenModal}
          >
            Learn More
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
