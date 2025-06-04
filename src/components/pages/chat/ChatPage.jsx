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
  const { account, walletConnected, balance, network } = useContext(WalletContext);
  const { state: stakingState, refreshUserInfo } = useStaking();
  const { nfts, nftsLoading, updateUserAccount } = useTokenization();
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  const [containerRef, isContainerVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Update user account when account changes
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
  }, [account, updateUserAccount]);
  
  // Fetch staking info when account changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchStakingInfo = async () => {
      if (walletConnected && account && isMounted) {
        await refreshUserInfo(account);
      }
    };
    
    fetchStakingInfo();
    
    return () => {
      isMounted = false;
    };
  }, [account, walletConnected, refreshUserInfo]);
  
  // Handle window resize for responsive sidebar behavior
  const handleResize = useThrottle(() => {
    // Auto-close sidebars on mobile
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

  // Sidebar toggle functions
  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen(prev => !prev);
    setRightSidebarOpen(false);
  }, []);
  
  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen(prev => !prev);
    setLeftSidebarOpen(false);
  }, []);

  // Process staking data
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
  }, [stakingState]);

  // Performance props to pass to children
  const performanceProps = useMemo(() => ({
    shouldReduceMotion,
    isLowPerformance
  }), [shouldReduceMotion, isLowPerformance]);

  return (
    <>
      {/* Full screen background - reduced opacity for better readability */}
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
      
      {/* Main container - no padding top needed for mobile-first design */}
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
                walletConnected={walletConnected}
                account={account}
                network={network}
                balance={balance}
                nfts={nfts}
                nftsLoading={nftsLoading}
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
