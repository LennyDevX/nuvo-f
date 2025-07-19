import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { m } from 'framer-motion';
import { FaRedo, FaPlus } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import { useTokenization } from '../../../../context/TokenizationContext';
import { useDeviceDetection } from '../../../../hooks/mobile/useDeviceDetection';
import NFTDashboardStats from './NFTDashboardStats';
import NFTCollection from '../collection/NFTCollection';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import NotConnectedMessage from '../../../ui/NotConnectedMessage';
import { normalizeCategory, getAvailableCategories } from '../../../../utils/blockchain/blockchainUtils';
import NFTDashboardFilters from './NFTDashboardFilters';

const NFTDashboard = () => {
  const { account, walletConnected, connectWallet } = useContext(WalletContext);
  const { 
    nfts, 
    nftsLoading: loading, 
    nftsError: error, 
    refreshNFTs, 
    updateUserAccount,
    cacheStatus 
  } = useTokenization();
  
  // Get device detection data
  const { isMobile } = useDeviceDetection();
  
  // Update TokenizationContext with current user account
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
  }, [account, updateUserAccount]);

  // Get standardized categories
  const availableCategories = getAvailableCategories();

  // State for filters - use standardized categories
  const [filters, setFilters] = useState({
    categories: availableCategories
      .filter(cat => cat.value !== 'all') // Exclude 'all' option for checkboxes
      .map(cat => ({ 
        label: cat.label, 
        value: cat.value, 
        selected: false 
      })),
    statuses: [
      { label: 'For Sale', value: 'forSale', selected: false },
      { label: 'Not Listed', value: 'notListed', selected: false },
    ]
  });

  // Use useRef to keep a stable value for recentActivity
  const [recentActivity, setRecentActivity] = useState(Math.floor(Math.random() * 5));
  
  // State for view and search
  const [activeView, setActiveView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recent');

  // Add a refresh function to pass down to the NFT collection
  const handleRefreshNFTs = useCallback(() => {
    if (refreshNFTs && typeof refreshNFTs === 'function') {
      refreshNFTs();
    } else {
      // If refreshNFTs isn't available, reload the page as a fallback
      window.location.reload();
    }
  }, [refreshNFTs]);

  // Calculate collection stats with enhanced information
  const stats = useMemo(() => {
    // Calculate unique categories properly with debugging
    const categoriesSet = new Set();
    console.log('Dashboard stats - processing NFTs:', nfts.length);
    
    nfts.forEach(nft => {
      if (nft.category) {
        const normalizedCategory = normalizeCategory(nft.category || 'collectible');
        console.log(`Dashboard stats - NFT ${nft.tokenId}: "${nft.category}" -> "${normalizedCategory}"`);
        categoriesSet.add(normalizedCategory);
      }
    });
    
    const uniqueCategoriesCount = categoriesSet.size;
    console.log('Dashboard stats - unique categories:', Array.from(categoriesSet), 'count:', uniqueCategoriesCount);
    
    return {
      totalNFTs: nfts.length,
      listedNFTs: nfts.filter(nft => nft.isForSale).length,
      totalValue: nfts
        .filter(nft => nft.isForSale && nft.price)
        .reduce((total, nft) => {
          const priceInEth = nft.price && ethers.formatEther ? ethers.formatEther(nft.price) : 0;
          return total + parseFloat(priceInEth);
        }, 0)
        .toFixed(4),
      // Calculate most valuable NFT
      topNFTValue: nfts.length > 0 
        ? nfts.reduce((max, nft) => {
            if (!nft.price) return max;
            const priceInEth = ethers.formatEther ? ethers.formatEther(nft.price) : 0;
            return Math.max(max, parseFloat(priceInEth));
          }, 0).toFixed(2)
        : "0.00",
      // Use the stable reference value for recent activity
      recentActivity: recentActivity,
      // Fixed unique categories calculation
      uniqueCategories: uniqueCategoriesCount
    };
  }, [nfts, recentActivity]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'view') {
      setActiveView(value);
      return;
    }

    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'category') {
        newFilters.categories = newFilters.categories.map(cat => 
          cat.value === value ? { ...cat, selected: !cat.selected } : cat
        );
      } else if (filterType === 'status') {
        newFilters.statuses = newFilters.statuses.map(status => 
          status.value === value ? { ...status, selected: !status.selected } : status
        );
      }
      
      return newFilters;
    });
  };

  // Handle search term changes
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // Handle sort option changes
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Filter and sort NFTs based on current criteria
  const filteredNFTs = useMemo(() => {
    // Start with all NFTs
    let result = [...nfts];
    
    // Apply category filters if any are selected
    const selectedCategories = filters.categories.filter(cat => cat.selected).map(cat => cat.value);
    if (selectedCategories.length > 0) {
      result = result.filter(nft => {
        const normalizedNFTCategory = normalizeCategory(nft.category || 'collectible');
        console.log(`Filtering NFT ${nft.tokenId}: category "${nft.category}" -> normalized "${normalizedNFTCategory}", selected categories:`, selectedCategories);
        return selectedCategories.includes(normalizedNFTCategory);
      });
    }
    
    // Apply status filters if any are selected
    const selectedStatuses = filters.statuses.filter(status => status.selected).map(status => status.value);
    if (selectedStatuses.length > 0) {
      result = result.filter(nft => {
        if (selectedStatuses.includes('forSale') && nft.isForSale) return true;
        if (selectedStatuses.includes('notListed') && !nft.isForSale) return true;
        return false;
      });
    }
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(nft => 
        (nft.name && nft.name.toLowerCase().includes(term)) || 
        (nft.description && nft.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-high':
          return parseFloat(ethers.formatEther(b.price || 0)) - parseFloat(ethers.formatEther(a.price || 0));
        case 'price-low':
          return parseFloat(ethers.formatEther(a.price || 0)) - parseFloat(ethers.formatEther(b.price || 0));
        case 'likes':
          return parseInt(b.likes || 0) - parseInt(a.likes || 0);
        case 'recent':
        default:
          // Assuming newer NFTs have higher tokenIds
          return parseInt(b.tokenId) - parseInt(a.tokenId);
      }
    });
    
    return result;
  }, [nfts, filters, searchTerm, sortOption]);

  // For mobile view toggling
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const toggleMobileFilters = () => setShowMobileFilters(!showMobileFilters);

  // Use a more reliable mobile detection
  const useMobileLayout = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024);

  // Add wallet connection check similar to StakingDashboard
  if (!walletConnected || !account) {
    return (
      <div className="relative min-h-screen bg-nuvo-gradient pb-12">
        <SpaceBackground customClass="" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <NotConnectedMessage
            title="NFT Dashboard"
            message="Connect your wallet to view and manage your digital assets"
            connectWallet={connectWallet}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-nuvo-gradient pb-12">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header - without refresh button */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text tracking-tight">
                NFT Dashboard
                {cacheStatus && (
                  <span className="ml-3 text-sm text-green-400">💾 {cacheStatus}</span>
                )}
              </h1>
              <p className="text-gray-300">Manage and explore your digital assets</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Link 
                to="/tokenize"
                className="flex items-center justify-center gap-2 px-6 py-2.5 btn-nuvo-base bg-nuvo-gradient-button text-white font-medium transition-all duration-200 border border-purple-500/20 hover:border-pink-500/30"
              >
                <FaPlus className="text-sm" /> Mint NFTs
              </Link>
              <Link
                to="/my-nfts/listings"
                className="flex items-center justify-center gap-2 px-6 py-2.5 btn-nuvo-base btn-nuvo-primary-solid text-white font-medium transition-all duration-200 border border-blue-700/20 hover:border-blue-800/30"
              >
                View NFTs
              </Link>
            </div>
          </div>
          
          {/* Stats Overview - with refresh button passed as prop */}
          <NFTDashboardStats stats={stats} isMobile={true} nfts={nfts} onRefresh={handleRefreshNFTs} />
          
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={toggleMobileFilters}
              className="w-full py-3 btn-nuvo-base btn-nuvo-outline flex items-center justify-center border border-purple-500/30 hover:border-pink-400/50 transition-all duration-200 font-medium"
            >
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Always visible on desktop, toggleable on mobile */}
            <div className={`${showMobileFilters ? 'block' : 'hidden lg:block'} w-full lg:w-80 flex-shrink-0 relative z-10`}>
              <div className="sticky top-6">
                <NFTDashboardFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onSearchChange={handleSearchChange}
                  onSearchApply={() => setShowMobileFilters(false)}
                  searchValue={searchTerm}
                  onSortChange={handleSortChange}
                  activeView={activeView}
                  isMobile={window.innerWidth < 1024}
                  stats={stats} 
                />
              </div>
            </div>
            
            {/* NFT Collection */}
            <div className="flex-1 nuvos-card backdrop-blur-md p-4 relative z-0">
              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-6">
                  <LoadingSpinner 
                    size="xl" 
                    variant="orbit"
                    text="Loading Your NFTs"
                    showDots={true}
                    className="text-purple-400"
                  />
                  <div className="text-center max-w-md">
                    <p className="text-white font-medium mb-2">Discovering your collection...</p>
                    <p className="text-gray-400 text-sm">Fetching NFT data from blockchain</p>
                  </div>
                </div>
              ) : (
                <NFTCollection 
                  nfts={filteredNFTs}
                  loading={loading}
                  error={error}
                  onRetry={handleRefreshNFTs}
                  cacheStatus={cacheStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDashboard;