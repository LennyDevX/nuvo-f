import React from 'react';
import { motion } from 'framer-motion';
import { FaNetworkWired } from 'react-icons/fa';
import { SiReact, SiNodedotjs, SiSolidity } from 'react-icons/si';

const TechnologySection = () => {
  const technologies = [
    {
      name: "Polygon Network",
      icon: <FaNetworkWired className="text-4xl md:text-5xl mb-4" />,
      description: "Our platform is built on Polygon, providing fast, secure, and low-cost transactions."
    },
    {
      name: "Solidity",
      icon: <SiSolidity className="text-4xl md:text-5xl mb-4" />,
      description: "Advanced smart contract architecture ensures secure and transparent operations."
    },
    {
      name: "Modern Frontend",
      icon: <SiReact className="text-4xl md:text-5xl mb-4" />,
      description: "Built with React for a responsive and intuitive user experience."
    },
    {
      name: "Robust Backend",
      icon: <SiNodedotjs className="text-4xl md:text-5xl mb-4" />,
      description: "Powerful backend solutions to handle complex DeFi operations."
    }
  ];

  return (
    <section className="py-24 md:py-32 relative">
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-black to-purple-950/5"></div>
      <motion.div 
        className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%"]
        }}
        transition={{ duration: 50, repeat: Infinity, repeatType: "reverse" }}
      ></motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
              Our Technology Stack
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built on cutting-edge blockchain technology to deliver a secure, scalable, and efficient DeFi platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/10 text-center group"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 25px 0 rgba(168, 85, 247, 0.3)",
                y: -5
              }}
            >
              <motion.div 
                className="flex justify-center text-purple-500 group-hover:text-purple-400"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {tech.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">{tech.name}</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
