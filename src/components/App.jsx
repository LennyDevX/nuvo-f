// src/components/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router/config';
import ErrorBoundary from './ui/ErrorBoundary';
import LoadingSpinner from './LoadOverlay/LoadingSpinner';
import '../Styles/spaceBackground.css'; // Ensure this is imported for global styles

/**
 * Main App component using React Router's data router with native prefetching
 */
const App = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <RouterProvider 
          router={router}
          fallbackElement={<LoadingSpinner size="large" message="Loading application..." />}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;