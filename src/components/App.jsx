import React from 'react';
import Navbar from './header/Navbar';
import HeroSection from './layout/HeroSection';
import RegistrationForm from './forms/RegisterForm';
import LoginForm from './forms/LoginForm';
import CardNft from './layout/CardNft';
import SwapToken from './layout/SwapToken';


import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext'; // Importa el WalletProvider
import InfoAccount from './layout/InfoAccount';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
        <WalletProvider>
          <Navbar />
            <Routes>
              <Route path="/" element={<HeroSection />} />
              <Route path="/signup" element={<RegistrationForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/dashboard" element={<InfoAccount />} />
              <Route path="/swaptoken" element={<SwapToken />} />
              <Route path="/nft" element={<CardNft />} />

            </Routes>
          </WalletProvider>

        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
