import React from 'react';
import Navbar from '../header/Navbar';
import Footer from './Footer';
import { WalletProvider } from '../context/WalletContext';
import { StakingProvider } from '../context/StakingContext';

const MainLayout = ({ children, showFooter = false }) => {
  return (
    <WalletProvider>
      <StakingProvider>
        <div>
          <Navbar />
          {children}
          {showFooter && <Footer />}
        </div>
      </StakingProvider>
    </WalletProvider>
  );
};

export default MainLayout;
