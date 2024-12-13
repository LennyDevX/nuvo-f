// src/components/layout/About.jsx
import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-12 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            About Nuvo
          </h1>
          <p className="text-gray-300 text-lg">
            Building the future of DeFi on Polygon
          </p>
        </motion.div>

        <motion.div
          className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6 text-gray-300">
            <p>
              Nuvo is a next-generation DeFi protocol built on Polygon, offering innovative staking solutions and yield optimization strategies.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400">Our Mission</h3>
                <p>To provide accessible, secure, and innovative DeFi solutions that empower users to maximize their crypto assets.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400">Our Vision</h3>
                <p>Creating a sustainable DeFi ecosystem that rewards participation and fosters community growth.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { title: "Security First", desc: "Multiple audits and secure-by-design principles" },
            { title: "Community Driven", desc: "Governance and rewards for active participants" },
            { title: "Innovative Tech", desc: "Cutting-edge DeFi solutions and strategies" }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
            >
              <h3 className="text-lg font-semibold text-purple-400 mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default About;