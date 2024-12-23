import React from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaRocket } from 'react-icons/fa';
import { airdropInfo } from './airdropConfig';

const AirdropSection = () => {
  return (
    <section className="relative py-32 px-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/dots-pattern.svg')] opacity-5"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2 
          className="text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Airdrop Program
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {airdropInfo.categories.map((category, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 rounded-2xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm group-hover:border-purple-500/40 transition-all duration-300">
                <FaGift className="text-purple-400 text-4xl mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">{category.title}</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-4">{category.amount}</p>
                <p className="text-gray-300">{category.requirements}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent rounded-2xl"></div>
          <div className="relative p-8 rounded-2xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6">Eligibility Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {airdropInfo.eligibility.map((requirement, index) => (
                <div key={index} className="flex items-center gap-4 text-gray-300">
                  <FaRocket className="text-purple-400 text-xl flex-shrink-0" />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AirdropSection;
