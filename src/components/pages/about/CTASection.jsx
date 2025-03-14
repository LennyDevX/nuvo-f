import React from 'react';
import { motion } from 'framer-motion';

const CTASection = () => {
  return (
    <section className="relative py-24 px-4">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-black/80"></div>
      <motion.div 
        className="absolute inset-0 bg-[url('/stars-pattern.svg')] opacity-10"
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
      ></motion.div>
      
      {/* Animated accent shapes */}
      <motion.div
        className="absolute left-0 bottom-0 w-full h-48 bg-gradient-to-t from-purple-600/10 to-transparent"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      ></motion.div>
      <motion.div
        className="absolute right-1/4 top-1/4 w-64 h-64 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.2, 0.3, 0.2] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
      ></motion.div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.h2 
          className="text-5xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Join Our Community
          </span>
        </motion.h2>
        
        <motion.p 
          className="text-xl text-gray-300 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Be part of the future of DeFi. Join our beta program and help shape the future of decentralized finance.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="/beta-signup"
            className="inline-block px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-full shadow-lg shadow-purple-500/20"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 0 30px 0 rgba(168, 85, 247, 0.4)",
              backgroundPosition: "right center"
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300,
              backgroundPosition: { duration: 0.8 } 
            }}
          >
            Join Beta Program
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
