import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { TokenizationProvider } from './context/TokenizationContext';
import { WalletProvider } from './context/WalletContext';
import { StakingProvider } from './context/StakingContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import router from './router';
import ChatContainer from './components/ChatContainer';
import './styles/App.css';

function App() {
  // Fix for mobile viewport issue
  useEffect(() => {
    // Set the viewport height to fix mobile browser issues
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set on initial load
    setVh();

    // Update on resize
    window.addEventListener('resize', setVh);
    
    // Clean up
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <WalletProvider>
          <TokenizationProvider>
            <StakingProvider>
              <div className="app">
                <header className="app-header">
                  <h1>Nuvos AI Assistant</h1>
                </header>
                <main className="app-main">
                  <ChatContainer />
                  <RouterProvider router={router} />
                </main>
              </div>
            </StakingProvider>
          </TokenizationProvider>
        </WalletProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;