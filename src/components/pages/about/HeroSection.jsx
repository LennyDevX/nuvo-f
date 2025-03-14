import React from 'react';
import { motion } from 'framer-motion';
// Remove unused SiPolymerproject import
import { FaNetworkWired, FaRocket, FaGithub, FaUsers } from 'react-icons/fa';

const HeroSection = () => {
  // Text animation variants
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: i * 0.1 }
    })
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Enhanced background with animated effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/60"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        {/* Animated accent elements */}
        <motion.div 
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.3, 0.2],
            x: [0, 10, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-pink-500/10 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.2, 0.1],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 9, delay: 1, repeat: Infinity }}
        />
      </div>
      
      <motion.div 
        className="max-w-7xl mx-auto text-center z-20 space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Enhanced title animation word by word */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8">
          <motion.span 
            className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
          >
            Revolutionizing
          </motion.span>
          <br />
          <motion.span 
            className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
          >
            Digital Finance
          </motion.span>
        </h1>

        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4">
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Nuvo is more than a DeFi platform - it's a paradigm shift in how we interact with digital assets. We're building the foundation for a new era of financial innovation.
          </motion.p>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Through advanced blockchain technology and innovative smart contract architecture, we're creating a secure, transparent, and efficient ecosystem that empowers users to take control of their financial future.
          </motion.p>
        </div>

        {/* Enhanced stats with hover effects */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {[
            { label: "Smart Contracts", value: "Maker", icon: <FaRocket className="text-2xl" /> },
            { label: "Powered by", value: "Polygon", icon: <FaNetworkWired className="text-2xl" /> },
            { label: "Open Source", value: "Web Apps", icon: <FaGithub className="text-2xl" /> },
            { label: "Community", value: "DAO", icon: <FaUsers className="text-2xl" /> }
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-4 rounded-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/10"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 20px 0 rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-purple-400 mb-2"
                whileHover={{ scale: 1.1, color: "#a855f7" }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-purple-300 font-medium text-sm mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
