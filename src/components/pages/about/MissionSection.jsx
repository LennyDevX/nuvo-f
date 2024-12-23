import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaUsers } from 'react-icons/fa';

const MissionSection = () => {
  const missionItems = [
    {
      title: "Pioneering Innovation",
      content: "We're pushing the boundaries of DeFi through cutting-edge research and development. Our innovative staking mechanisms and algorithmic trading strategies are designed to maximize returns while minimizing risks. By leveraging advanced blockchain technology, we're creating for Community first.",
      icon: <FaRocket className="text-4xl" />
    },
    {
      title: "Uncompromising Security",
      content: "Security is at the core of everything we do. Our multi-layered security architecture includes regular smart contract audits, real-time monitoring systems, and automated fail-safes. We implement industry-leading security practices and maintain transparency through open-source development.",
      icon: <FaShieldAlt className="text-4xl" />
    },
    {
      title: "Community Empowerment",
      content: "We believe in the power of collective growth. Our DAO governance model ensures that every community member has a voice in shaping the platform's future. Through educational initiatives, developer grants, and community rewards, we're building an ecosystem that grows stronger together.",
      icon: <FaUsers className="text-4xl" />
    }
  ];

  return (
    <section className="relative py-32 px-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/hexagon-pattern.svg')] opacity-5"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2 
          className="text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Vision & Mission
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {missionItems.map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 rounded-2xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm group-hover:border-purple-500/40 transition-all duration-300">
                <div className="text-purple-400 mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
