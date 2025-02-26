import { useState, useEffect } from 'react';

/**
 * Custom hook that detects if the user prefers reduced motion
 * @returns {boolean} True if the user prefers reduced motion
 */
export default function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      // Get initial value
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Define a callback for changes
      const handleChange = (e) => {
        setPrefersReducedMotion(e.matches);
      };
      
      // Add the callback as a listener
      mediaQuery.addEventListener('change', handleChange);
      
      // Clean up
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return prefersReducedMotion;
}
