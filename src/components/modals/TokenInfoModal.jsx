import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaChartLine, FaTools } from 'react-icons/fa';

const TokenInfoModal = ({ isOpen, onClose }) => {
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
        <div className="absolute inset-0" onClick={onClose}></div>
        
        <motion.div 
          className="bg-gray-900 border border-purple-500/30 rounded-xl w-full max-w-4xl my-8 relative"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gray-900 border-b border-purple-500/30 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold gradient-text">NUVOS Token Ecosystem</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-purple-500/10 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
            {/* Benefits Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FaCheckCircle className="text-purple-400 text-xl mr-3" />
                <h3 className="text-xl font-semibold text-white">Token Benefits</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                {[
                  "Reduced fees across the Nuvos Cloud platform",
                  "Priority access to new features and services",
                  "Staking rewards for token holders",
                  "Voting rights on platform development decisions",
                  "Access to exclusive community events and webinars"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <p className="text-gray-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Use Cases Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-purple-400 text-xl mr-3" />
                <h3 className="text-xl font-semibold text-white">Current Use Cases</h3>
              </div>
              <div className="pl-8 space-y-4">
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-medium text-purple-300 mb-2">Service Payments</h4>
                  <p className="text-gray-300">Use NUVOS tokens to pay for cloud services, storage, and computing resources at discounted rates compared to traditional payment methods.</p>
                </div>
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-medium text-purple-300 mb-2">Staking & Governance</h4>
                  <p className="text-gray-300">Stake your tokens to earn passive rewards and gain voting power on key platform decisions and future development priorities.</p>
                </div>
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-medium text-purple-300 mb-2">Developer Incentives</h4>
                  <p className="text-gray-300">Developers building on Nuvos Cloud receive token rewards for contributions to the ecosystem, creating a vibrant community of builders.</p>
                </div>
              </div>
            </div>
            
            {/* Upcoming Updates Section */}
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <FaTools className="text-purple-400 text-xl mr-3" />
                <h3 className="text-xl font-semibold text-white">Upcoming Updates</h3>
              </div>
              <div className="pl-8">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="min-w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full mr-3 text-sm text-purple-300 font-medium">Q3</div>
                    <div>
                      <h4 className="text-white font-medium">Cross-Chain Integration</h4>
                      <p className="text-gray-400">Enabling NUVOS token functionality across multiple blockchain networks for enhanced liquidity and accessibility.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full mr-3 text-sm text-purple-300 font-medium">Q4</div>
                    <div>
                      <h4 className="text-white font-medium">DeFi Integration Suite</h4>
                      <p className="text-gray-400">Launch of lending, borrowing, and yield farming capabilities using NUVOS tokens within our ecosystem.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full mr-3 text-sm text-purple-300 font-medium">Q1</div>
                    <div>
                      <h4 className="text-white font-medium">Enterprise Token Solutions</h4>
                      <p className="text-gray-400">Expanded B2B services allowing enterprises to leverage NUVOS tokens for secure, efficient business operations.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-purple-500/30 px-6 py-4 flex justify-end sticky bottom-0 bg-gray-900">
            <button 
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TokenInfoModal;
