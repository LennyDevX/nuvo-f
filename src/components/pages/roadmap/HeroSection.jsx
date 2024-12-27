import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaCode, FaRocket, FaTools } from 'react-icons/fa';
import { SiSolidity, SiReact, SiGithubcopilot } from 'react-icons/si';

const HeroSection = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const developmentAreas = [
    {
      icon: <SiSolidity className="w-6 h-6" />,
      title: "Smart Contracts",
      description: "Optimize and secure our blockchain infrastructure"
    },
    {
      icon: <SiReact className="w-6 h-6" />,
      title: "Frontend",
      description: "Enhance user experience and interface design"
    },
    {
      icon: <FaTools className="w-6 h-6" />,
      title: "Backend",
      description: "Improve server performance and API integration"
    },
    {
      icon: <FaCode className="w-6 h-6" />,
      title: "Testing",
      description: "Ensure quality and reliability"
    }
  ];

  const benefits = [
    "Free GitHub Copilot Access",
    "Competitive Rewards",
    "Flexible Remote Work",
    "Community Recognition"
  ];

  return (
    <div className="relative pt-16 sm:pt-20 pb-12 sm:pb-16">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <motion.div 
          className="text-center mb-12"
          {...fadeIn}
        >
          <div className="flex items-center justify-center mb-6">
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
              Developer Portal
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Build the Future of DeFi
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join our open-source community and help shape the next generation of decentralized finance. 
            Contribute, earn rewards, and access premium development tools including GitHub Copilot.
          </p>
        </motion.div>

        {/* Development Areas Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, stagger: 0.1 }}
        >
          {developmentAreas.map((area, index) => (
            <div key={index} className="p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 bg-purple-900/5 backdrop-blur-sm hover:bg-purple-900/10">
              <div className="text-purple-400 mb-4">{area.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{area.title}</h3>
              <p className="text-gray-400 text-sm">{area.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          className="rounded-2xl p-8 border border-purple-500/20 bg-purple-900/5 backdrop-blur-sm hover:bg-purple-900/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <SiGithubcopilot className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Developer Benefits</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        
      </div>
    </div>
  );
};

export default HeroSection;
