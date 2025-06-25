import React, { useContext, useEffect, useState, useMemo, useRef, lazy, Suspense } from 'react';
import { motion as m } from 'framer-motion';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import Navbar from '../../layout/Navbar';
import SpaceBackground from '../../effects/SpaceBackground';
import { FaUser, FaExclamationCircle, FaSync } from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';
import NotConnectedMessage from '../../ui/NotConnectedMessage';
import SideBar from './SideBar';
import LoadingSpinner from '../../ui/LoadingSpinner';

// Lazy load section components for code splitting
const AccountOverview = lazy(() => import('./sections/AccountOverview'));
const TokensSection = lazy(() => import('./sections/TokensSection'));
const NFTsSection = lazy(() => import('./sections/NFTsSection'));
const ActivitySection = lazy(() => import('./sections/ActivitySection'));
const AIHubSection = lazy(() => import('./sections/AIHubSection'));
const AirdropsSection = lazy(() => import('./sections/AirdropsSection'));
const GameSection = lazy(() => import('./sections/GameSection'));
const StakingSection = lazy(() => import('./sections/StakingSection'));

// Import utility functions
import { fetchNFTs, fetchTransactions, fetchTokenBalances } from '../../../utils/blockchain/blockchainUtils';

// SectionLoader component for Suspense fallback
const SectionLoader = () => (
  <div className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex items-center justify-center h-96">
    <div className="w-10 h-10 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
  </div>
);

