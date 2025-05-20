import React, { useState, useContext, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import SpaceBackground from '../../effects/SpaceBackground';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import { useTokenization } from '../../../context/TokenizationContext';
import { useAnimationConfig } from '../../../components/animation/AnimationProvider';
import RefreshManager from '../../DevUtils/RefreshManager';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';
import memoWithName from '../../../utils/performance/memoWithName'; 
import { useThrottle } from '../../../hooks/performance/useEventOptimizers';

// Import styles for chat text optimization
import '../../../Styles/chat.css';

// Lazy load components para mejorar carga inicial
const LeftSidebar = lazy(() => import('./components/LeftSidebar'));
const RightSidebar = lazy(() => import('./components/RightSidebar'));
const ChatContainer = lazy(() => import('./components/ChatContainer'));
const ChatLoadingSpinner = lazy(() => import('./components/ChatLoadingSpinner'));

// Componente fallback simple para Suspense
const ComponentLoader = ({ className = "w-full h-full" }) => (
  <div className={`flex items-center justify-center ${className} bg-gray-900/30`}>
    <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
);

const ChatPage = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { account, walletConnected, balance, network } = useContext(WalletContext);
  const { state: stakingState, refreshUserInfo } = useStaking();
  const { nfts, nftsLoading, updateUserAccount } = useTokenization();
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  // Referencia para observar visibilidad del contenedor principal
  const [containerRef, isContainerVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Update TokenizationContext with current user account (optimizado)
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
  }, [account, updateUserAccount]);
  
  // Remover logs de depuración en producción
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('ChatPage se ha montado/actualizado:', new Date().toLocaleTimeString());
    console.log('Estado de sidebars:', { leftSidebarOpen, rightSidebarOpen });
  }, [leftSidebarOpen, rightSidebarOpen]);
  
  // Fetch user staking info when account changes (optimizado con cleanup)
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
  
  // Close right sidebar on mobile automatically (con throttling)
  const handleResize = useThrottle(() => {
    if (window.innerWidth < 768) {
      setRightSidebarOpen(false);
    } else {
      // On desktop, automatically open the right sidebar
      setRightSidebarOpen(true);
    }
  }, 250);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Simulate loading completion (optimizado)
  useEffect(() => {
    // Reduce el tiempo de carga en dispositivos de bajo rendimiento
    const loadTime = isLowPerformance ? 800 : 1500;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadTime);
    
    return () => clearTimeout(timer);
  }, [isLowPerformance]);

  // Toggle functions for sidebars (memoizados)
  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen(prevState => !prevState);
  }, []);
  
  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen(prevState => !prevState);
  }, []);

  // Get staking data with better error handling (usando useMemo)
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

  // Propiedades optimizadas para componentes hijo
  const performanceProps = useMemo(() => ({
    shouldReduceMotion,
    isLowPerformance
  }), [shouldReduceMotion, isLowPerformance]);

  return (
    <>
      <SpaceBackground 
        starDensity={isLowPerformance ? "minimal" : "low"} 
        animationDisabled={shouldReduceMotion || isLowPerformance}
      />
      
      {/* Suspense loading para todo el contenido */}
      {isLoading && (
        <Suspense fallback={<div className="fixed inset-0 bg-gray-900/50" />}>
          <ChatLoadingSpinner />
        </Suspense>
      )}
      
      {/* Contenedor principal - usando ref para detección de visibilidad */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 pt-[var(--header-height)] z-10"
      >
        {isContainerVisible && (
          <div className="w-full h-full flex overflow-hidden">
            {/* Left Sidebar - Extensions & Tools */}
            <Suspense fallback={<ComponentLoader className="w-72 h-full" />}>
              <LeftSidebar 
                isOpen={leftSidebarOpen} 
                toggleSidebar={toggleLeftSidebar}
                {...performanceProps}
              />
            </Suspense>

            {/* Main Chat Area */}
            <Suspense fallback={<ComponentLoader />}>
              <ChatContainer 
                leftSidebarOpen={leftSidebarOpen}
                rightSidebarOpen={rightSidebarOpen}
                toggleLeftSidebar={toggleLeftSidebar}
                toggleRightSidebar={toggleRightSidebar}
                {...performanceProps}
              />
            </Suspense>

            {/* Right Sidebar - User Profile */}
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
