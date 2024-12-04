import React, { useEffect } from 'react';
import Navbar from './header/Navbar';
import Home from './layout/Home';
import SwapToken from './layout/SwapToken';
import About from './layout/About';
import TokenomicsDashboard from './layout/TokenomicsDashboard/TokenomicsDashboard';





import { StakingProvider } from './context/StakingContext';




import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext'; // Importa el WalletProvider
import DashboardStaking from './layout/DashboardStaking/DashboardStaking'; // Importa el componente InfoAccount

const App = () => {


  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    const initialTheme = savedTheme ? JSON.parse(savedTheme) : true; // Set dark as default
    document.documentElement.classList.toggle('is-dark', initialTheme);
    document.documentElement.classList.toggle('is-light', !initialTheme);
  }, []);
  
  return (
    <Router> 
          <WalletProvider>
            <StakingProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tokenomics" element={<TokenomicsDashboard />} />
                <Route path="/staking" element={<DashboardStaking />} />
                <Route path="/swaptoken" element={<SwapToken />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </StakingProvider>
          </WalletProvider>
    </Router>
  );
}

export default App;
