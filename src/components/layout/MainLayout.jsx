import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { TokenizationProvider } from '../../context/TokenizationContext';
import { WalletProvider } from '../../context/WalletContext';
import { StakingProvider } from '../../context/StakingContext';

const MainLayout = ({ children, showFooter = false }) => {
  return (
    <WalletProvider>
      <TokenizationProvider>
        {/* The TokenizationProvider is wrapped around the StakingProvider to ensure that the tokenization context is available to all components */} 
      <StakingProvider>
        <div>
          <Navbar />
          {children}
          {showFooter && <Footer />}
        </div>
      </StakingProvider>
      </TokenizationProvider>
    </WalletProvider>
  );
};

export default MainLayout;
