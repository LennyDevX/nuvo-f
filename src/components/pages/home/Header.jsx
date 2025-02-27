import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaCubes, FaFingerprint } from 'react-icons/fa';

const Header = ({ title, subtitle }) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 m-4">
          {title || "Nuvos"}
        </h1>
        <p className="gradient-text text-xl sm:text-2xl font-medium">
          {subtitle || "The Future of Cryptocurrency"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            <span className="gradient-text">Blockchain</span> Reimagined
          </h2>
          
          <p className="text-gray-300 text-lg leading-relaxed">
            Nuvos Cloud is a minimalist platform that leverages blockchain technology 
            to deliver intelligent services with unmatched security and efficiency.
          </p>
          
          <div className="pt-3">
            <a href="#learn-more" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
              <span className="mr-2">Discover our ecosystem</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33334 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3.33333L12.6667 8L8 12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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