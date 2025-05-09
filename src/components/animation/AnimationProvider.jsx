import React, { createContext, useContext, useState, useEffect } from 'react';
import { LazyMotion, domAnimation, AnimatePresence, MotionConfig } from 'framer-motion';
import useReducedMotion from '../../hooks/performance/useReducedMotion';

// Create context for animation settings
export const AnimationContext = createContext({
  reducedMotion: false,
  enableAnimations: true
});

export const useAnimationContext = () => useContext(AnimationContext);

const AnimationProvider = ({ 
  children, 
  features = domAnimation
}) => {
  // Use our custom hook instead of accepting reducedMotion as a prop
  const prefersReducedMotion = useReducedMotion();
  const [enableAnimations, setEnableAnimations] = useState(true);
  
  // Check for device performance
  useEffect(() => {
    // Simple device capability detection
    const checkDevicePerformance = () => {
      // Check if device is low-end
      const isLowEnd = 
        navigator.hardwareConcurrency <= 4 || // 4 or fewer cores
        navigator.deviceMemory <= 4;          // 4GB or less RAM (only works in Chrome)
      
      // Disable animations on low-end devices
      if (isLowEnd) {
        setEnableAnimations(false);
      }
    };
    
    // Try to detect performance, but don't break if the API isn't available
    try {
      checkDevicePerformance();
    } catch (e) {
      console.log('Performance detection not available');
    }
  }, []);
  
  // Create animation context value
  const contextValue = {
    reducedMotion: prefersReducedMotion,
    enableAnimations: enableAnimations && !prefersReducedMotion
  };
  
  return (
    <AnimationContext.Provider value={contextValue}>
      <LazyMotion features={features}>
        <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "user"}>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </AnimationContext.Provider>
  );
};

export default AnimationProvider;
