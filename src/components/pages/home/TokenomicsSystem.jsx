import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TokenomicsSystem = () => {
  const navigate = useNavigate();

  // Data structure is maintained for potential future use, but we won't display the chart
  const tokenData = [
    { name: 'Community Rewards', value: 20, color: '#8B5CF6' },
    { name: 'Staking Growth', value: 40, color: '#6D28D9' },
    { name: 'Team & Development', value: 15, color: '#4C1D95' },
    { name: 'Liquidity', value: 25, color: '#5B21B6' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Título con degradado similar al de NftInfo */}
            <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              <span className="block mb-2">Revolutionary</span>
              <span className="gradient-text block mb-2">Tokenomics Ecosystem</span>
              <span className="block">Built For The Future</span>
            </h2>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl mt-6">
              Our innovative token distribution creates long-term value with a focus on community governance and sustainable growth. 
              Experience the perfect balance of staking rewards, liquidity incentives, and ecosystem development. ✨💰
            </p>
            
            <div className="space-y-4 mt-8">
              {tokenData.map((item) => (
                <div 
                  key={item.name}
                  className="flex items-center space-x-3"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white">
                    {item.name} - {item.value}%
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/tokenomics')}
              className="px-6 py-4 mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-lg"
            >
              Explore Full Tokenomics
            </button>
          </motion.div>

          {/* Right Content - 3D Animated Token Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center items-center relative"
            style={{ perspective: '1000px' }}
          >
            <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              {/* 3D rotating token */}
              <motion.div
                className="w-full h-full relative"
                animate={{ 
                  rotateY: [0, 360],
                  rotateX: [5, -5, 5]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear",
                  rotateX: {
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src="/NuvosToken.png" 
                  alt="Nuvos Token" 
                  className="absolute top-0 left-0 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                />
              </motion.div>
              
              {/* Floating particles effect */}
              <motion.div 
                className="absolute w-4 h-4 rounded-full bg-purple-500/50 blur-sm"
                animate={{
                  x: [0, 50, -50, 0],
                  y: [0, -50, 50, 0],
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{ top: '20%', left: '20%' }}
              />
              <motion.div 
                className="absolute w-3 h-3 rounded-full bg-indigo-500/50 blur-sm"
                animate={{
                  x: [0, -40, 40, 0],
                  y: [0, 40, -40, 0],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
                style={{ bottom: '20%', right: '20%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSystem;
