import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './Styles/index.css';

// Performance monitoring
const startTime = performance.now();

// Resource hints for critical assets
const addResourceHints = () => {
  // Preconnect to important domains
  const connections = [
    'https://gateway.pinata.cloud',
    'https://polygonscan.com',
    // 'https://polygon-rpc.com', // eliminado
  ];
  
  connections.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // Preload critical assets if needed
  const criticalAssets = [
    // Add critical resources when available
  ];
  
  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    Object.keys(asset).forEach(key => {
      link[key] = asset[key];
    });
    document.head.appendChild(link);
  });
};

// Initialize resource hints
addResourceHints();

// Initialize app with performance tracking
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove loading class when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure CSS transitions can work smoothly
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 100);
});

// Report initial load metrics
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  
  // Log performance metrics
  console.log(`App initialized in ${loadTime.toFixed(2)}ms`);
  
  // Report Web Vitals if needed (uncomment to use)
  // import('./utils/webVitals').then(({ reportWebVitals }) => {
  //   reportWebVitals(console.log);
  // });
  
  // Register service worker for production (if needed)
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  }
});

// Optional: Create a new file for web vitals monitoring
// c:\Users\lenny\OneDrive\Documentos\GitHub\nuvo-f\src\utils\webVitals.js
  
  // Register service worker for production (if needed)
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  };

// Optional: Create a new file for web vitals monitoring
// c:\Users\lenny\OneDrive\Documentos\GitHub\nuvo-f\src\utils\webVitals.js

