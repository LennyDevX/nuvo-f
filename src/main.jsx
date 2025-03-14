import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './Styles/index.css';

if (import.meta.env.DEV) {
  // Remove CSP meta tag in development to avoid image loading issues
  document.addEventListener('DOMContentLoaded', () => {
    const cspMetaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMetaTag) {
      cspMetaTag.remove();
      console.log('CSP meta tag removed for development');
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

