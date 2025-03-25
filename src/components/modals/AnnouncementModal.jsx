import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementModal = ({ isOpen, closeModal }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeModal}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-gray-900/95 rounded-xl 
                     p-6 sm:p-8 max-w-md w-full border border-purple-500/30 
                     shadow-[0_0_4rem_-0.5rem_rgba(139,92,246,0.7)] relative
                     backdrop-blur-sm"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Nuvos Update v2.0
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Major Release
              </span>
            </div>
            
            <div className="space-y-4 text-gray-100">
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Major Improvements
                </h3>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Performance boost: 60% faster load times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Optimized component loading with lazy-loading</span>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Redesigned UI with improved accessibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Smooth animations and fluid transitions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Tokenomics dashboard with real-time updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Responsive design for all device types</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-gray-400 italic">
                This major update brings significant improvements to performance, security, and user experience. Enjoy the new Nuvos!
              </p>
            </div>

            <motion.button
              onClick={closeModal}
              className="w-full mt-6 py-2.5 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 
                       text-white font-medium text-sm hover:from-purple-600 hover:to-blue-600 
                       transition-all duration-300 transform hover:scale-[1.02] 
                       shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Open App
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;