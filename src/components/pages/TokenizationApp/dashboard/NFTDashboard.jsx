import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { FaRedo, FaPlus } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import { useTokenization } from '../../../../context/TokenizationContext';
import NFTDashboardSidebar from './NFTDashboardSidebar';
import NFTDashboardStats from './NFTDashboardStats';
import NFTCollection from '../collection/NFTCollection';
import SpaceBackground from '../../../effects/SpaceBackground';

const NFTDashboard = () => {
  const { account } = useContext(WalletContext);
  const { 
    nfts, 
    nftsLoading: loading, 
    nftsError: error, 
    refreshNFTs, 
    updateUserAccount 
  } = useTokenization();
  
  // Update TokenizationContext with current user account
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
  }, [account, updateUserAccount]);

  // State for filters
  const [filters, setFilters] = useState({
    categories: [
      { label: 'Art', value: 'art', selected: false },
      { label: 'Collectibles', value: 'collectible', selected: false },
      { label: 'Music', value: 'music', selected: false },
      { label: 'Photography', value: 'photography', selected: false },
      { label: 'Virtual Worlds', value: 'virtual-world', selected: false },
    ],
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
  const stats = useMemo(() => ({
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
    // Calculate unique categories
    uniqueCategories: new Set(nfts.map(nft => nft.category || 'collectible')).size
  }), [nfts, recentActivity]);

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
      result = result.filter(nft => selectedCategories.includes(nft.category));
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

  return (
    <div className="relative min-h-screen bg-nuvo-gradient pb-12">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text tracking-tight">
                NFT Dashboard
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
              
              <button 
                onClick={handleRefreshNFTs} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 btn-nuvo-base btn-nuvo-outline text-white font-medium transition-all duration-200 border border-purple-500/30 hover:border-pink-400/50"
              >
                <FaRedo className="text-sm" /> Refresh NFTs
              </button>
            </div>
          </div>
          
          {/* Stats Overview - Pass true for isMobile on smaller screens */}
          <NFTDashboardStats stats={stats} isMobile={true} />
          
          {/* Mobile Filters Toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileFilters}
              className="w-full py-3 btn-nuvo-base btn-nuvo-outline flex items-center justify-center border border-purple-500/30 hover:border-pink-400/50 transition-all duration-200 font-medium"
            >
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Hidden on mobile unless toggled */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
              <NFTDashboardSidebar 
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                onSearchApply={() => setShowMobileFilters(false)}
                searchValue={searchTerm}
                onSortChange={handleSortChange}
                activeView={activeView}
                isMobile={true}
                stats={stats} 
              />
            </div>
            
            {/* NFT Collection */}
            <div className="flex-1 nuvos-card  backdrop-blur-md p-4 ">
              <NFTCollection 
                nfts={filteredNFTs}
                loading={loading}
                error={error}
                onRetry={handleRefreshNFTs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDashboard;