import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './Styles/index.css';
import { ToastProvider } from './context/ToastContext';

// Performance monitoring
const startTime = performance.now();

// Resource hints for critical assets
const addResourceHints = () => {
  // Preconnect to important domains
  const connections = [
    // Add domains your app connects to - examples:
    // 'https://fonts.googleapis.com',
    // 'https://api.yourdomain.com',
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
    // Add critical resources - examples:
    // { rel: 'preload', href: '/fonts/main-font.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    // { rel: 'modulepreload', href: '/assets/critical-module.js' },
  ];
  
  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    Object.entries(asset).forEach(([key, value]) => {
      link[key] = value;
    });
    document.head.appendChild(link);
  });
};

// Optimize loading in development
if (import.meta.env.DEV) {
  // Remove CSP meta tag in development to avoid image loading issues
  document.addEventListener('DOMContentLoaded', () => {
    const cspMetaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMetaTag) {
      cspMetaTag.remove();
      console.log('CSP meta tag removed for development');
    }
  });
} else {
  // Add resource hints in production
  addResourceHints();
}

// Add CSS class to body during initial load to prevent content jumps
document.body.classList.add('loading');

// Initialize app with performance tracking
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
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

