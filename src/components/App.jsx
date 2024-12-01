import React, { useEffect } from 'react';
import Navbar from './header/Navbar';
import Home from './layout/Home';
import RegistrationForm from './forms/RegisterForm';
import LoginForm from './forms/LoginForm';
import SwapToken from './layout/SwapToken';

import { StakingProvider } from './context/StakingContext';


import About from './layout/About';
import Vote from './layout/Vote';


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
                <Route path="/signup" element={<RegistrationForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/staking" element={<InfoAccount />} />
                <Route path="/swaptoken" element={<SwapToken />} />
                <Route path="/about" element={<About />} />
                <Route path="/vote" element={<Vote />} />
              </Routes>
            </StakingProvider>
          </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
