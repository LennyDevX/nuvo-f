import React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPuzzlePiece, FaCode, FaRobot } from 'react-icons/fa';

const LeftSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Backdrop - only on mobile */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop-visible' : ''} md:hidden`}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <m.div
            className="sidebar-container sidebar-left"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="sidebar-header">
              <h2 className="sidebar-title">
                <FaPuzzlePiece className="text-purple-400" /> Tools
              </h2>
              <button 
                onClick={toggleSidebar}
                className="sidebar-close-btn md:hidden"
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="sidebar-content">
              {/* Tools Section */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Tools</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/30 backdrop-blur-md p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-700/50 backdrop-blur-sm flex items-center justify-center">
                        <FaCode className="text-purple-400 text-lg" />
                      </div>
                      <span className="text-white font-medium">Code Assistant</span>
                    </div>
                    <div className="text-xs bg-yellow-500/10 backdrop-blur-sm text-yellow-300 px-3 py-1.5 rounded inline-block mt-1">
                      Coming soon
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 backdrop-blur-md p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-700/50 backdrop-blur-sm flex items-center justify-center">
                        <FaRobot className="text-purple-400 text-lg" />
                      </div>
                      <span className="text-white font-medium">Image Generator</span>
                    </div>
                    <div className="text-xs bg-yellow-500/10 backdrop-blur-sm text-yellow-300 px-3 py-1.5 rounded inline-block mt-1">
                      Coming soon
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Model Information */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                  About this AI
                </h3>
                <div className="bg-gray-800/30 backdrop-blur-md p-5 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
                  <h4 className="font-medium text-white mb-3">Google Gemini</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Este chat está potenciado por Google Gemini, un modelo de lenguaje avanzado optimizado para conversaciones y respuestas precisas.
                  </p>
                  <div className="flex flex-col gap-3 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Modelo:</span>
                      <span className="text-purple-300">Gemini Pro</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Context:</span>
                      <span className="text-purple-300">16K tokens</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Features */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                  Características
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-125 transition-transform"></div>
                    <span>Respuestas precisas sobre blockchain</span>
                  </li>
                  <li className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-125 transition-transform"></div>
                    <span>Información actualizada sobre criptomonedas</span>
                  </li>
                  <li className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-125 transition-transform"></div>
                    <span>Explicaciones sobre NFTs y DeFi</span>
                  </li>
                </ul>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeftSidebar;
