import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { ethers } from 'ethers';
import { WalletContext } from '../../../context/WalletContext';
import { useToast } from '../../../hooks/useToast';
import MarketplaceFilters from './components/MarketplaceFilters';
import NFTGrid from './components/NFTGrid';
import MarketplaceStats from './components/MarketplaceStats';
import LoadingSpinner from '../../ui/LoadingSpinner';
import EmptyState from './components/EmptyState';
import SpaceBackground from '../../effects/SpaceBackground';
import contractABI from '../../../Abi/Marketplace.json';
import NotConnectedMessage from '../../ui/NotConnectedMessage';
import { marketplaceCache } from '../../../utils/cache/MarketplaceCache';
import { normalizeCategory, getCategoryDisplayName, getAvailableCategories } from '../../../utils/blockchain/blockchainUtils';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS_V2;
console.log('Raw TOKENIZATION CONTRACT ADDRESS from env:', CONTRACT_ADDRESS);

// Make sure the address is valid by removing any surrounding whitespace
const cleanedAddress = CONTRACT_ADDRESS ? CONTRACT_ADDRESS.trim() : '';

// Validate the address format
const isValidAddress = ethers.isAddress(cleanedAddress);
console.log('Is tokenization address valid format?', isValidAddress);

// Use the valid address or fallback to V2 address
const TOKENIZATION_ADDRESS = isValidAddress ? cleanedAddress : "0xe8f1A205ACf4dBbb08d6d8856ae76212B9AE7582";
console.log('Final TOKENIZATION_ADDRESS being used:', TOKENIZATION_ADDRESS);

