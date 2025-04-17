import React from 'react';
import { m } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

const NFTCallToAction = ({ onOpenModal }) => {
  return (
    <div className="py-16 pb-32 mb-20 relative overflow-visible">
      {/* Remove local background elements to use global space background */}
      
      <m.div 
        className="max-w-5xl mx-auto px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px 0px 0px 0px" }}
      >
        <m.div
          className="bg-gradient-to-br from-violet-900/50 to-indigo-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-fuchsia-500/30 shadow-xl" 
          animate={{ 
            boxShadow: [
              "0 0 20px 0 rgba(139, 92, 246, 0.1)",
              "0 0 20px 0 rgba(139, 92, 246, 0.3)",
              "0 0 20px 0 rgba(139, 92, 246, 0.1)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-3/5">
              <m.div 
                className="bg-fuchsia-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-fuchsia-400 text-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ 
                  y: [0, -10, 0],
                  boxShadow: [
                    "0 0 0 0 rgba(217, 70, 239, 0.2)",
                    "0 0 0 10px rgba(217, 70, 239, 0)",
                    "0 0 0 0 rgba(217, 70, 239, 0.2)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <FaRocket />
              </m.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-nuvo-gradient-text">Ready to Tokenize Your Assets?</h2>
              <p className="text-lg text-gray-300 mb-6">
                Join our waitlist to be notified when our asset tokenization platform launches. 
                Be among the first to bridge your physical world with digital possibilities.
              </p>
            </div>
            
            <div className="md:w-2/5 w-full">
              <button
                onClick={onOpenModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-lg text-white font-medium transition-all transform hover:scale-105"
              >
                Join Tokenization Waitlist
              </button>
            </div>
          </div>
        </m.div>
      </m.div>
    </div>
  );
};

export default NFTCallToAction;
