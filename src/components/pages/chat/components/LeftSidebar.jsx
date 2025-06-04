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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <m.div
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gray-900 border-r border-purple-500/20 z-[200] md:z-[300] shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="bg-gray-800 border-b border-purple-500/20 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FaPuzzlePiece className="text-purple-400" /> AI Tools
              </h2>
              <button 
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 h-full overflow-y-auto bg-gray-900">
              {/* Tools Section */}
              <div className="mb-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Available Tools</h3>
                <div className="space-y-3">
                  <div className="bg-gray-800 border border-purple-500/20 p-4 rounded-xl hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                        <FaCode className="text-purple-400 text-lg" />
                      </div>
                      <span className="text-white font-medium">Code Assistant</span>
                    </div>
                    <div className="text-xs bg-yellow-600/20 text-yellow-300 px-3 py-1.5 rounded-full inline-block">
                      Coming soon
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 border border-purple-500/20 p-4 rounded-xl hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                        <FaRobot className="text-purple-400 text-lg" />
                      </div>
                      <span className="text-white font-medium">Image Generator</span>
                    </div>
                    <div className="text-xs bg-yellow-600/20 text-yellow-300 px-3 py-1.5 rounded-full inline-block">
                      Coming soon
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Model Information */}
              <div className="mb-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                  AI Model Info
                </h3>
                <div className="bg-gray-800 border border-purple-500/20 p-4 rounded-xl">
                  <h4 className="font-medium text-white mb-3">Google Gemini Pro</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Advanced language model optimized for blockchain and crypto conversations with real-time information.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-purple-300">Gemini Pro</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Context:</span>
                      <span className="text-purple-300">32K tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Streaming:</span>
                      <span className="text-green-300">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Features */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                  Capabilities
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Blockchain technology explanations</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Cryptocurrency market insights</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>NFT and DeFi protocols</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Smart contract guidance</span>
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
