import React from 'react';
import Navbar from './header/Navbar';
import HeroSection from './layout/HeroSection';
import RegistrationForm from './forms/RegisterForm';
import LoginForm from './forms/LoginForm';
import Home from './layout/Home';
import CardNft from './layout/CardNft';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext'; // Importa el WalletProvider
import "../Styles/App.css";

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
              <Route path="/dashboard" element={<Home />} />
              <Route path="/nft" element={<CardNft />} />

            </Routes>
          </WalletProvider>

        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
