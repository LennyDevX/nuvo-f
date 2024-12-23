import React from 'react';
import { motion } from 'framer-motion';
import { SiSolidity, SiReact, SiTailwindcss, SiFirebase, SiPolygon } from 'react-icons/si';

const TechnologySection = () => {
  const technologies = [
    { Icon: SiSolidity, name: 'Solidity', color: 'text-purple-400' },
    { Icon: SiReact, name: 'React', color: 'text-blue-400' },
    { Icon: SiTailwindcss, name: 'Tailwind CSS', color: 'text-cyan-400' },
    { Icon: SiFirebase, name: 'Firebase', color: 'text-yellow-400' },
    { Icon: SiPolygon, name: 'Polygon', color: 'text-purple-500' }
  ];

  return (
    <section className="relative py-32 px-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/tech-pattern.svg')] opacity-5"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-12 md:mb-24 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Technology Stack
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-12 px-4">
          {technologies.map(({ Icon, name, color }, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-4 md:p-8 rounded-2xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm group-hover:border-purple-500/40 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <Icon className={`text-5xl md:text-7xl ${color} transition-all duration-300 group-hover:scale-110 group-hover:filter group-hover:drop-shadow-lg`} />
                  <p className="mt-3 md:mt-4 text-base md:text-lg font-medium text-gray-300 group-hover:text-white">{name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
