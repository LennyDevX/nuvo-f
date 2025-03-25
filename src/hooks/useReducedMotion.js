import { useEffect, useState } from 'react';

/**
 * Custom hook that checks if the user prefers reduced motion
 * @returns {Boolean} Whether reduced motion is preferred
 */
const useReducedMotion = () => {
  // Default to false to ensure animations work when query isn't supported
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener (with browser compatibility)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      // Clean up
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
      // Clean up
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

export default useReducedMotion;
