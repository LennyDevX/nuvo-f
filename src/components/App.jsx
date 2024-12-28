// src/components/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router/config';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadOverlay/LoadingSpinner';

const App = () => {
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