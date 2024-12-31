import React, { Suspense } from 'react';
import LoadingSpinner from '../components/LoadOverlay/LoadingSpinner';

export const withSuspense = (component) => {
  return (
    <Suspense 
      fallback={<LoadingSpinner size="default" />}
      onError={(error) => {
        console.error('Lazy loading error:', error);
        return (
          <div className="text-center p-4">
            <p className="text-red-500">Error loading content</p>
          </div>
        );
      }}
    >
      {component}
    </Suspense>
  );
};
