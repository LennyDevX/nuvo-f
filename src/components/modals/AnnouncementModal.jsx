import React from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';

const AnnouncementModal = ({ isOpen, closeModal }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          // Increased top padding for mobile (pt-8) while maintaining center alignment
          className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 p-4 pt-8 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeModal}
        >
          <m.div
            // Adjusted max-width to be slightly smaller on mobile
            className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-gray-900/95 rounded-xl 
                     max-w-[95%] sm:max-w-xl md:max-w-3xl w-full border border-purple-500/30 
                     shadow-[0_0_4rem_-0.5rem_rgba(139,92,246,0.7)] relative
                     backdrop-blur-sm overflow-hidden"
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
            {/* Reduced padding on mobile for more compact layout */}
            <div className="p-4 sm:p-6 sm:p-8"> 
              {/* Made title section more compact */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Nuvos Update Beta v3.0
                </h2>
                <span className="text-xs px-2 py-0.5 sm:py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0">
                  Major Release
                </span>
              </div>
              
              {/* Reduced gap between columns on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {/* Left column */}
                <div className="space-y-2 sm:space-y-4 text-gray-100 md:pr-2">
                  <h3 className="text-xs sm:text-sm font-medium text-purple-400 mb-1 sm:mb-2 flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Major Improvements
                  </h3>
                  
                  {/* Made padding smaller on mobile */}
                  <div className="bg-purple-500/10 p-2 sm:p-3 md:p-4 rounded-lg border border-purple-500/20">
                    <ul className="text-xs md:text-sm space-y-1 sm:space-y-2 text-gray-300">
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">⚡</span>
                        <span><span className="font-bold">Performance Enhancements:</span> Improved platform speed and responsiveness</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">✨</span>
                        <span><span className="font-bold">Optimized Animations:</span> Smoother transitions and faster loading</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">🎨</span>
                        <span><span className="font-bold">UI/UX Overhaul:</span> Enhanced accessibility and styling</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">🧩</span>
                        <span><span className="font-bold">New Components:</span> Interactive elements with refined effects</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-2 sm:space-y-4 text-gray-100">
                  <h3 className="text-xs sm:text-sm font-medium text-purple-400 mb-1 sm:mb-2 flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 11.955 0 0112 2.944a11.955 11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Additional Features
                  </h3>
                  
                  {/* Consistent mobile styling */}
                  <div className="bg-purple-500/10 p-2 sm:p-3 md:p-4 rounded-lg border border-purple-500/20">
                    <ul className="text-xs md:text-sm space-y-1 sm:space-y-2 text-gray-300">
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">🔒</span>
                        <span><span className="font-bold">Security Fortification:</span> Enhanced protection for user data</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">📊</span>
                        <span><span className="font-bold">Tokenomics Update:</span> Redesigned chart with new distribution</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">📈</span>
                        <span><span className="font-bold">Resource Efficiency:</span> Optimized asset loading strategies</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-purple-400 mr-0.5 sm:mr-1 text-xs sm:text-sm">📱</span>
                        <span><span className="font-bold">Mobile Optimization:</span> Improved mobile experience</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Reduced top margin and changed spacing for mobile */}
              <div className="mt-4 sm:mt-6 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                <p className="text-xs text-gray-400 italic md:max-w-[60%]">
                  This major update brings significant improvements to performance, security, and user experience.
                </p>
                
                <m.button
                  onClick={closeModal}
                  className="w-full md:w-auto md:px-6 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 
                          text-white font-medium text-xs sm:text-sm hover:from-purple-600 hover:to-blue-600 
                          transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Open App
                </m.button>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;