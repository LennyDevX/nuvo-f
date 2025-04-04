import React from 'react';
import { m } from 'framer-motion';
import '../../Styles/spaceBackground.css';

const SpaceBackground = ({ customClass = "" }) => {
  return (
    <div className={`fixed inset-0 z-0 ${customClass}`}>
      <div className="space-background absolute inset-0">
        <div className="stars-container">
          <div className="stars tiny-stars"></div>
          <div className="stars small-stars"></div>
          <div className="stars medium-stars"></div>
          <div className="stars bright-stars"></div>
          <div className="nebula-effect"></div>
          
          {/* Standard constellations */}
          <div className="constellation constellation-1"></div>
          <div className="constellation constellation-2"></div>
          <div className="constellation constellation-3"></div>
          <div className="constellation constellation-4"></div>
          <div className="constellation constellation-5"></div>
          <div className="constellation constellation-6"></div>
          <div className="constellation constellation-7"></div>
          
          {/* Additional custom constellations */}
          <div className="custom-constellation" style={{ top: '45%', left: '65%', animation: 'starPulse 5.5s infinite 0.7s' }}></div>
          <div className="custom-constellation" style={{ top: '70%', left: '30%', animation: 'starPulse 4.5s infinite 1.5s' }}></div>
          <div className="custom-constellation" style={{ top: '85%', left: '55%', animation: 'starPulse 6s infinite 0.3s' }}></div>
        </div>
      </div>
      
      {/* Enhanced fluid accents */}
      <m.div 
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.1, 0.2, 0.1],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      <m.div 
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1], 
          opacity: [0.1, 0.15, 0.1],
          x: [0, -30, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 18, delay: 2, repeat: Infinity, repeatType: "reverse" }}
      />
    </div>
  );
};

export default SpaceBackground;