function MarketplaceDashboard(props) {
  const { account, provider, walletConnected, connectWallet } = useContext(WalletContext);
  const { showToast } = useToast();
  
  // States
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state for button
  const [configError, setConfigError] = useState(false);
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
    console.log('🔍 [MarketplaceDashboard] getContract called - provider:', !!provider, 'type:', typeof provider);
    console.log('🔍 [MarketplaceDashboard] TOKENIZATION_ADDRESS:', TOKENIZATION_ADDRESS);
    console.log('🔍 [MarketplaceDashboard] contractABI.abi exists:', !!contractABI.abi);
    
    if (!provider) {
      console.warn('⚠️ [MarketplaceDashboard] Provider is null or undefined');
      return null;
    }
    
    // Check if contract address is properly configured
    if (!TOKENIZATION_ADDRESS || !ethers.isAddress(TOKENIZATION_ADDRESS)) {
      console.error('❌ [MarketplaceDashboard] Invalid or missing TOKENIZATION_ADDRESS:', TOKENIZATION_ADDRESS);
      return null;
    }
    
    if (!contractABI || !contractABI.abi) {
      console.error('❌ [MarketplaceDashboard] Contract ABI is missing or invalid');
      return null;
    }
    
    try {
      console.log('🔧 [MarketplaceDashboard] Creating contract with:', {
        address: TOKENIZATION_ADDRESS,
        abiLength: contractABI.abi.length,
        providerType: provider.constructor.name,
        providerReady: provider._isProvider
      });
      
      // Additional validation before contract creation
      if (!provider._isProvider && !provider.provider) {
        console.error('❌ [MarketplaceDashboard] Provider is not properly initialized');
        return null;
      }
      
      const contract = new ethers.Contract(TOKENIZATION_ADDRESS, contractABI.abi, provider);
      console.log('✅ [MarketplaceDashboard] Contract created successfully:', !!contract);
      console.log('✅ [MarketplaceDashboard] Contract target:', contract.target);
      return contract;
    } catch (error) {
      console.error('❌ [MarketplaceDashboard] Error creating contract:', error);
      console.error('❌ [MarketplaceDashboard] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n')[0]
      });
      return null;
    }
  }, [provider]);

  // Get signer contract for transactions
  const getSignerContract = useCallback(async () => {
    if (!provider || !account) return null;
    
    // Check if contract address is properly configured
    if (!TOKENIZATION_ADDRESS || !ethers.isAddress(TOKENIZATION_ADDRESS)) {
      console.error('Invalid or missing TOKENIZATION_ADDRESS:', TOKENIZATION_ADDRESS);
      return null;
    }
    
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

    // Check if provider is available before proceeding
    if (!provider) {
      console.log('Provider not available yet, skipping fetch');
      setLoading(false);
      return;
    }

    // Check if we should use cache
    if (!forceRefresh) {
      const cachedListings = marketplaceCache.getMarketplaceListings(TOKENIZATION_ADDRESS);
      const cachedStats = marketplaceCache.getMarketplaceStats(TOKENIZATION_ADDRESS);
      
      if (cachedListings && cachedStats) {
        console.log('Using cached marketplace data', { listings: cachedListings.length, stats: cachedStats });
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
        console.warn('No contract available - provider:', !!provider, 'address:', TOKENIZATION_ADDRESS);
        
        // Only set configuration error if we don't have a valid fallback address
        if (!TOKENIZATION_ADDRESS || !ethers.isAddress(TOKENIZATION_ADDRESS)) {
          setConfigError(true);
        } else {
          setConfigError(false);
        }
        
        setStats({
          totalItems: 0,
          totalVolume: '0',
          floorPrice: '0',
          owners: 0
        });
        setNfts([]);
        setFilteredNfts([]);
        setLoading(false);
        fetchingRef.current = false;
        return;
      } else {
        // Contract is available, clear any configuration error
        setConfigError(false);
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
        while (tokenId <= maxTokenId) {
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

              // Check if token exists before calling getListedToken
              try {
                await contract.ownerOf(id);
              } catch (err) {
                // Token does not exist, skip silently
                return null;
              }

              let tokenData;
              try {
                tokenData = await contract.getListedToken(id);
              } catch (error) {
                // If getListedToken fails, skip this token silently
                return null;
              }

              // If the call succeeds, process as before
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
              // Suppress all expected contract errors (CALL_EXCEPTION, missing revert data, etc.)
              // Only log unexpected errors once per session
              if (
                error.code !== 'CALL_EXCEPTION' &&
                !String(error.message || '').includes('missing revert data')
              ) {
                // You can add a flag to avoid logging the same error repeatedly if needed
                console.warn(`Unexpected error checking token ${id}:`, error.message);
              }
              return null;
            }
          });

          const batchResults = await Promise.allSettled(batchPromises);

          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              if (result.value && result.value.isListed) {
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
                    category: normalizeCategory(tokenData[6]), // Normalize category here
                    originalCategory: tokenData[6], // Keep original for debugging
                    tokenURI,
                    metadata,
                    image: metadata.image,
                    name: metadata.name,
                    description: metadata.description
                  };

                  listedNfts.push(nftData);
                  console.log(`Added NFT ${result.value.tokenId} to marketplace with category: ${nftData.category}, price: ${nftData.price}`);
                } catch (metadataError) {
                  console.warn(`Error fetching metadata for token ${result.value.tokenId}:`, metadataError);
                }
              }
            }
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
      console.log('Calculated stats:', calculatedStats);
      marketplaceCache.setMarketplaceStats(TOKENIZATION_ADDRESS, calculatedStats);
      setStats(calculatedStats);
      
      lastFetchTime.current = Date.now();
      
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      if (!forceRefresh) {
        showToast('Error loading marketplace data', 'error');
      }
      // Set empty stats on error
      setStats({
        totalItems: 0,
        totalVolume: '0',
        floorPrice: '0',
        owners: 0
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [getContract, showToast]);

  // Optimized stats calculation
  const calculateStatsOptimized = (nftList) => {
    console.log('Calculating stats for NFTs:', nftList.length);
    
    if (!nftList || nftList.length === 0) {
      return {
        totalItems: 0,
        totalVolume: '0',
        floorPrice: '0',
        owners: 0
      };
    }

    const prices = nftList
      .map(nft => parseFloat(nft.price))
      .filter(price => !isNaN(price) && price > 0);
    
    console.log('Valid prices found:', prices);
    
    const totalVolume = prices.reduce((sum, price) => sum + price, 0);
    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const uniqueOwners = new Set(nftList.map(nft => nft.owner).filter(owner => owner)).size;

    const stats = {
      totalItems: nftList.length,
      totalVolume: totalVolume.toFixed(2),
      floorPrice: floorPrice.toFixed(4),
      owners: uniqueOwners
    };
    
    console.log('Final calculated stats:', stats);
    return stats;
  };

  // Apply filters to NFTs
  useEffect(() => {
    let filtered = [...nfts];
    
    console.log('Marketplace filtering:', {
      totalNFTs: nfts.length,
      filterCategory: filters.category,
      nftCategories: nfts.map(nft => ({
        id: nft.tokenId,
        originalCategory: nft.originalCategory,
        normalizedCategory: nft.category
      }))
    });

    // Category filter with improved matching
    if (filters.category !== 'all') {
      const targetCategory = normalizeCategory(filters.category);
      console.log('Filtering by normalized category:', targetCategory);
      
      filtered = filtered.filter(nft => {
        const nftCategory = nft.category; // Already normalized when fetched
        const matches = nftCategory === targetCategory;
        
        if (!matches) {
          console.log(`NFT ${nft.tokenId} category "${nftCategory}" doesn't match filter "${targetCategory}"`);
        }
        
        return matches;
      });
      
      console.log(`Filtered to ${filtered.length} NFTs for category "${targetCategory}"`);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(nft => 
        nft.metadata?.name?.toLowerCase().includes(searchTerm) ||
        nft.metadata?.description?.toLowerCase().includes(searchTerm) ||
        nft.name?.toLowerCase().includes(searchTerm) ||
        nft.description?.toLowerCase().includes(searchTerm)
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

    console.log('Final filtered NFTs in marketplace:', filtered.length);
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
  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true);
    marketplaceCache.invalidateMarketplace(TOKENIZATION_ADDRESS);
    try {
      await fetchMarketplaceData(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMarketplaceData]);

  // Effect: Load marketplace data with throttling
  useEffect(() => {
    console.log('Marketplace useEffect triggered:', {
      walletConnected,
      hasAccount: !!account,
      hasProvider: !!provider,
      providerType: provider?.constructor?.name
    });
    
    if (walletConnected && account && provider) {
      // Additional check to ensure provider is fully initialized
      const testProvider = async () => {
        try {
          // Test if provider is working by calling a simple method
          await provider.getNetwork();
          console.log('Provider test successful, proceeding with marketplace data fetch');
          
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
        } catch (error) {
          console.warn('Provider not ready yet:', error.message);
          // Retry after a short delay
          setTimeout(() => {
            if (walletConnected && account && provider) {
              testProvider();
            }
          }, 2000);
        }
      };
      
      testProvider();
    } else {
      console.log('Clearing marketplace data - wallet not connected or missing dependencies');
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

  // Get available categories for filters
  const availableCategories = getAvailableCategories().map(cat => cat.value);

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

  // Show configuration error if contract address is not set
  if (configError) {
    return (
      <div className="relative min-h-screen bg-nuvo-gradient pb-12">
        <SpaceBackground customClass="" />
        <div className="container mx-auto px-3 md:px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">Marketplace Configuration Error</h2>
              <p className="text-gray-300 mb-6">
                The marketplace contract address is not properly configured. 
                Please check your environment variables.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Expected environment variable:</p>
                <code className="text-yellow-400 text-sm">VITE_TOKENIZATION_ADDRESS_V2</code>
                <p className="text-sm text-gray-400 mt-2">Current value:</p>
                <code className="text-red-400 text-sm">{TOKENIZATION_ADDRESS || 'undefined'}</code>
              </div>
              <p className="text-sm text-gray-500">
                Please contact the administrator or check the deployment configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-nuvo-gradient pb-12">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 relative z-10">
        <div className="flex flex-col space-y-6 md:space-y-8">
          {/* Dashboard Header - with mint button */}
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
            {/* Add Mint NFT Button */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Link 
                to="/tokenize"
                className="flex items-center justify-center gap-2 px-6 py-2.5 btn-nuvo-base bg-nuvo-gradient-button text-white font-medium transition-all duration-200 border border-purple-500/20 hover:border-pink-500/30"
              >
                <FaPlus className="text-sm" /> Mint NFTs
              </Link>
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
                  categories={availableCategories}
                />
              </div>
            </div>
            {/* Results Area */}
            <div className="flex-1 min-w-0">
              {/* Results Header - with refresh button */}
              {!loading && (
                <div className="nuvos-marketplace-container mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="nuvos-marketplace-stat-content-compact">
                      <h2 className="text-lg md:text-xl font-semibold text-white mb-1 nuvos-marketplace-stat-value-compact">
                        {filteredNfts.length} NFT{filteredNfts.length !== 1 ? 's' : ''} Found
                      </h2>
                      <p className="text-gray-400 text-xs md:text-sm nuvos-marketplace-stat-label-compact">
                        Showing {Math.min(20, filteredNfts.length)} of {filteredNfts.length} results
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm text-gray-500 font-medium">
                          Page 1 of {Math.ceil(filteredNfts.length / 20)}
                        </span>
                        {Math.ceil(filteredNfts.length / 20) > 1 && (
                          <div className="flex items-center gap-1 ml-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={handleManualRefresh}
                        disabled={loading || fetchingRef.current || refreshing}
                        className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 btn-nuvo-base btn-nuvo-outline text-white font-medium transition-all duration-200 text-xs md:text-sm disabled:opacity-50 whitespace-nowrap relative"
                      >
                        {refreshing ? (
                          <>
                            <LoadingSpinner size="small" variant="dots" className="text-purple-400" />
                            <span className="ml-1">Refreshing...</span>
                          </>
                        ) : (
                          <>
                            🔄 Refresh
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Content with refresh overlay */}
              <div className="relative">
                {/* Refresh overlay - shown when refreshing but not initial loading */}
                {refreshing && !loading && (
                  <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="bg-gray-800/90 p-4 rounded-lg border border-purple-500/30">
                      <LoadingSpinner 
                        size="medium" 
                        variant="orbit"
                        text="Refreshing Marketplace"
                        showDots={true}
                        className="text-purple-400"
                      />
                    </div>
                  </div>
                )}

                {/* Main Content */}
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
                    refreshing={refreshing}
                  />
                )}
              </div>
            </div>    
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default MarketplaceDashboard;
