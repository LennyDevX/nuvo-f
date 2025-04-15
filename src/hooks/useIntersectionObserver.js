import { useState, useEffect, useRef } from 'react';

export default function useIntersectionObserver({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false
}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const targetRef = useRef(null);
  
  useEffect(() => {
    const currentTarget = targetRef.current;
    
    // Skip if we've already triggered once and triggerOnce is true
    if (triggerOnce && hasTriggered) return;
    
    // Skip if IntersectionObserver isn't supported
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      if (triggerOnce) setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && triggerOnce) {
          setHasTriggered(true);
          // Disconnect immediately if triggerOnce is true
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [root, rootMargin, threshold, triggerOnce, hasTriggered]);

  return { ref: targetRef, isIntersecting, hasTriggered };
}
