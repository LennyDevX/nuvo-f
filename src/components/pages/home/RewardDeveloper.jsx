import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTasks, FaGift } from 'react-icons/fa';
import CircleDeveloper from './CircleDeveloper';

const RewardDeveloper = () => {
  const [activePhase, setActivePhase] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((prev) => (prev % 4) + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-18 pb-8 sm:pb-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start lg:items-center">
        {/* Left Column - Content */}
        <div className="space-y-4 sm:space-y-8 pt-2 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="space-y-3 sm:space-y-4"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              <span className="block mb-2">Empower Your</span>
              <span className="gradient-text block mb-2">Development Journey</span>
              <span className="block">With Rewarding Tasks</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl mt-4 sm:mt-6">
              Join our developer community and earn rewards as you complete tasks and contribute to our project.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {[
              { value: "Tasks", label: "Complete Tasks", icon: <FaTasks /> },
              { value: "Rewards", label: "Earn Rewards", icon: <FaGift /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center sm:flex-col sm:items-center p-4 bg-black/20 rounded-xl border border-purple-500/20 gap-3 sm:gap-2"
              >
                <div className="text-purple-400 text-2xl sm:text-xl sm:mb-2">{stat.icon}</div>
                <div className="flex flex-col flex-1 sm:flex-none sm:text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-purple-300 sm:mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Column - Interactive Progress Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative mt-4 sm:mt-8 lg:mt-0 pb-8 sm:pb-0"
        >
          <CircleDeveloper activePhase={activePhase} />
        </motion.div>
      </div>
    </section>
  );
};

export default RewardDeveloper;
