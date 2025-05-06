import React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPuzzlePiece, FaCode, FaRobot, FaChevronRight } from 'react-icons/fa';

const LeftSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute md:relative z-30 w-72 h-full bg-gray-900/40 backdrop-blur-xl border-r border-purple-500/20 shadow-xl overflow-y-auto"
        >
          {/* Added top padding and better spacing throughout */}
          <div className="p-6 pt-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <FaPuzzlePiece className="text-purple-400" /> Extensions
              </h2>
              <button 
                onClick={toggleSidebar}
                className="p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/50 backdrop-blur-sm text-gray-400 hover:text-white transition-colors"
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Tools Section - For future extensions */}
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
            
            {/* Model Information - More spacious layout */}
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
            
            {/* Features - Improved spacing */}
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

            {/* Mobile Close Button */}
            <div className="mt-10 md:hidden">
              <button 
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/40 backdrop-blur-sm hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
              >
                <FaChevronRight className="text-xs" /> 
                <span>Cerrar panel</span>
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default LeftSidebar;
