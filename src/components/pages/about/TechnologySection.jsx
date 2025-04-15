import React from 'react';
import { m } from 'framer-motion';
import { FaNetworkWired } from 'react-icons/fa';
import { SiReact, SiNodedotjs, SiSolidity } from 'react-icons/si';

const TechnologySection = () => {
  const technologies = [
    {
      name: "Polygon Network",
      icon: <FaNetworkWired className="text-4xl md:text-5xl mb-4" />,
      description: "Built on Polygon to ensure fast, secure, and low-cost tokenization of assets with minimal environmental impact."
    },
    {
      name: "Smart Contract Architecture",
      icon: <SiSolidity className="text-4xl md:text-5xl mb-4" />,
      description: "Advanced token standards that maintain connection between physical assets and their digital representations."
    },
    {
      name: "Intuitive Interface",
      icon: <SiReact className="text-4xl md:text-5xl mb-4" />,
      description: "User-friendly platform enabling anyone to tokenize assets without technical knowledge of blockchain systems."
    },
    {
      name: "Scalable Backend",
      icon: <SiNodedotjs className="text-4xl md:text-5xl mb-4" />,
      description: "Robust infrastructure supporting millions of tokenized assets with reliable verification mechanisms."
    }
  ];

  return (
    <section className="py-24 md:py-32 relative">
      {/* Enhanced background - Remove circuit pattern */}
      <div className="absolute inset-0 bg-transparent"></div>
      {/* Remove the circuit pattern that causes grid effect */}
      
      <div className="container mx-auto px-4 relative z-10">
        <m.div 
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-nuvo-gradient-text text-transparent bg-clip-text">
              Our Tokenization Technology
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Innovative solutions that create secure, verifiable connections between physical objects and their digital counterparts on the blockchain.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <m.div
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
              <m.div 
                className="flex justify-center text-purple-500 group-hover:text-purple-400"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {tech.icon}
              </m.div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">{tech.name}</h3>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{tech.description}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
