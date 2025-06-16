import React, { useState, useContext, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import SpaceBackground from '../../effects/SpaceBackground';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import { useTokenization } from '../../../context/TokenizationContext';
import { useAnimationConfig } from '../../../components/animation/AnimationProvider';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';
import memoWithName from '../../../utils/performance/memoWithName'; 
import { useThrottle } from '../../../hooks/performance/useEventOptimizers';
import { FaBars, FaUser } from 'react-icons/fa';
import { logger } from '../../../utils/debug/logger';

// Import styles for chat
import '../../../Styles/chat.css';

// Lazy load components
const LeftSidebar = lazy(() => import('./components/LeftSidebar'));
const RightSidebar = lazy(() => import('./components/RightSidebar'));
const ChatContainer = lazy(() => import('./components/ChatContainer'));
const ChatLoadingSpinner = lazy(() => import('./components/ChatLoadingSpinner'));

// Simple loader for suspense
const ComponentLoader = () => (
  <div className="flex items-center justify-center h-full w-full bg-gray-900/30">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ChatPage = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Destructure WalletContext properly to prevent re-renders
  const walletContextValue = useContext(WalletContext);
  const { account, walletConnected, balance, network } = walletContextValue || {};
  
  const { state: stakingState, refreshUserInfo } = useStaking();
  const { nfts, nftsLoading, updateUserAccount, error: nftError } = useTokenization();
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  const [containerRef, isContainerVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Debug NFT loading - UPDATED WITH SMART LOGGING
  useEffect(() => {
    if (walletConnected && account) {
      const nftInfo = {
        account: account.substring(0, 8) + '...',
        nftsLength: nfts?.length || 0,
        nftsLoading,
        hasError: !!nftError
      };
      
      // Only log when NFT data actually changes
      logger.logOnChange('NFT', 'chat_page_nfts', nftInfo);
    }
  }, [account, walletConnected, nfts?.length, nftsLoading, nftError]);
  
  // Update user account when account changes - UPDATED LOGGING
  useEffect(() => {
    let isMounted = true;
    
    if (account && walletConnected && updateUserAccount && isMounted) {
      logger.debug('NFT', 'Updating user account for chat');
      updateUserAccount(account);
    }
    
    return () => {
      isMounted = false;
    };
  }, [account, walletConnected, updateUserAccount]);
  
  // Fetch staking info when account changes - UPDATED LOGGING
  useEffect(() => {
    let isMounted = true;
    
    const fetchStakingInfo = async () => {
      if (walletConnected && account && refreshUserInfo && isMounted) {
        try {
          await refreshUserInfo(account);
          logger.debug('STAKING', 'Staking info refreshed for chat');
        } catch (error) {
          logger.error('STAKING', 'Error fetching staking info for chat', error.message);
        }
      }
    };
    
    fetchStakingInfo();
    
    return () => {
      isMounted = false;
    };
  }, [account, walletConnected, refreshUserInfo]);
  
  // Handle window resize for responsive sidebar behavior
  const handleResize = useThrottle(() => {
    if (window.innerWidth < 768) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  }, 250);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Simulate short loading time
  useEffect(() => {
    const loadTime = isLowPerformance ? 600 : 1000;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadTime);
    
    return () => clearTimeout(timer);
  }, [isLowPerformance]);

  // Sidebar toggle functions - stable references
  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen(prev => !prev);
    setRightSidebarOpen(false);
  }, []);
  
  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen(prev => !prev);
    setLeftSidebarOpen(false);
  }, []);

  // Process staking data - memoized with stable dependencies
  const stakingData = useMemo(() => {
    const userDeposits = stakingState?.userDeposits || [];
    const depositCount = Array.isArray(userDeposits) ? userDeposits.length : 0;
    const pendingRewards = stakingState?.stakingStats?.pendingRewards || '0';
    const stakingStats = stakingState?.stakingStats || {};
    
    return {
      userDeposits,
      depositCount,
      pendingRewards,
      stakingStats
    };
  }, [stakingState?.userDeposits, stakingState?.stakingStats]);

  // Performance props to pass to children - stable reference
  const performanceProps = useMemo(() => ({
    shouldReduceMotion,
    isLowPerformance
  }), [shouldReduceMotion, isLowPerformance]);

  // Wallet props - stable reference
  const walletProps = useMemo(() => ({
    walletConnected: Boolean(walletConnected),
    account: account || null,
    network: network || null,
    balance: balance || '0'
  }), [walletConnected, account, network, balance]);

  // NFT props - stable reference
  const nftProps = useMemo(() => ({
    nfts: nfts || [],
    nftsLoading: Boolean(nftsLoading)
  }), [nfts, nftsLoading]);

  return (
    <>
      {/* Full screen background */}
      <div className="fixed inset-0 z-0 bg-white dark:bg-gray-900">
        <SpaceBackground 
          starDensity={isLowPerformance ? "minimal" : "low"} 
          animationDisabled={shouldReduceMotion || isLowPerformance}
          opacity={0.3}
        />
      </div>
      
      {/* Loading screen */}
      {isLoading && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50" />}>
          <ChatLoadingSpinner />
        </Suspense>
      )}
      
      {/* Main container */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 z-10 md:pt-[var(--header-height)]"
      >
        {isContainerVisible && (
          <div className="w-full h-full flex overflow-hidden bg-white dark:bg-gray-900">
            {/* Sidebars */}
            <Suspense fallback={<ComponentLoader className="w-72 h-full" />}>
              <LeftSidebar 
                isOpen={leftSidebarOpen} 
                toggleSidebar={toggleLeftSidebar}
                {...performanceProps}
              />
            </Suspense>

            <Suspense fallback={<ComponentLoader />}>
              <ChatContainer 
                leftSidebarOpen={leftSidebarOpen}
                rightSidebarOpen={rightSidebarOpen}
                toggleLeftSidebar={toggleLeftSidebar}
                toggleRightSidebar={toggleRightSidebar}
                {...performanceProps}
              />
            </Suspense>

            <Suspense fallback={<ComponentLoader className="w-80 h-full" />}>
              <RightSidebar 
                isOpen={rightSidebarOpen}
                toggleSidebar={toggleRightSidebar}
                {...walletProps}
                {...nftProps}
                {...stakingData}
                {...performanceProps}
              />
            </Suspense>
          </div>
        )}
      </div>
    </>
  );
};

export default memoWithName(ChatPage);
