import React, { useEffect } from 'react';
import Navbar from './header/Navbar';
import Home from './layout/Home';
import SwapToken from './layout/SwapToken';

import { StakingProvider } from './context/StakingContext';


import About from './layout/About';


import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext'; // Importa el WalletProvider
import InfoAccount from './layout/InfoAccount';

const App = () => {


  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    const initialTheme = savedTheme ? JSON.parse(savedTheme) : true; // Set dark as default
    document.documentElement.classList.toggle('is-dark', initialTheme);
    document.documentElement.classList.toggle('is-light', !initialTheme);
  }, []);
  
  return (
    <Router> 
      <AuthProvider>
w          <WalletProvider>
            <StakingProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/staking" element={<InfoAccount />} />
                <Route path="/swaptoken" element={<SwapToken />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </StakingProvider>
          </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
