import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
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
import NotConnectedMessage from '../../ui/NotConnectedMessage';
import { marketplaceCache } from '../../../utils/cache/MarketplaceCache';

const TOKENIZATION_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

function MarketplaceDashboard(props) {
  const { account, provider, walletConnected, connectWallet } = useContext(WalletContext);
  const { showToast } = useToast();
  
  // States
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
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
  
  // Refs for preventing duplicate calls
  const fetchingRef = useRef(false);
  const lastFetchTime = useRef(0);

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

  // Enhanced metadata fetching with cache
  const fetchMetadata = async (tokenURI) => {
    try {
      if (!tokenURI) {
        return {
          name: `NFT #Unknown`,
          description: 'No hay descripción disponible',
          image: '/NFT-placeholder.webp',
          attributes: []
        };
      }

      // Check cache first
      const cachedMetadata = marketplaceCache.getTokenMetadata(tokenURI);
      if (cachedMetadata) {
        console.log('Using cached metadata for:', tokenURI);
        return cachedMetadata;
      }

      let url = tokenURI;
      if (tokenURI.startsWith('ipfs://')) {
        const ipfsHash = tokenURI.replace('ipfs://', '');
        url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      let metadata;
      for (let attempt = 0; attempt < 2; attempt++) { // Reduced retries
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
          const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          metadata = await response.json();
          break;
        } catch (fetchErr) {
          if (attempt === 1) throw fetchErr;
          await new Promise(r => setTimeout(r, 500));
        }
      }

      // Fix IPFS image URLs consistently
      if (metadata.image) {
        if (metadata.image.startsWith('ipfs://')) {
          const imageHash = metadata.image.replace('ipfs://', '');
          metadata.image = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
        }
        // Ensure the image URL is valid
        console.log('Processed image URL:', metadata.image);
      } else {
        metadata.image = '/NFT-placeholder.webp';
      }

      // Ensure all required fields exist
      metadata.name = metadata.name || `NFT #Unknown`;
      metadata.description = metadata.description || 'No description available';
      metadata.attributes = metadata.attributes || [];

      // Cache the result
      marketplaceCache.setTokenMetadata(tokenURI, metadata);
      return metadata;

    } catch (err) {
      console.error("Error fetching metadata:", err);
      const fallbackMetadata = {
        name: `NFT #Unknown`,
        description: 'Error al cargar metadatos',
        image: '/NFT-placeholder.webp',
        attributes: []
      };
      // Cache fallback to prevent repeated failures
      marketplaceCache.setTokenMetadata(tokenURI, fallbackMetadata);
      return fallbackMetadata;
    }
  };

  // Optimized marketplace data fetching
  const fetchMarketplaceData = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }

    // Check if we should use cache
    if (!forceRefresh) {
      const cachedListings = marketplaceCache.getMarketplaceListings(TOKENIZATION_ADDRESS);
      const cachedStats = marketplaceCache.getMarketplaceStats(TOKENIZATION_ADDRESS);
      
      if (cachedListings && cachedStats) {
        console.log('Using cached marketplace data');
        setNfts(cachedListings);
        setFilteredNfts(cachedListings);
        setStats(cachedStats);
        setLoading(false);
        
        // Start background refresh if cache is older than 1 minute
        const now = Date.now();
        if (now - lastFetchTime.current > 60000) {
          setTimeout(() => {
            setBackgroundRefreshing(true);
            fetchMarketplaceData(true).finally(() => setBackgroundRefreshing(false));
          }, 1000);
        }
        return;
      }
    }

    fetchingRef.current = true;
    
    try {
      if (!forceRefresh) setLoading(true);
      
      const contract = getContract();
      if (!contract) {
        console.warn('No contract available');
        return;
      }

      console.log('Fetching marketplace data from blockchain...');
      
      // Optimized token discovery using events (if available)
      let listedNfts = [];
      
      try {
        // Try to get token range more efficiently
        const totalSupplyMethod = contract.totalSupply || contract.getCurrentTokenId;
        let maxTokenId = 100; // Default fallback
        
        if (totalSupplyMethod) {
          try {
            const totalSupply = await totalSupplyMethod();
            maxTokenId = Math.min(Number(totalSupply) + 5, 200); // Add buffer but cap at 200
            console.log(`Using total supply: ${maxTokenId} tokens to check`);
          } catch (e) {
            console.log('Could not get total supply, using default range');
          }
        }

        // Batch token checks for better performance
        const BATCH_SIZE = 10;
        let tokenId = 1;
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 5;
        
        while (tokenId <= maxTokenId && consecutiveErrors < maxConsecutiveErrors) {
          const batch = [];
          for (let i = 0; i < BATCH_SIZE && tokenId <= maxTokenId; i++, tokenId++) {
            batch.push(tokenId);
          }
          
          // Process batch in parallel
          const batchPromises = batch.map(async (id) => {
            try {
              // Check cache first
              const cachedListing = marketplaceCache.getTokenListing(TOKENIZATION_ADDRESS, id);
              if (cachedListing && !forceRefresh) {
                return cachedListing.isListed ? cachedListing : null;
              }

              const tokenData = await contract.getListedToken(id);
              const listingData = {
                tokenId: id,
                tokenData,
                isListed: tokenData[4],
                checkedAt: Date.now()
              };
              
              // Cache the result
              marketplaceCache.setTokenListing(TOKENIZATION_ADDRESS, id, listingData);
              
              return tokenData[4] ? listingData : null;
            } catch (error) {
              if (error.message.includes('TokenDoesNotExist')) {
                return 'END_OF_TOKENS';
              }
              throw error;
            }
          });
          
          try {
            const batchResults = await Promise.allSettled(batchPromises);
            let foundEndOfTokens = false;
            
            for (const result of batchResults) {
              if (result.status === 'fulfilled') {
                if (result.value === 'END_OF_TOKENS') {
                  foundEndOfTokens = true;
                  break;
                } else if (result.value && result.value.isListed) {
                  // Fetch metadata for listed tokens
                  const { tokenData } = result.value;
                  try {
                    const tokenURI = await contract.tokenURI(result.value.tokenId);
                    const metadata = await fetchMetadata(tokenURI);
                    
                    const nftData = {
                      tokenId: tokenData[0].toString(),
                      owner: tokenData[1],
                      seller: tokenData[2],
                      price: ethers.formatEther(tokenData[3]),
                      isListed: tokenData[4],
                      listedAt: tokenData[5].toString(),
                      category: tokenData[6],
                      tokenURI,
                      metadata,
                      image: metadata.image, // This should now have the correct URL
                      name: metadata.name,
                      description: metadata.description
                    };
                    
                    listedNfts.push(nftData);
                    console.log(`Added NFT ${result.value.tokenId} to marketplace`);
                  } catch (metadataError) {
                    console.warn(`Error fetching metadata for token ${result.value.tokenId}:`, metadataError);
                  }
                }
                consecutiveErrors = 0;
              } else {
                consecutiveErrors++;
              }
            }
            
            if (foundEndOfTokens) {
              console.log(`Reached end of tokens at batch starting with ${batch[0]}`);
              break;
            }
            
          } catch (batchError) {
            console.error('Error processing batch:', batchError);
            consecutiveErrors++;
          }
        }

      } catch (error) {
        console.error('Error in optimized token discovery:', error);
        showToast('Error loading marketplace data', 'error');
      }

      console.log(`Found ${listedNfts.length} listed NFTs`);
      
      // Cache the results
      marketplaceCache.setMarketplaceListings(TOKENIZATION_ADDRESS, listedNfts);
      
      setNfts(listedNfts);
      setFilteredNfts(listedNfts);
      
      // Calculate and cache stats
      const calculatedStats = calculateStatsOptimized(listedNfts);
      marketplaceCache.setMarketplaceStats(TOKENIZATION_ADDRESS, calculatedStats);
      setStats(calculatedStats);
      
      lastFetchTime.current = Date.now();
      
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      if (!forceRefresh) {
        showToast('Error loading marketplace data', 'error');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [getContract, showToast]);

  // Optimized stats calculation
  const calculateStatsOptimized = (nftList) => {
    if (nftList.length === 0) {
      return {
        totalItems: 0,
        totalVolume: '0',
        floorPrice: '0',
        owners: 0
      };
    }

    const prices = nftList.map(nft => parseFloat(nft.price)).filter(price => price > 0);
    const totalVolume = prices.reduce((sum, price) => sum + price, 0);
    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const uniqueOwners = new Set(nftList.map(nft => nft.owner)).size;

    return {
      totalItems: nftList.length,
      totalVolume: totalVolume.toFixed(2),
      floorPrice: floorPrice.toFixed(4),
      owners: uniqueOwners
    };
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

  // Prefetch next NFTs for better UX
  useEffect(() => {
    if (filteredNfts.length > 20) {
      const nextPageURIs = filteredNfts.slice(20, 40).map(nft => nft.tokenURI);
      prefetchNFTMetadata(nextPageURIs);
    }
  }, [filteredNfts]);

  // Prefetch metadata function for better UX
  const prefetchNFTMetadata = async (uriList) => {
    try {
      for (const uri of uriList.slice(0, 5)) { // Limit to 5 to avoid rate limiting
        if (uri && !localStorage.getItem(`nuvo-cache-metadata-${uri}`)) {
          try {
            const metadata = await fetchMetadata(uri);
            localStorage.setItem(`nuvo-cache-metadata-${uri}`, JSON.stringify(metadata));
          } catch (err) {
            console.log(`Prefetch failed for ${uri}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.log("Prefetch error:", err);
    }
  };

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
      
      // Invalidate cache and refresh
      marketplaceCache.invalidateMarketplace(TOKENIZATION_ADDRESS);
      marketplaceCache.delete(`token_listing_${tokenId}_${TOKENIZATION_ADDRESS}`);
      fetchMarketplaceData(true);
      
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

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    marketplaceCache.invalidateMarketplace(TOKENIZATION_ADDRESS);
    fetchMarketplaceData(true);
  }, [fetchMarketplaceData]);

  // Effect: Load marketplace data with throttling
  useEffect(() => {
    if (walletConnected && account && provider) {
      const now = Date.now();
      if (now - lastFetchTime.current > 5000) { // Throttle to every 5 seconds minimum
        fetchMarketplaceData();
      } else {
        // Use cached data if available
        const cachedListings = marketplaceCache.getMarketplaceListings(TOKENIZATION_ADDRESS);
        if (cachedListings) {
          setNfts(cachedListings);
          setFilteredNfts(cachedListings);
          setLoading(false);
        } else {
          fetchMarketplaceData();
        }
      }
    } else {
      setNfts([]);
      setFilteredNfts([]);
      setStats({
        totalItems: 0,
        totalVolume: '0',
        floorPrice: '0',
        owners: 0
      });
    }
  }, [walletConnected, account, provider, fetchMarketplaceData]);

  // Conditionally render the not connected message
  if (!walletConnected || !account || !provider) {
    return (
      <div className="relative min-h-screen bg-nuvo-gradient pb-12">
        <SpaceBackground customClass="" />
        <div className="container mx-auto px-3 md:px-4 py-8 relative z-10">
          <NotConnectedMessage
            title="Connect Wallet"
            message="Please connect your wallet to explore and trade NFTs in the marketplace."
            connectWallet={connectWallet}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-nuvo-gradient pb-12">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 relative z-10">
        <div className="flex flex-col space-y-6 md:space-y-8">
          {/* Dashboard Header - with cache status */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight">
                NFT Marketplace
                {backgroundRefreshing && (
                  <span className="ml-3 text-sm text-yellow-400">🔄 Updating...</span>
                )}
              </h1>
              <p className="text-gray-300 text-base md:text-lg">Discover, collect, and trade unique digital assets</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button 
                onClick={handleManualRefresh}
                disabled={loading || fetchingRef.current}
                className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 btn-nuvo-base btn-nuvo-outline text-white font-medium transition-all duration-200 text-sm md:text-base disabled:opacity-50"
              >
                🔄 {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Stats Overview */}
          {stats && <MarketplaceStats stats={stats} />}
          
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="btn-nuvo-base btn-nuvo-outline w-full flex items-center justify-center gap-2 px-4 py-3 text-sm md:text-base"
              aria-label="Toggle Filters">
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
                <div className="flex flex-col justify-center items-center py-20 space-y-6">
                  <LoadingSpinner 
                    size="xl" 
                    variant="orbit"
                    text="Loading Marketplace"
                    showDots={true}
                    className="text-purple-400"
                  />
                  <div className="text-center max-w-md">
                    <p className="text-white font-medium mb-2">Discovering NFTs...</p>
                    <p className="text-gray-400 text-sm">Fetching marketplace data from blockchain</p>
                    
                  </div>
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
