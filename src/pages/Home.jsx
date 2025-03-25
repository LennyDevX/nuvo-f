import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Import components directly
import Header from '../components/pages/home/Header';
import HeroSection from '../components/pages/home/HeroSection';
import Features from '../components/pages/home/Features';
import SwapInfo from '../components/pages/home/SwapInfo';
import RewardDeveloper from '../components/pages/home/RewardDeveloper';
import AirdropInfo from '../components/pages/home/AirdropInfo';
import Footer from '../components/layout/Footer';

const Home = () => {
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  useEffect(() => {
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <div className="relative">
        {/* Animated background elements */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-radial from-purple-600/10 via-transparent to-transparent opacity-30"></div>
          <motion.div 
            className="absolute top-0 left-0 right-0 h-screen bg-gradient-radial from-purple-600/20 via-transparent to-transparent"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          ></motion.div>
        </div>
        
        <motion.div style={{ y }} className="relative z-10">
          {/* Header and HeroSection are visible immediately */}
          <Header 
            title="Nuvos Cloud" 
            subtitle="Build your own blockchain ecosystem" 
            openUpdatesModal={() => setShowUpdatesModal(true)}
          />
          
          <HeroSection />
          
          {/* These components will animate as they come into view */}
          <Features />
          <SwapInfo />
          <RewardDeveloper />
          <AirdropInfo />
        </motion.div>
        
        <Footer />
      </div>
      
      {/* Modal for updates */}
      {showUpdatesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Latest Updates</h2>
              <button 
                onClick={() => setShowUpdatesModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
            <div className="h-px w-full bg-purple-500/20 mb-5"></div>
            <div className="text-gray-300">
              <p>Content for the updates modal would go here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
