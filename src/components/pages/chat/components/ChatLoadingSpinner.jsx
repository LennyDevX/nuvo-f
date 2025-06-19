import React from 'react';
import { motion as m } from 'framer-motion';

const ChatLoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
      <m.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-20 h-20 mb-4">
          {/* Outer Ring */}
          <m.div
            className="absolute inset-0 border-4 border-purple-500/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          />
          
          {/* Inner Ring */}
          <m.div
            className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          />
          
          {/* Center Dot */}
          <m.div 
            className="absolute inset-0 m-auto w-4 h-4 bg-purple-500/80 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        
        <m.p 
          className="text-purple-300 text-lg font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading Nuvos AI...
        </m.p>
      </m.div>
    </div>
  );
};

export default ChatLoadingSpinner;
