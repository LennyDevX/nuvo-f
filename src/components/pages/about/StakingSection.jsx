import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { stakingInfo } from './stakingConfig';

const StakingSection = () => {
  const getIcon = (iconType) => {
    switch (iconType) {
      case 'clock':
        return <FaClock className="text-purple-400 text-2xl" />;
      case 'chart':
        return <FaChartLine className="text-purple-400 text-2xl" />;
      case 'shield':
        return <FaShieldAlt className="text-purple-400 text-2xl" />;
      default:
        return null;
    }
  };

return (
    <section className="relative py-20 px-4">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-radial from-purple-600/90 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
            <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-8 md:mb-16 px-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                Smart Staking Protocol
            </motion.h2>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8 md:mb-12 px-4">
                {stakingInfo.features.map((feature, index) => (
                    <motion.div
                        key={index}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-700/30 to-transparent rounded-lg"></div>
                        <div className="relative p-6 rounded-lg border border-purple-500/30 bg-gray-900/50 backdrop-blur-sm">
                            <div className="text-purple-400 mb-4 text-2xl">{getIcon(feature.iconType)}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-300 text-sm">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4">
                {Object.entries(stakingInfo.details).map(([key, value], index) => (
                    <motion.div
                        key={index}
                        className="p-3 rounded-lg border border-black bg-gray-900/50 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <h4 className="text-sm text-purple-400 mb-1">{key}</h4>
                        <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-700 text-transparent bg-clip-text">{value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);
};

export default StakingSection;
