import React, { useContext, useEffect, useState, useMemo } from 'react';
import { motion as m } from 'framer-motion';
import { WalletContext } from '../../../context/WalletContext';
import { useStaking } from '../../../context/StakingContext';
import Navbar from '../../layout/Navbar';
import SpaceBackground from '../../effects/SpaceBackground';
import { FaUser, FaExclamationCircle } from 'react-icons/fa';
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
import { fetchNFTs, fetchTransactions, fetchTokenBalances } from '../../../utils/blockchainUtils';

const ProfilePage = () => {
  const { account, walletConnected, balance, network, provider, ensureProvider } = useContext(WalletContext);
  const { state: stakingState, refreshUserInfo } = useStaking();
  
  const [nfts, setNfts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIntegration, setActiveIntegration] = useState('overview');
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Calculate deposit amount from staking state
  const depositAmount = useMemo(() => {
    if (!stakingState?.userDeposits || stakingState.userDeposits.length === 0) return '0';
    
    return stakingState.userDeposits.reduce((sum, deposit) => {
      const amount = parseFloat(deposit.amount) || 0;
      return sum + amount;
    }, 0).toString();
  }, [stakingState?.userDeposits]);

  // Attempt to ensure we have a valid provider when needed
  useEffect(() => {
    const setupProvider = async () => {
      if (walletConnected && account) {
        try {
          await ensureProvider();
        } catch (error) {
          console.error("Failed to ensure provider:", error);
        }
      }
    };
    
    setupProvider();
  }, [walletConnected, account, ensureProvider]);

  // Fetch user data when needed components are available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletConnected || !account || !provider) return;
      
      try {
        setIsLoading(true);
        
        // Parallel data fetching for better performance
        const [nftData, txData, tokenData] = await Promise.all([
          fetchNFTs(account, provider),
          fetchTransactions(account, provider),
          fetchTokenBalances(account, provider)
        ]);
        
        setNfts(nftData);
        setMintedNFTs(nftData.filter(nft => nft.minter?.toLowerCase() === account.toLowerCase()));
        setTransactions(txData);
        setTokenBalances(tokenData);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching blockchain data:", err);
        setError("Failed to load blockchain data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [account, walletConnected, provider]);

  // Refresh staking data when connected
  useEffect(() => {
    if (walletConnected && account) {
      refreshUserInfo(account).catch(console.error);
    }
  }, [walletConnected, account, refreshUserInfo]);

  // Letter animation variants (similar to DashboardStaking)
  const letterVariants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.15,
        ease: "easeOut"
      }
    })
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
        ease: "easeOut",
        duration: 0.6
      }
    }
  };

  // Render the appropriate section based on active integration
  const renderActiveSection = () => {
    switch (activeIntegration) {
      case 'overview':
        return <AccountOverview account={account} balance={balance} network={network} />;
      case 'nfts':
        return <NFTsSection nfts={nfts} account={account} />;
      case 'staking':
        return <StakingSection account={account} depositAmount={depositAmount} />;
      case 'transactions':
        return <TransactionsSection transactions={transactions} />;
      case 'ai-hub':
        return <AIHubSection account={account} />;
      case 'airdrops':
        return <AirdropsSection account={account} />;
      case 'game':
        return <GameSection account={account} />;
      default:
        return <AccountOverview account={account} balance={balance} network={network} />;
    }
  };

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
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Main profile content with enhanced styling
  return (
    <div className="min-h-screen bg-nuvo-gradient relative">
      <SpaceBackground customClass="" />
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Updated title styling */}
          <m.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 overflow-hidden"
            >
              {Array.from("Nuvos Dashboard").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                            text-5xl sm:text-6xl md:text-7xl font-bold"
                  style={{
                    willChange: "transform, opacity",
                    transform: "translateZ(0)"
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </m.span>
              ))}
            </m.div>
            
            <m.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ willChange: "opacity, transform" }}
            >
              <p className="text-lg md:text-xl text-slate-300/80 max-w-2xl mx-auto">
                Manage your account, assets, and activity in the Nuvos ecosystem
              </p>
            </m.div>
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
              {renderActiveSection()}
            </m.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
