import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gradient-to-b from-gray-900/95 to-purple-900/95 rounded-xl p-8 max-w-lg mx-4 border border-purple-500/20 shadow-[0_0_2rem_-0.5rem_#8b5cf6]"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Nuvo Beta Live v0.1
            </h2>
            
            <div className="space-y-4 text-gray-100 mb-6">
              <p className="leading-relaxed">
                ✨ We're thrilled to announce the first Beta Live version of Nuvo! 
                <span className="text-xs ml-2 text-purple-400">(Note: This version may contain some instabilities)</span>
              </p>
              
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  🎁 Special Launch Offer
                </h3>
                <p>Receive <span className="font-bold text-purple-400">10 POL tokens</span> to jumpstart your journey with our Smart Staking plan!</p>
              </div>

              <div className="text-sm space-y-2">
                <p>🔥 <span className="font-semibold">New Features:</span></p>
                <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
                  <li>Enhanced Smart Staking Platform</li>
                  <li>Automated Rewards Distribution</li>
                  <li>Improved Security Measures</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link 
                to="/airdrops" 
                className="w-full px-6 py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg transition-all hover:scale-[1.02]"
                onClick={closeModal}
              >
                🎁 Claim Your Airdrop Now
              </Link>
              <button
                onClick={closeModal}
                className="text-red-500 hover:text-red-400 transition-colors text-base font-bold drop-shadow-lg hover:drop-shadow-xl"
            >
                Maybe Later
            </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;