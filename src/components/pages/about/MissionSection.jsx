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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-purple-950/10 to-black/80 z-0"></div>
      <div className="absolute inset-0 bg-[url('/dots-pattern.svg')] opacity-5"></div>
      
      {/* Animated accent shapes */}
      <motion.div
        className="absolute left-0 top-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ 
          x: [-20, 0, -20], 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          className="text-5xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Our Vision & Mission
          </span>
        </motion.h2>
        
        <motion.p
          className="text-xl text-center text-gray-300 max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Transforming decentralized finance through innovative technology and user-centered design.
        </motion.p>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {missionItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 0 25px 0 rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
            >
              <motion.div 
                className="text-purple-400 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MissionSection;