const ProfilePage = () => {
  const { account, walletConnected, balance, network, provider, isInitialized, connectWallet } = useContext(WalletContext);
  const { state: stakingState, refreshUserInfo } = useStaking();
  
  const [nfts, setNfts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIntegration, setActiveIntegration] = useState('overview');
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const loadingTimeoutRef = useRef(null);

  // Calculate deposit amount from staking state
  const depositAmount = useMemo(() => {
    if (!stakingState?.userDeposits || stakingState.userDeposits.length === 0) return '0';
    
    return stakingState.userDeposits.reduce((sum, deposit) => {
      const amount = parseFloat(deposit.amount) || 0;
      return sum + amount;
    }, 0).toString();
  }, [stakingState?.userDeposits]);

  // Add timeout to prevent infinite loading state
  useEffect(() => {
    // Reduce timeout from 15s to 8s
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached - forcing exit from loading state");
        setIsLoading(false);
        if (!nfts.length && !transactions.length && !tokenBalances.length) {
          setError("Loading took too long. Please try again or check your connection.");
        }
      }
    }, 8000); // Reduced from 15 seconds to 8 seconds timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, nfts.length, transactions.length, tokenBalances.length]);

  // Create a memoized cache key for data fetching to prevent unnecessary refetches
  const fetchCacheKey = useMemo(() => {
    return `${account}-${network}-${isInitialized}`;
  }, [account, network, isInitialized]);

  // Fetch user data when provider is ready - only when cache key changes
  useEffect(() => {
    if (!walletConnected || !account || !provider || !isInitialized) return;
    
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Run all data fetching in parallel with AbortController for cleanup
        const controller = new AbortController();
        const signal = controller.signal;
        
        const [nftResult, txResult, tokenResult] = await Promise.allSettled([
          fetchNFTs(account, provider, {
            contractAddress: import.meta.env.VITE_TOKENIZATION_ADDRESS,
            signal
          }).catch(err => {
            if (!signal.aborted) console.error("Error fetching NFTs:", err);
            return [];
          }),
          
          fetchTransactions(account, provider).catch(err => {
            console.error("Error fetching transactions:", err);
            return [];
          }),
          
          fetchTokenBalances(account, provider, {
            nuvoTokenAddress: import.meta.env.VITE_NUVO_TOKEN
          }).catch(err => {
            console.error("Error fetching token balances:", err);
            return [];
          })
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Process results safely
          const nftData = nftResult.status === 'fulfilled' ? nftResult.value : [];
          const txData = txResult.status === 'fulfilled' ? txResult.value : [];
          const tokenData = tokenResult.status === 'fulfilled' ? tokenResult.value : [];
          
          console.log("Data fetching complete - NFTs:", nftData.length, 
                     "Transactions:", txData.length, 
                     "Tokens:", tokenData.length);
          
          setNfts(nftData);
          setMintedNFTs(nftData.filter(nft => nft.minter?.toLowerCase() === account.toLowerCase()));
          setTransactions(txData);
          setTokenBalances(tokenData);
          
          setIsLoading(false);
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching blockchain data:", err);
          setError("Failed to load blockchain data. Please try again later.");
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    return () => {
      isMounted = false;
      // Cancel in-flight requests when component unmounts
      controller?.abort();
    };
  }, [fetchCacheKey]); // Use the memoized cache key instead of individual dependencies

  // Refresh staking data when connected
  useEffect(() => {
    if (walletConnected && account) {
      refreshUserInfo(account).catch(err => {
        console.error("Error refreshing staking info:", err);
      });
    }
  }, [walletConnected, account, refreshUserInfo]);

  // Force exit from loading state after component mount
  useEffect(() => {
    // Reduced from 5 seconds to 3 seconds for faster rendering
    const timer = setTimeout(() => {
      if (isLoading && walletConnected) {
        console.log("Forcing exit from initial loading state");
        setIsLoading(false);
      }
    }, 3000); // 3 seconds max initial loading (reduced from 5 seconds)
    
    return () => clearTimeout(timer);
  }, [isLoading, walletConnected]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close nav when section changes
  useEffect(() => {
    setIsNavExpanded(false);
  }, [activeIntegration]);

  // Close profile menu when section changes
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [activeIntegration]);

  // Show not connected state with improved styling
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-nuvo-gradient relative">
        <SpaceBackground customClass="" />
        <Navbar />
        <div className="pt-24 pb-16 px-4 relative z-10 max-w-7xl mx-auto">
          <NotConnectedMessage 
            title="Profile Not Available"
            message="Please connect your wallet to view your profile information."
            connectWallet={connectWallet}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-nuvo-gradient relative">
        <SpaceBackground customClass="" />
        <Navbar />
        <div className="pt-24 pb-16 px-4 relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-8 bg-red-900/20 rounded-xl border border-red-500/30">
              <FaExclamationCircle className="text-5xl text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
              <p className="text-red-300 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FaSync />
                  Retry
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-nuvo-gradient relative">
        <SpaceBackground customClass="" />
        <Navbar />
        <div className="pt-24 pb-16 px-4 relative z-10 max-w-7xl mx-auto flex justify-center items-center">
          <LoadingSpinner 
            size="xl" 
            variant="orbit"
            text="Loading profile data..."
            showDots={true}
            className="text-purple-400"
          />
        </div>
      </div>
    );
  }

  // Render profile content with responsive layout
  return (
    <div className="min-h-screen bg-nuvo-gradient relative">
      <SpaceBackground customClass="" />
      <Navbar />
      
      {/* Main Content with proper mobile spacing - Remove extra mobile header spacing */}
      <div className="pt-20 sm:pt-24 px-3 sm:px-4 relative z-10 pb-32 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Compact Title for mobile */}
          <m.div
            className="text-center mb-6 sm:mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text mb-2 sm:mb-6">
              Nuvos Dashboard
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto px-4">
              Manage your account, assets, and activity in the Nuvos ecosystem
            </p>
          </m.div
          >
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="lg:col-span-1 hidden lg:block">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="nuvos-card rounded-xl border border-purple-500/30 p-4 sm:p-6 sticky top-24"
              >
                {/* Account Profile Section */}
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 transform transition-transform hover:scale-105">
                    <FaUser className="text-2xl sm:text-4xl text-white" />
                  </div>
                  <div className="bg-black/30 py-2 px-3 sm:px-4 rounded-lg border border-purple-500/20 inline-block">
                    <p className="font-mono text-xs sm:text-sm text-purple-200">
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </p>
                  </div>
                </div>

                {/* Network Info */}
                <div className="bg-black/30 p-3 sm:p-4 rounded-xl border border-purple-500/20 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm text-purple-300">Network</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1"></span>
                      {network}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-purple-300">Balance</span>
                    <span className="text-white font-medium text-xs sm:text-sm">{parseFloat(balance).toFixed(4)} MATIC</span>
                  </div>
                </div>

                {/* Desktop Navigation */}
                <div className="mb-2">
                  <h3 className="text-white font-medium mb-3 text-sm sm:text-base">Your Dashboard</h3>
                  <SideBar 
                    activeIntegration={activeIntegration} 
                    onSelectIntegration={setActiveIntegration}
                    isMobile={false}
                  />
                </div>
              </m.div>
            </div>

            {/* Main Content Area - Full width on mobile */}
            <m.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Suspense fallback={<SectionLoader />}>
                {(() => {
                  switch (activeIntegration) {
                    case 'overview':
                      return <AccountOverview account={account} balance={balance} network={network} />;
                    case 'nfts':
                      return <NFTsSection account={account} />;
                    case 'staking':
                      return <StakingSection account={account} depositAmount={depositAmount} />;
                    case 'transactions':
                      return <ActivitySection mintedNFTs={mintedNFTs} transactions={transactions} account={account} />;
                    case 'ai-hub':
                      return <AIHubSection account={account} />;
                    case 'airdrops':
                      return <AirdropsSection account={account} />;
                    case 'game':
                      return <GameSection account={account} />;
                    default:
                      return <AccountOverview account={account} balance={balance} network={network} />;
                  }
                })()}
              </Suspense>
            </m.div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Profile Navigation for Mobile - Above main navbar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-[60]">
        {/* Expandable Profile Sections Menu */}
        <div 
          className={`
            bg-black/98 backdrop-blur-xl border-t border-purple-500/30 
            transition-all duration-300 ease-out transform
            ${isProfileMenuOpen 
              ? 'translate-y-0 opacity-100 max-h-80' 
              : 'translate-y-full opacity-0 max-h-0'
            }
            overflow-hidden shadow-2xl
          `}
        >
          <div className="px-4 py-4 max-h-72 overflow-y-auto">
            {/* Section Title */}
            <div className="text-center mb-4">
              <h3 className="text-white font-semibold text-lg">Profile Sections</h3>
              <p className="text-gray-400 text-sm">Navigate to different areas</p>
            </div>
            
            {/* Profile Navigation Grid */}
            <SideBar 
              activeIntegration={activeIntegration} 
              onSelectIntegration={(section) => {
                setActiveIntegration(section);
                setIsProfileMenuOpen(false);
              }}
              isMobile={true}
              isCompact={false}
            />
          </div>
        </div>

        {/* Profile Navigation Control Bar - Always visible */}
        <div className="bg-black/95 backdrop-blur-xl border-t border-purple-500/30 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Current Profile Section Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-base text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate">Profile Dashboard</p>
                <p className="text-purple-300 text-xs font-medium">{getSectionLabel(activeIntegration)}</p>
              </div>
            </div>

            {/* Network Status Badge */}
            <div className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-xs font-medium flex items-center flex-shrink-0 mr-3">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {network}
            </div>

            {/* Profile Menu Toggle Button */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`
                p-3 rounded-xl transition-all duration-200 flex-shrink-0 min-w-[48px]
                ${isProfileMenuOpen 
                  ? 'bg-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/70'
                }
                border border-purple-500/30 active:scale-95
              `}
              aria-label={isProfileMenuOpen ? 'Close profile menu' : 'Open profile menu'}
            >
              <HiMenuAlt3 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop when profile menu is expanded */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[50] lg:hidden"
          onClick={() => setIsProfileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Helper function for section labels
const getSectionLabel = (section) => {
  const labels = {
    'overview': 'Overview',
    'nfts': 'NFTs',
    'staking': 'Staking',
    'transactions': 'Activity',
    'ai-hub': 'AI Hub',
    'airdrops': 'Airdrops',
    'game': 'Game'
  };
  return labels[section] || 'Dashboard';
};

export default React.memo(ProfilePage);

