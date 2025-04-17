import React from 'react';
import { motion as m } from 'framer-motion';
import { FaWallet } from 'react-icons/fa';

const NotConnectedMessage = ({ title = 'Connect Wallet', message = 'Please connect your wallet to continue.' }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <m.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-8"
        animate={{ 
          boxShadow: [
            '0 0 0 0 rgba(139, 92, 246, 0.3)',
            '0 0 0 20px rgba(139, 92, 246, 0)',
            '0 0 0 0 rgba(139, 92, 246, 0.3)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <FaWallet className="text-white text-4xl" />
      </m.div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
      
      <p className="text-gray-300 max-w-md mx-auto mb-10 text-lg">{message}</p>
      
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 max-w-md text-left">
        <h3 className="text-lg font-medium text-white mb-3">How to connect:</h3>
        <ol className="space-y-4 text-purple-200">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-sm font-medium text-white">1</span>
            <span>Click the "Connect Wallet" button in the top-right corner of the navigation bar.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-sm font-medium text-white">2</span>
            <span>Select your preferred wallet provider (MetaMask or TrustWallet).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-sm font-medium text-white">3</span>
            <span>Confirm the connection in your wallet and you're ready to go!</span>
          </li>
        </ol>
      </div>
    </m.div>
  );
};

export default NotConnectedMessage;
