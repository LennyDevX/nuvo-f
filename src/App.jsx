import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { TokenizationProvider } from './context/TokenizationContext';
import { WalletProvider } from './context/WalletContext';
import { StakingProvider } from './context/StakingContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import router from './router';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WalletProvider>
          <TokenizationProvider>
            <StakingProvider>
              <RouterProvider router={router} />
            </StakingProvider>
          </TokenizationProvider>
        </WalletProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;