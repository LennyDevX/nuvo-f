import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaUsers } from 'react-icons/fa';

const MissionSection = () => {
  const missionItems = [
    {
      title: "Smart Contract Innovation",
      content: "We're developing a new generation of modular smart contracts that enable unique interactions within our ecosystem. Our microservices architecture allows users to seamlessly engage with multiple DeFi protocols, from yield farming to liquidity provision, all through a unified and intuitive interface.",
      icon: <FaRocket className="text-4xl" />
    },
    {
      title: "Multi-Layer Rewards",
      content: "Our platform features diverse reward mechanisms across different smart contract layers. Users can earn through various activities: providing liquidity, participating in governance, contributing to protocol security, and engaging in community-driven initiatives. Each interaction is designed to maximize value for participants.",
      icon: <FaShieldAlt className="text-4xl" />
    },
    {
      title: "Interactive Ecosystem",
      content: "We're building an interconnected network of smart contracts where users actively shape the platform's evolution. Through our innovative staking mechanisms, prediction markets, and social trading features, community members can earn rewards while contributing to the ecosystem's growth and sustainability.",
      icon: <FaUsers className="text-4xl" />
    }
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
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
              className="card-purple-gradient card-purple-wrapper group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="text-purple-400 mb-6">{item.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
