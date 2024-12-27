import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaLock, FaUsers } from 'react-icons/fa';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text">
            NUVOS Token
          </h1>
          <p className="text-xl md:text-2xl  mt-4">
            The Foundation of Our Digital Economy
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-3xl">
          <p className="text-gray-300 text-lg mb-6">
            Introducing NUVOS, the cornerstone of our ecosystem with a fixed supply of 21M tokens.
            Built for sustainability, transparency, and community-driven growth.
          </p>
        </motion.div>

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
              title: "Launch Timeline",
              description: "Pre-release: Q2 2025\nOfficial Launch: Q3 2025"
            },
            {
              icon: <FaUsers className="text-purple-400 text-2xl mb-4" />,
              title: "Community First",
              description: "Priority access for community members during pre-release"
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
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
            Learn More
          </button>
          <button className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
            Join Waitlist
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;