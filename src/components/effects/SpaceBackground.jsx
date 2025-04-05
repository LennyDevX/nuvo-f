import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import '../../Styles/spaceBackground.css';

const SpaceBackground = ({ customClass = "" }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 
                 ('ontouchstart' in window) ||
                 (navigator.maxTouchPoints > 0));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simplified animation properties for mobile
  const mobileAnimationProps = {
    duration: 30,         // Slower animations
    repeatDelay: 5,       // Add delay between repeats
    ease: "linear"        // Simpler easing function
  };

  return (
    <div className={`fixed inset-0 z-0 ${customClass}`}>
      {/* Simplified background for mobile */}
      <div className="space-background absolute inset-0">
        <div className={`stars-container ${isMobile ? 'mobile-optimized' : ''}`}>
          {/* On mobile, only render essential stars */}
          <div className="stars bright-stars"></div>
          
          {!isMobile && (
            <>
              <div className="stars tiny-stars"></div>
              <div className="stars small-stars"></div>
              <div className="stars medium-stars"></div>
              <div className="nebula-effect"></div>
              
              {/* Only render constellations on desktop */}
              <div className="constellation constellation-1"></div>
              <div className="constellation constellation-2"></div>
              <div className="constellation constellation-3"></div>
              <div className="constellation constellation-4"></div>
              <div className="constellation constellation-5"></div>
              <div className="constellation constellation-6"></div>
              <div className="constellation constellation-7"></div>
              
              {/* Additional custom constellations - desktop only */}
              <div className="custom-constellation" style={{ top: '45%', left: '65%', animation: 'starPulse 5.5s infinite 0.7s' }}></div>
              <div className="custom-constellation" style={{ top: '70%', left: '30%', animation: 'starPulse 4.5s infinite 1.5s' }}></div>
              <div className="custom-constellation" style={{ top: '85%', left: '55%', animation: 'starPulse 6s infinite 0.3s' }}></div>
            </>
          )}
        </div>
      </div>
      
      {/* Just one simple gradient on mobile */}
      {isMobile ? (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-black"></div>
      ) : (
        <>
          <m.div 
            className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.1, 0.2, 0.1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: isMobile ? mobileAnimationProps.duration : 15, 
              repeat: Infinity, 
              repeatType: "reverse",
              repeatDelay: isMobile ? mobileAnimationProps.repeatDelay : 0,
              ease: isMobile ? mobileAnimationProps.ease : "easeInOut" 
            }}
          />
          <m.div 
            className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.1, 0.15, 0.1],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ 
              duration: isMobile ? mobileAnimationProps.duration : 18, 
              delay: 2, 
              repeat: Infinity, 
              repeatType: "reverse",
              repeatDelay: isMobile ? mobileAnimationProps.repeatDelay : 0,
              ease: isMobile ? mobileAnimationProps.ease : "easeInOut"
            }}
          />
        </>
      )}
    </div>
  );
};

export default SpaceBackground;
