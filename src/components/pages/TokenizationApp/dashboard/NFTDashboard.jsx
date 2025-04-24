import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTh, 
  FaList, 
  FaDownload, 
  FaTimes,
  FaFilter
} from 'react-icons/fa';
import { ethers } from 'ethers'; 
import SpaceBackground from '../../../effects/SpaceBackground';
import { WalletContext } from '../../../../context/WalletContext';
import useUserNFTs from '../../../../hooks/useUserNFTs';
import NFTCollection from '../collection/NFTCollection';
import NFTDashboardSidebar from './NFTDashboardSidebar';
import NFTDashboardStats from './NFTDashboardStats';

const NFTDashboard = () => {
  const { account, walletConnected } = useContext(WalletContext);
  const { nfts, loading, error } = useUserNFTs(account);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- Cambiar a false
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearchTerm, setMobileSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [activeView, setActiveView] = useState('grid');
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
  const recentActivityRef = useRef(Math.floor(Math.random() * 5));
  
  // Calculate collection stats with enhanced information
  const stats = {
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
    recentActivity: recentActivityRef.current
  };

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

  // Apply filters to nfts
  useEffect(() => {
    if (!nfts) return;

    let result = [...nfts];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(nft => 
        nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filters
    const selectedCategories = filters.categories.filter(c => c.selected).map(c => c.value);
    if (selectedCategories.length > 0) {
      result = result.filter(nft => selectedCategories.includes(nft.category));
    }
    
    // Apply status filters
    const selectedStatuses = filters.statuses.filter(s => s.selected).map(s => s.value);
    if (selectedStatuses.length > 0) {
      result = result.filter(nft => {
        if (selectedStatuses.includes('forSale') && nft.isForSale) return true;
        if (selectedStatuses.includes('notListed') && !nft.isForSale) return true;
        return false;
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-high':
        result.sort((a, b) => {
          const aPrice = a.isForSale && a.price ? parseFloat(ethers.formatEther(a.price)) : 0;
          const bPrice = b.isForSale && b.price ? parseFloat(ethers.formatEther(b.price)) : 0;
          return bPrice - aPrice;
        });
        break;
      case 'price-low':
        result.sort((a, b) => {
          const aPrice = a.isForSale && a.price ? parseFloat(ethers.formatEther(a.price)) : 0;
          const bPrice = b.isForSale && b.price ? parseFloat(ethers.formatEther(b.price)) : 0;
          return aPrice - bPrice;
        });
        break;
      case 'likes':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default: // recent
        // Assuming tokenId is sequential or there's a timestamp
        result.sort((a, b) => b.tokenId - a.tokenId);
    }
    
    setFilteredNfts(result);
  }, [nfts, searchTerm, filters, sortBy]);

  // Mobile sidebar enhancements
  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // When opening sidebar on mobile, scroll to top to ensure good visibility
    if (!sidebarOpen && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Check if we're on mobile (for conditional rendering)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Search handlers
  const handleDesktopSearch = (term) => {
    setSearchTerm(term);
  };

  const handleApplyMobileSearch = () => {
    setSearchTerm(mobileSearchTerm);
    closeSidebar();
  };

  // Mobile sidebar animation variants
  const mobileSidebarVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300 
      }
    },
    exit: { 
      y: "100%", 
      opacity: 0,
      transition: { 
        duration: 0.3, 
        ease: "easeInOut" 
      }
    }
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
        <SpaceBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center bg-black/50 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 mb-4">
              NFT Dashboard
            </h1>
            <p className="text-gray-300 mb-8">Connect your wallet to manage your tokenized NFTs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
      <SpaceBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
                NFT Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Manage your tokenized assets in one place
              </p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Link
                to="/tokenize"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
              >
                <FaPlus className="mr-2" /> Create New NFT
              </Link>
            </div>
          </div>

          {/* Dashboard Stats Cards - Now using the new component */}
          <NFTDashboardStats stats={stats} isMobile={isMobile} />

          {/* Main Dashboard Content */}
          <div className="flex flex-col md:flex-row gap-6 relative">
            {/* Desktop Sidebar - Only visible on desktop */}
            {!isMobile && (
              <motion.div 
                className="md:w-64 flex-shrink-0 hidden md:block"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <NFTDashboardSidebar 
                  stats={stats}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onSearchChange={handleDesktopSearch}
                  searchValue={searchTerm}
                  onSearchApply={null}
                  onSortChange={setSortBy}
                  activeView={activeView}
                  isMobile={false}
                />
              </motion.div>
            )}
            
            {/* NFT Collection */}
            <motion.div 
              className="flex-grow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div className="flex justify-between items-center w-full sm:w-auto mb-4 sm:mb-0">
                    <h2 className="text-xl font-bold text-white">
                      {searchTerm ? 'Search Results' : 'Your NFTs'}
                      <span className="ml-2 text-sm text-gray-400">({filteredNfts.length} items)</span>
                    </h2>
                    
                    {/* Mobile Filter Button - Only visible on mobile */}
                    {isMobile && (
                      <button 
                        onClick={toggleMobileSidebar}
                        className="p-3 bg-purple-600 rounded-full text-white shadow-lg flex items-center justify-center"
                        aria-label="Open Filters"
                      >
                        <FaFilter size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveView('grid')}
                      className={`p-2 rounded-lg ${
                        activeView === 'grid' 
                          ? 'bg-purple-500/50 text-white' 
                          : 'bg-black/40 text-gray-400 hover:bg-black/60'
                      }`}
                    >
                      <FaTh size={14} />
                    </button>
                    <button
                      onClick={() => setActiveView('list')}
                      className={`p-2 rounded-lg ${
                        activeView === 'list' 
                          ? 'bg-purple-500/50 text-white' 
                          : 'bg-black/40 text-gray-400 hover:bg-black/60'
                      }`}
                    >
                      <FaList size={14} />
                    </button>
                    <button
                      className="p-2 bg-black/40 text-gray-400 hover:bg-black/60 rounded-lg"
                      title="Export Collection"
                    >
                      <FaDownload size={14} />
                    </button>
                  </div>
                </div>
                
                <NFTCollection 
                  nfts={filteredNfts} 
                  loading={loading} 
                  error={error} 
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Sidebar Overlay - Appears from bottom */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div 
            className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-t-2xl p-5 h-[80vh] overflow-y-auto"
              variants={mobileSidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Filters & Options</h3>
                <button 
                  onClick={closeSidebar}
                  className="p-2 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <NFTDashboardSidebar 
                stats={stats}
                filters={filters}
                onFilterChange={handleFilterChange}
                // Remove the immediate close on search for mobile
                onSearchChange={isMobile ? setMobileSearchTerm : setSearchTerm}
                onSearchApply={handleApplyMobileSearch}  // New prop for applying search
                searchValue={isMobile ? mobileSearchTerm : searchTerm} // Pass the current search value
                onSortChange={(sort) => {
                  setSortBy(sort);
                  // Keep closing on sort change as this is a select box with immediate effect
                  if (isMobile) closeSidebar();
                }}
                activeView={activeView}
                isMobile={true}
              />

              <div className="mt-6 flex justify-center">
                <button
                  onClick={closeSidebar}
                  className="w-full max-w-xs py-3 bg-purple-600 rounded-lg text-white font-medium"
                >
                  View Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button for mobile - Always accessible */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white shadow-lg flex items-center justify-center"
          aria-label="Open Filters"
        >
          <FaFilter size={20} />
        </button>
      )}
    </div>
  );
};

export default NFTDashboard;