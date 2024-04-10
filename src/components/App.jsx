import React from 'react';
import Navbar from './header/Navbar';
import Home from './layout/Home';
import RegistrationForm from './forms/RegisterForm';
import LoginForm from './forms/LoginForm';
import CardNft from './layout/CardNft';
import SwapToken from './layout/SwapToken';
import InfoGovernance from "./layout/InfoGovernance"
import About from './layout/About';
import Propose from "./layout/Propose"
import ExecuteProposal from './layout/executeProposal';
import Vote from './layout/Vote';


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
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<RegistrationForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/staking" element={<InfoAccount />} />
              <Route path="/swaptoken" element={<SwapToken />} />
              <Route path="/nft" element={<CardNft />} />
              <Route path="/about" element={<About />} />
              <Route path="/governance" element={<InfoGovernance />} />
              <Route path="/propose" element={<Propose />} />
              <Route path="/executepropose" element={<ExecuteProposal />} />
              <Route path="/vote" element={<Vote />} />





            </Routes>
          </WalletProvider>

        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
