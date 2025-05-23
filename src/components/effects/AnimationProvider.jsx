import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useDeviceDetection } from '../../hooks/mobile/useDeviceDetection';

// Animation context
export const AnimationContext = createContext({
  animationsEnabled: true,
  toggleAnimations: () => {},
  isLowPerformance: false
});

export const useAnimations = () => useContext(AnimationContext);

export const AnimationProvider = ({ children }) => {
  // Get device information using the recommended API
  const { isLowPerformance } = useDeviceDetection();
  
  // Default to enabling animations unless we detect a low-performance device
  const [animationsEnabled, setAnimationsEnabled] = useState(
    !isLowPerformance
  );

  // Apply animation settings
  useEffect(() => {
    // Set a CSS class on the document root to control animations globally
    if (animationsEnabled) {
      document.documentElement.classList.remove('reduced-motion');
    } else {
      document.documentElement.classList.add('reduced-motion');
    }
    
    // Also respect user's system preference for reduced motion
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mediaQuery?.matches) {
      document.documentElement.classList.add('reduced-motion');
    }
    
    // Listen for changes in user preference
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else if (animationsEnabled) {
        document.documentElement.classList.remove('reduced-motion');
      }
    };
    
    mediaQuery?.addEventListener('change', handleChange);
    return () => mediaQuery?.removeEventListener('change', handleChange);
  }, [animationsEnabled]);

  // Toggle animations function
  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    animationsEnabled,
    toggleAnimations,
    isLowPerformance
  }), [animationsEnabled, isLowPerformance]);

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};
