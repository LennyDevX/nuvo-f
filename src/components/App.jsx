// src/components/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './header/Navbar';
import Home from './pages/home/Home';
import SwapToken from './pages/SwapToken';
import About from './pages/About';
import AirdropDashboard from './layout/AirdropDashboard/AirdropDashboard';
import TokenomicsDashboard from './layout/TokenomicsDashboard/TokenomicsDashboard';
import { StakingProvider } from './context/StakingContext';
import { WalletProvider } from './context/WalletContext';
import DashboardStaking from './layout/DashboardStaking/DashboardStaking';

const App = () => {
  const isDevelopment = import.meta.env.MODE === 'development';

  // Definir la configuración del router
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <WalletProvider>
          <StakingProvider>
            <div>
              <Navbar />
              <Home />
            </div>
          </StakingProvider>
        </WalletProvider>
      ),
    },
    {
      path: "/tokenomics",
      element: (
        <WalletProvider>
          <StakingProvider>
            <div>
              <Navbar />
              <TokenomicsDashboard />
            </div>
          </StakingProvider>
        </WalletProvider>
      ),
    },
    {
      path: "/staking",
      element: (
        <WalletProvider>
          <StakingProvider>
            <div>
              <Navbar />
              <DashboardStaking />
            </div>
          </StakingProvider>
        </WalletProvider>
      ),
    },
    {
      path: "/swaptoken",
      element: (
        <WalletProvider>
          <StakingProvider>
            <div>
              <Navbar />
              <SwapToken />
            </div>
          </StakingProvider>
        </WalletProvider>
      ),
    },
    {
      path: "/about",
      element: (
        <WalletProvider>
          <StakingProvider>
            <div>
              <Navbar />
              <About />
            </div>
          </StakingProvider>
        </WalletProvider>
      ),
    },
    {
      path: "/airdrops",
      element: (
        <WalletProvider>
          <StakingProvider>
            <div>
              <Navbar />
              <AirdropDashboard />
            </div>
          </StakingProvider>
        </WalletProvider>
      ),
    },
  ], {
    // Configuración adicional para React Router v7
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;