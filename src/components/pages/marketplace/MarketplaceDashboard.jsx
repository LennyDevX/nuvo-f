import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../../../context/WalletContext';
import { useToast } from '../../../hooks/useToast';
import MarketplaceFilters from './components/MarketplaceFilters';
import NFTGrid from './components/NFTGrid';
import MarketplaceStats from './components/MarketplaceStats';
import LoadingSpinner from '../../ui/LoadingSpinner';
import EmptyState from './components/EmptyState';
import SpaceBackground from '../../effects/SpaceBackground';
import contractABI from '../../../Abi/TokenizationApp.json';

const TOKENIZATION_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

const MarketplaceDashboard = () => {
  const { account, provider } = useContext(WalletContext);
  const { showToast } = useToast();
  
  // States
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalVolume: '0',
    floorPrice: '0',
    owners: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: '', max: '' },
    sortBy: 'newest',
    searchTerm: ''
  });

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get contract instance
  const getContract = useCallback(() => {
    if (!provider) return null;
    return new ethers.Contract(TOKENIZATION_ADDRESS, contractABI.abi, provider);
  }, [provider]);

  // Get signer contract for transactions
  const getSignerContract = useCallback(async () => {
    if (!provider || !account) return null;
    const signer = await provider.getSigner();
    return new ethers.Contract(TOKENIZATION_ADDRESS, contractABI.abi, signer);
  }, [provider, account]);

  // Fetch marketplace data
  const fetchMarketplaceData = useCallback(async () => {
    try {
      setLoading(true);
      const contract = getContract();
      if (!contract) return;

      // Get all listed tokens - assuming we need to iterate through token IDs
      // This is a simplified approach - in production you'd want events or a backend
      const listedNfts = [];
      let tokenId = 1;
      const maxTokens = 1000; // Reasonable limit
      
      while (tokenId <= maxTokens) {
        try {
          const tokenData = await contract.getListedToken(tokenId);
          if (tokenData[4]) { // isListed
            const tokenURI = await contract.tokenURI(tokenId);
            const metadata = await fetchMetadata(tokenURI);
            
            listedNfts.push({
              tokenId: tokenData[0].toString(),
              owner: tokenData[1],
              seller: tokenData[2],
              price: ethers.formatEther(tokenData[3]),
              isListed: tokenData[4],
              listedAt: tokenData[5].toString(),
              category: tokenData[6],
              tokenURI,
              metadata
            });
          }
        } catch (error) {
          // Token doesn't exist or not listed, continue
          if (error.message.includes('TokenDoesNotExist')) break;
        }
        tokenId++;
      }

      setNfts(listedNfts);
      setFilteredNfts(listedNfts);
      
      // Calculate stats
      calculateStats(listedNfts);
      
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      showToast('Error loading marketplace data', 'error');
    } finally {
      setLoading(false);
    }
  }, [getContract, showToast]);

  // Fetch metadata from IPFS
  const fetchMetadata = async (tokenURI) => {
    try {
      if (tokenURI.startsWith('ipfs://')) {
        const ipfsHash = tokenURI.replace('ipfs://', '');
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        return await response.json();
      }
      return {};
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {};
    }
  };

  // Calculate marketplace statistics
  const calculateStats = (nftList) => {
    const totalItems = nftList.length;
    const prices = nftList.map(nft => parseFloat(nft.price)).filter(price => price > 0);
    const totalVolume = prices.reduce((sum, price) => sum + price, 0);
    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const uniqueOwners = new Set(nftList.map(nft => nft.owner)).size;

    setStats({
      totalItems,
      totalVolume: totalVolume.toFixed(2),
      floorPrice: floorPrice.toFixed(4),
      owners: uniqueOwners
    });
  };

  // Apply filters to NFTs
  useEffect(() => {
    let filtered = [...nfts];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(nft => 
        nft.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(nft => 
        nft.metadata?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        nft.metadata?.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      filtered = filtered.filter(nft => {
        const price = parseFloat(nft.price);
        const min = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
        const max = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => parseInt(b.listedAt) - parseInt(a.listedAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => parseInt(a.listedAt) - parseInt(b.listedAt));
        break;
      default:
        break;
    }

    setFilteredNfts(filtered);
  }, [nfts, filters]);

  // Buy NFT function
  const buyNFT = async (tokenId, price) => {
    try {
      const contract = await getSignerContract();
      if (!contract) {
        showToast('Please connect your wallet', 'error');
        return;
      }

      const tx = await contract.buyToken(tokenId, {
        value: ethers.parseEther(price)
      });

      showToast('Transaction submitted...', 'info');
      await tx.wait();
      showToast('NFT purchased successfully!', 'success');
      
      // Refresh marketplace data
      fetchMarketplaceData();
      
    } catch (error) {
      console.error('Error buying NFT:', error);
      showToast('Error purchasing NFT', 'error');
    }
  };

  // Make offer function
  const makeOffer = async (tokenId, offerAmount, expiresInDays = 7) => {
    try {
      const contract = await getSignerContract();
      if (!contract) {
        showToast('Please connect your wallet', 'error');
        return;
      }

      const tx = await contract.makeOffer(tokenId, expiresInDays, {
        value: ethers.parseEther(offerAmount.toString())
      });

      showToast('Offer submitted...', 'info');
      await tx.wait();
      showToast('Offer made successfully!', 'success');
      
    } catch (error) {
      console.error('Error making offer:', error);
      showToast('Error making offer', 'error');
    }
  };

  // Initialize marketplace data
  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  return (
    <div className="relative min-h-screen bg-nuvo-gradient pb-12">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 relative z-10">
        <div className="flex flex-col space-y-6 md:space-y-8">
          {/* Dashboard Header - Optimizado para mobile */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight">
                NFT Marketplace
              </h1>
              <p className="text-gray-300 text-base md:text-lg">Discover, collect, and trade unique digital assets</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => fetchMarketplaceData()}
                className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 btn-nuvo-base btn-nuvo-outline text-white font-medium transition-all duration-200 text-sm md:text-base"
              >
                🔄 Refresh Marketplace
              </button>
            </div>
          </div>
          
          {/* Stats Overview */}
          {stats && <MarketplaceStats stats={stats} />}
          
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="nuvos-marketplace-mobile-toggle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          
          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Filters Sidebar - Desktop Always Visible, Mobile Toggleable */}
            <div className={`${showMobileFilters ? 'block' : 'hidden lg:block'} lg:w-80 flex-shrink-0`}>
              <div className="sticky top-6">
                <MarketplaceFilters 
                  filters={filters} 
                  setFilters={setFilters}
                  categories={['all', 'arte', 'fotografia', 'musica', 'video', 'coleccionables']}
                />
              </div>
            </div>
            
            {/* NFT Grid Container */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 nuvos-marketplace-results-panel">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-1">
                    {filteredNfts.length} NFT{filteredNfts.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Showing {Math.min(20, filteredNfts.length)} of {filteredNfts.length} results
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="text-xs md:text-sm text-gray-400">
                    Page 1 of {Math.ceil(filteredNfts.length / 20)}
                  </div>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner size="large" />
                </div>
              ) : filteredNfts.length === 0 ? (
                <EmptyState 
                  message={nfts.length === 0 ? "No NFTs listed yet" : "No NFTs match your filters"}
                  showFilters={nfts.length > 0}
                />
              ) : (
                <NFTGrid 
                  nfts={filteredNfts.slice(0, 20)}
                  onBuy={buyNFT}
                  onMakeOffer={makeOffer}
                  currentAccount={account}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
