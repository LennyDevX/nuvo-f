import React from 'react';
import { m } from 'framer-motion';

const CTASection = () => {
  return (
    <section className="relative py-24 px-4">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-transparent"></div>
      
      {/* Animated accent shapes */}
      <m.div
        className="absolute left-0 bottom-0 w-full h-48 bg-gradient-to-t from-purple-600/10 to-transparent"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      ></m.div>
      <m.div
        className="absolute right-1/4 top-1/4 w-64 h-64 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.2, 0.3, 0.2] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
      ></m.div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <m.h2 
          className="text-5xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Start Your Tokenization Journey
          </span>
        </m.h2>
        
        <m.p 
          className="text-xl text-gray-300 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Transform your physical assets into digital opportunities. Join our platform and be among the first to bridge the gap between tangible value and blockchain technology.
        </m.p>
        
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <m.a
            href="/tokenization-beta"
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
            Tokenize Your First Asset
          </m.a>
        </m.div>
      </div>
    </section>
  );
};

export default CTASection;
