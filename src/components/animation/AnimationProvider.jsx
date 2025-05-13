import React, { createContext, useContext } from 'react';
import { LazyMotion, domAnimation, AnimatePresence, MotionConfig } from 'framer-motion';
import useReducedMotion from '../../hooks/performance/useReducedMotion';

// Animation defaults
const DEFAULT_DURATION = 0.4;
const DEFAULT_EASE = [0.25, 0.1, 0.25, 1.0];

// Create context for animation settings
export const AnimationContext = createContext({
  reducedMotion: false,
  enableAnimations: true
});

export const useAnimationContext = () => useContext(AnimationContext);

const AnimationProvider = ({ children }) => {
  // Use our custom hook instead of accepting reducedMotion as a prop
  const prefersReducedMotion = useReducedMotion();

  // Create animation context value
  const contextValue = {
    reducedMotion: prefersReducedMotion,
    enableAnimations: !prefersReducedMotion
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user" transition={{ 
          duration: DEFAULT_DURATION, 
          ease: DEFAULT_EASE 
        }}>
          {/* Change mode from "wait" to "sync" to allow multiple animations */}
          <AnimatePresence mode="sync">
            {children}
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </AnimationContext.Provider>
  );
};

export default AnimationProvider;
