import React, { useContext, useEffect, useState, useMemo, useRef, lazy, Suspense } from 'react';
import { motion as m } from 'framer-motion';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import Navbar from '../../layout/Navbar';
import SpaceBackground from '../../effects/SpaceBackground';
import { FaUser, FaExclamationCircle, FaSync } from 'react-icons/fa';
import NotConnectedMessage from '../../ui/NotConnectedMessage';
import IntegrationList from './IntegrationList';

// Lazy load section components for code splitting
const AccountOverview = lazy(() => import('./sections/AccountOverview'));
const TokensSection = lazy(() => import('./sections/TokensSection'));
const NFTsSection = lazy(() => import('./sections/NFTsSection'));
const TransactionsSection = lazy(() => import('./sections/TransactionsSection'));
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
  const { account, walletConnected, balance, network, provider, isInitialized } = useContext(WalletContext);
  const { state: stakingState, refreshUserInfo } = useStaking();
  
  const [nfts, setNfts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIntegration, setActiveIntegration] = useState('overview');
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);
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
      refreshUserInfo(account).catch(console.error);
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
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-600/20"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-purple-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaUser className="text-2xl text-purple-400" />
              </div>
            </div>
            <p className="text-purple-300 text-xl font-medium">Loading profile data...</p>
            <p className="text-purple-200/60 mt-2">Fetching your information from the blockchain</p>
           
          </div>
        </div>
      </div>
    );
  }

  // Render profile content with Suspense for code splitting
  return (
    <div className="min-h-screen bg-nuvo-gradient relative">
      <SpaceBackground customClass="" />
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Title content */}
          <m.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text mb-6">
              Nuvos Dashboard
            </h1>
            <p className="text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto">
              Manage your account, assets, and activity in the Nuvos ecosystem
            </p>
          </m.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="nuvos-card rounded-xl border border-purple-500/30 p-6"
              >
                {/* Account Profile Section */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 transform transition-transform hover:scale-105">
                    <FaUser className="text-4xl text-white" />
                  </div>
                  <div className="bg-black/30 py-2 px-4 rounded-lg border border-purple-500/20 inline-block">
                    <p className="font-mono text-sm text-purple-200">
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </p>
                  </div>
                </div>

                {/* Network Info */}
                <div className="bg-black/30 p-4 rounded-xl border border-purple-500/20 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-purple-300">Network</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      {network}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-300">Balance</span>
                    <span className="text-white font-medium">{parseFloat(balance).toFixed(4)} MATIC</span>
                  </div>
                </div>

                {/* Integration Navigation */}
                <div className="mb-2">
                  <h3 className="text-white font-medium mb-3">Your Dashboard</h3>
                  <IntegrationList 
                    activeIntegration={activeIntegration} 
                    onSelectIntegration={setActiveIntegration} 
                  />
                </div>
              </m.div>
            </div>

            {/* Right Content Area - Dynamic Section Rendering with Suspense */}
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
                      return <TransactionsSection />;
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
    </div>
  );
};

export default React.memo(ProfilePage);
