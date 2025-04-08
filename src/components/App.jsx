// src/components/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router/config';
import ErrorBoundary from './ui/ErrorBoundary';
import LoadingSpinner from './LoadOverlay/LoadingSpinner';
import '../Styles/index.css'; // Fixed: Import CSS file directly without named export

/**
 * Main App component using React Router's data router with native prefetching
 */
const App = () => {
  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <RouterProvider 
          router={router}
          fallbackElement={<LoadingSpinner size="large" message="Loading application..." />}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;