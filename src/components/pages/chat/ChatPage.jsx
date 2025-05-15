import React, { useState, useContext, useEffect, useCallback } from 'react';
import SpaceBackground from '../../effects/SpaceBackground';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import { useTokenization } from '../../../context/TokenizationContext';
import RefreshManager from '../../DevUtils/RefreshManager';

// Import styles for chat text optimization
import '../../../Styles/chat.css';

// Import modular components
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ChatContainer from './components/ChatContainer';
import ChatLoadingSpinner from './components/ChatLoadingSpinner';

const ChatPage = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { account, walletConnected, balance, network } = useContext(WalletContext);
  const { state: stakingState, refreshUserInfo } = useStaking();
  const { nfts, nftsLoading, updateUserAccount } = useTokenization();
  
  // Update TokenizationContext with current user account
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
  }, [account, updateUserAccount]);
  
  // Log para depuración
  useEffect(() => {
    console.log('ChatPage se ha montado/actualizado:', new Date().toLocaleTimeString());
    // Esta línea es crítica para identificar problemas de renderizado
    console.log('Estado de sidebars:', { leftSidebarOpen, rightSidebarOpen });
  }, [leftSidebarOpen, rightSidebarOpen]);
  
  // Fetch user staking info when account changes
  useEffect(() => {
    if (walletConnected && account) {
      console.log("Refreshing staking info for account:", account);
      refreshUserInfo(account);
    }
  }, [account, walletConnected, refreshUserInfo]);
  
  // Close right sidebar on mobile automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRightSidebarOpen(false);
      } else {
        // On desktop, automatically open the right sidebar
        setRightSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate loading completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show loading spinner for 1.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle functions for sidebars
  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  // Get staking data with better error handling
  const userDeposits = stakingState?.userDeposits || [];
  const depositCount = Array.isArray(userDeposits) ? userDeposits.length : 0;
  const pendingRewards = stakingState?.stakingStats?.pendingRewards || '0';
  const stakingStats = stakingState?.stakingStats || {};

  return (
    <>
      <SpaceBackground starDensity="low" />
      {/* Componente para ayudar con problemas de actualización */}
      <RefreshManager />
      
      {isLoading && <ChatLoadingSpinner />}
      
      {/* Contenedor principal - ocupando todo el espacio disponible sin espacios adicionales */}
      <div className="fixed inset-0 pt-[var(--header-height)] z-10">
        <div className="w-full h-full flex overflow-hidden">
          {/* Left Sidebar - Extensions & Tools */}
          <LeftSidebar 
            isOpen={leftSidebarOpen} 
            toggleSidebar={toggleLeftSidebar} 
          />

          {/* Main Chat Area */}
          <ChatContainer 
            leftSidebarOpen={leftSidebarOpen}
            rightSidebarOpen={rightSidebarOpen}
            toggleLeftSidebar={toggleLeftSidebar}
            toggleRightSidebar={toggleRightSidebar}
          />

          {/* Right Sidebar - User Profile */}
          <RightSidebar 
            isOpen={rightSidebarOpen}
            toggleSidebar={toggleRightSidebar}
            walletConnected={walletConnected}
            account={account}
            network={network}
            balance={balance}
            nfts={nfts}
            nftsLoading={nftsLoading}
            userDeposits={userDeposits}
            depositCount={depositCount}
            pendingRewards={pendingRewards}
            stakingStats={stakingStats}
          />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
