import React from 'react';
import { m } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

const NFTCallToAction = () => {
  return (
    <div className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-purple-900/10 to-black/10"></div>
      
      <m.div 
        className="max-w-5xl mx-auto px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="bg-gradient-to-br from-purple-900/40 to-black/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-purple-500/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-3/5">
              <m.div 
                className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-purple-400 text-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaRocket />
              </m.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Own Your First NUVOS NFT?</h2>
              <p className="text-lg text-gray-300 mb-6">
                Join our waitlist to be notified when the exclusive NUVOS NFT collection launches. 
                Be among the first to access our premium features and benefits.
              </p>
            </div>
            
            <div className="md:w-2/5 w-full">
              <m.div 
                className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20"
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 0 20px 0 rgba(168, 85, 247, 0.2)",
                  borderColor: "rgba(168, 85, 247, 0.4)"
                }}
              >
                <form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white" 
                      placeholder="your@email.com"
                    />
                  </div>
                  <m.button 
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Join Waitlist
                  </m.button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    You'll be the first to know when our NFTs are available
                  </p>
                </form>
              </m.div>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
};

// Asegúrate de incluir esta exportación default
export default NFTCallToAction;
