import React, { Suspense, useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadOverlay/LoadingSpinner';

// Enhanced withSuspense with delayed loading state and timeout handling
export const withSuspense = (component, options = {}) => {
  const {
    delay = 200,             // Delay showing the loader to prevent flash
    timeout = 10000,         // Timeout after which we show a warning
    fallback = null          // Custom fallback component
  } = options;
  
  return (
    <ProgressiveSuspense 
      delay={delay} 
      timeout={timeout}
      fallback={fallback}
    >
      {component}
    </ProgressiveSuspense>
  );
};

// Component that progressively shows loading states
const ProgressiveSuspense = ({ children, delay, timeout, fallback }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    // Delay showing the loader to prevent flashing for fast loads
    const loaderTimer = setTimeout(() => {
      setShowLoader(true);
    }, delay);
    
    // Show timeout message if loading takes too long
    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);
    
    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(timeoutTimer);
    };
  }, [delay, timeout]);
  
  // Component to render during loading
  const LoadingFallback = () => {
    if (!showLoader) {
      // Initial state - empty to avoid flash
      return null;
    }
    
    if (showTimeout) {
      // Timeout state - show with warning
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
          <LoadingSpinner size="default" />
          <p className="text-amber-500 mt-4 text-center">
            Still loading... This is taking longer than expected.
          </p>
        </div>
      );
    }
    
    // Normal loading state
    return fallback || <LoadingSpinner size="default" />;
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {React.Children.map(children, (child, index) => 
        React.isValidElement(child) ? 
          React.cloneElement(child, { 
            key: child.key || `progressive-suspense-item-${index}`
          }) : 
          child
      )}
    </Suspense>
  );
};
