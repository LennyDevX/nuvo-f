import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that tracks whether an element is in the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {Number} options.threshold - Percentage of element visibility to trigger (0-1)
 * @param {String} options.rootMargin - Margin around the root element
 * @returns {Array} [ref, isInView] - Reference to attach to element and boolean if in view
 */
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Update state when intersection status changes
      setIsInView(entry.isIntersecting);
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px',
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isInView];
};

export default useInView;
