import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useInView from '../../hooks/useInView';

/**
 * Component that lazy loads its children when it comes into view
 */
const LazyLoadSection = ({ 
  children, 
  placeholder, 
  className = "", 
  threshold = 0.1,
  rootMargin = "100px 0px", // Load a bit before it comes into view
  animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }
}) => {
  const [ref, isInView] = useInView({ threshold, rootMargin });
  const [hasRendered, setHasRendered] = useState(false);
  
  // Once it comes into view, we always want to keep it rendered
  useEffect(() => {
    if (isInView && !hasRendered) {
      setHasRendered(true);
    }
  }, [isInView, hasRendered]);

  return (
    <div ref={ref} className={className}>
      {hasRendered ? (
        <motion.div {...animationProps}>
          {children}
        </motion.div>
      ) : (
        placeholder || (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
          </div>
        )
      )}
    </div>
  );
};

export default LazyLoadSection;
