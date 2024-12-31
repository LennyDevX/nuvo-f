import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaGithub, FaRocket, FaUsers } from 'react-icons/fa';
import { SiPolygon } from 'react-icons/si';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      </div>
      
      <motion.div 
        className="max-w-7xl mx-auto text-center z-20 space-y-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 gradient-text"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Revolutionizing<br/> Digital Finance
        </motion.h1>

        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4">
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 leading-relaxed font-light">
            Nuvo is more than a DeFi platform - it's a paradigm shift in how we interact with digital assets. We're building the foundation for a new era of financial innovation.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed">
            Through advanced blockchain technology and innovative smart contract architecture, we're creating a secure, transparent, and efficient ecosystem that empowers users to take control of their financial future.
          </p>
        </div>

       

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-16 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { label: "Smart Contracts", value: "Maker", icon: <FaRocket className="text-2xl" /> },
            { label: "Powered by", value: "Polygon", icon: <SiPolygon className="text-2xl" /> },
            { label: "Open Source", value: "Web Apps", icon: <FaGithub className="text-2xl" /> },
            { label: "Community", value: "DAO", icon: <FaUsers className="text-2xl" /> }
          ].map((stat, index) => (
            <div key={index} className="card-purple-gradient card-purple-wrapper">
              <div className="text-purple-400 mb-2">{stat.icon}</div>
              <div className="text-purple-300 font-medium text-sm mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
