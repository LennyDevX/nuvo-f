// src/components/App.jsx
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router/config';
import ErrorBoundary from './ui/ErrorBoundary';
import LoadingSpinner from './LoadOverlay/LoadingSpinner';
import routePrefetcher from '../utils/routePrefetcher';

const App = () => {
  // Initialize route prefetcher after first render
  useEffect(() => {
    // Delay prefetcher initialization to prioritize initial render
    const timer = setTimeout(() => {
      routePrefetcher.init();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <RouterProvider 
          router={router}
          hydrateFallback={<LoadingSpinner size="large" message="Initializing..." />}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;