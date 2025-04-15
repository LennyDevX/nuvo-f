import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './index.css';

// Componente para manejar errores
const ErrorFallback = ({ error }) => (
  <div role="alert" className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-red-900/30 max-w-xl w-full rounded-lg p-6 border border-red-500/30 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
      <div className="text-red-400 p-3 rounded bg-red-500/10 mb-4 text-left overflow-auto">
        <pre>{error.message}</pre>
      </div>
      <button 
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);