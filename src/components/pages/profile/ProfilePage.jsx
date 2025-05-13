import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { motion as m } from 'framer-motion';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import Navbar from '../../layout/Navbar';
import SpaceBackground from '../../effects/SpaceBackground';
import { FaUser, FaExclamationCircle, FaSync } from 'react-icons/fa';
import NotConnectedMessage from '../../ui/NotConnectedMessage';
import IntegrationList from './IntegrationList';
import AccountOverview from './sections/AccountOverview';
import TokensSection from './sections/TokensSection';
import NFTsSection from './sections/NFTsSection';
import TransactionsSection from './sections/TransactionsSection';
import ActivitySection from './sections/ActivitySection';
import AIHubSection from './sections/AIHubSection';
import AirdropsSection from './sections/AirdropsSection';
import GameSection from './sections/GameSection';
import StakingSection from './sections/StakingSection';
import { fetchNFTs, fetchTransactions, fetchTokenBalances } from '../../../utils/blockchain/blockchainUtils';

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
    // Set a timeout to force exit loading state if it takes too long
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached - forcing exit from loading state");
        setIsLoading(false);
        if (!nfts.length && !transactions.length && !tokenBalances.length) {
          setError("Loading took too long. Please try again or check your connection.");
        }
      }
    }, 15000); // 15 seconds timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, nfts.length, transactions.length, tokenBalances.length]);

  // Fetch user data when provider is ready
  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletConnected || !account) return;
      
      // Make sure we have a valid provider and it's initialized
      // This is crucial - we need to check isInitialized from WalletContext
      if (!provider || !isInitialized) {
        console.log("Provider not ready yet, will try again when initialized");
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Starting to fetch blockchain data with provider:", !!provider);
        
        // Use try-catch for each API call separately to prevent one failure from blocking everything
        let nftData = [];
        let txData = [];
        let tokenData = [];
        
        try {
          console.log("Fetching NFTs...");
          nftData = await fetchNFTs(account, provider, {
            // Specify contract address for targeted NFT fetch
            contractAddress: import.meta.env.VITE_TOKENIZATION_ADDRESS
          });
          console.log("NFTs fetched successfully:", nftData.length);
        } catch (nftError) {
          console.error("Error fetching NFTs:", nftError);
          // Continue with empty array
        }
        
        try {
          console.log("Fetching transactions...");
          txData = await fetchTransactions(account, provider);
          console.log("Transactions fetched successfully:", txData.length);
        } catch (txError) {
          console.error("Error fetching transactions:", txError);
          // Continue with empty array
        }
        
        try {
          console.log("Fetching token balances...");
          tokenData = await fetchTokenBalances(account, provider, {
            nuvoTokenAddress: import.meta.env.VITE_NUVO_TOKEN
          });
          console.log("Token balances fetched successfully:", tokenData.length);
        } catch (tokenError) {
          console.error("Error fetching token balances:", tokenError);
          // Continue with empty array
        }
        
        setNfts(nftData);
        setMintedNFTs(nftData.filter(nft => nft.minter?.toLowerCase() === account.toLowerCase()));
        setTransactions(txData);
        setTokenBalances(tokenData);
        
        setIsLoading(false);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching blockchain data:", err);
        setError("Failed to load blockchain data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [account, walletConnected, provider, isInitialized]);

  // Refresh staking data when connected
  useEffect(() => {
    if (walletConnected && account) {
      refreshUserInfo(account).catch(console.error);
    }
  }, [walletConnected, account, refreshUserInfo]);

  // Force exit from loading state after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && walletConnected) {
        console.log("Forcing exit from initial loading state");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds max initial loading
    
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
            <button 
              onClick={() => setIsLoading(false)}
              className="mt-6 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white"
            >
              Skip Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render profile content (this will now show even if not all data is loaded)
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

            {/* Right Content Area - Dynamic Section Rendering */}
            <m.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
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
            </m.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
