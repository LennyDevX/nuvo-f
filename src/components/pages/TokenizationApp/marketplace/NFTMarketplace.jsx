import React, { useState, useEffect, useContext } from 'react';
import { motion as m } from 'framer-motion';
import { FaSearch, FaFilter, FaSort, FaHeart, FaEye, FaDollarSign, FaGavel, FaSpinner } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';
import { getCSPCompliantImageURL, ipfsToHttp } from '../../../../utils/blockchain/blockchainUtils';
import { ethers } from 'ethers';
import SpaceBackground from '../../../effects/SpaceBackground';
import { WalletContext } from '../../../../context/WalletContext';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';

// Contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

const NFTMarketplace = () => {
  const { buyNFT, makeOffer, getListedToken } = useTokenization();
  const { account } = useContext(WalletContext);
  
  const [listedNFTs, setListedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDays, setOfferDays] = useState(7);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'coleccionables', label: 'Collectibles' },
    { value: 'arte', label: 'Art' },
    { value: 'fotografia', label: 'Photography' },
    { value: 'musica', label: 'Music' },
    { value: 'video', label: 'Video' }
  ];

  useEffect(() => {
    loadMarketplaceNFTs();
  }, []);

  const fetchTokenMetadata = async (tokenURI) => {
    try {
      if (!tokenURI) return {};
      
      const httpUrl = ipfsToHttp(tokenURI);
      const response = await fetch(httpUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return {};
    }
  };

  const loadMarketplaceNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, provider);

      console.log("Loading marketplace NFTs...");
      
      // Method 1: Get all TokenListed events
      try {
        const filter = contract.filters.TokenListed();
        const events = await contract.queryFilter(filter, -50000); // Increase range
        
        console.log(`Found ${events.length} TokenListed events`);
        
        const listedNFTsData = [];
        
        // Process each listed token
        for (const event of events) {
          try {
            const tokenId = event.args.tokenId.toString();
            console.log("Checking token:", tokenId);
            
            // Check if the NFT is still listed (not sold)
            const listingData = await contract.getListedToken(tokenId);
            
            // listingData: [tokenId, seller, owner, price, isForSale, timestamp, category]
            if (listingData[4]) { // isForSale is true
              const [tokenIdFromContract, seller, owner, price, isForSale, timestamp, category] = listingData;
              
              // FILTRO CLAVE: Excluir NFTs del usuario actual
              if (account && seller.toLowerCase() === account.toLowerCase()) {
                console.log(`Skipping NFT ${tokenId} - belongs to current user`);
                continue; // Skip this NFT, it belongs to the current user
              }
              
              console.log("Found listed NFT from other user:", {
                tokenId,
                seller,
                price: ethers.formatEther(price),
                category
              });
              
              // Get token metadata
              const tokenURI = await contract.tokenURI(tokenId);
              const metadata = await fetchTokenMetadata(tokenURI);
              
              // Get likes count
              let likesCount = 0;
              try {
                likesCount = await contract.getLikesCount(tokenId);
              } catch (e) {
                console.warn('Could not get likes count for token', tokenId);
              }

              const nftData = {
                id: tokenId,
                tokenId: tokenId,
                name: metadata.name || `NFT #${tokenId}`,
                description: metadata.description || 'No description available',
                image: metadata.image ? ipfsToHttp(metadata.image) : '/NFT-placeholder.webp',
                price: ethers.formatEther(price),
                priceWei: price.toString(),
                category: category,
                seller: seller,
                owner: owner,
                timestamp: parseInt(timestamp.toString()) * 1000, // Convert to milliseconds
                likes: parseInt(likesCount.toString()),
                views: Math.floor(Math.random() * 200) + 50, // Mock views for now
                attributes: metadata.attributes || [],
                tokenURI: tokenURI,
                isForSale: isForSale
              };

              listedNFTsData.push(nftData);
            }
          } catch (tokenError) {
            console.error(`Error processing token ${event.args.tokenId}:`, tokenError);
          }
        }
        
        // Remove duplicates (in case of multiple TokenListed events for same token)
        const uniqueNFTs = listedNFTsData.reduce((acc, current) => {
          const existing = acc.find(item => item.id === current.id);
          if (!existing) {
            acc.push(current);
          } else {
            // Keep the most recent one
            if (current.timestamp > existing.timestamp) {
              const index = acc.indexOf(existing);
              acc[index] = current;
            }
          }
          return acc;
        }, []);
        
        console.log(`Found ${uniqueNFTs.length} listed NFTs from other users`);
        setListedNFTs(uniqueNFTs);
        
      } catch (eventError) {
        console.error("Error fetching TokenListed events:", eventError);
        
        // Method 2: Fallback - scan through tokens manually
        console.log("Trying fallback method...");
        
        // Get recent TokenMinted events and check if they're listed
        const mintFilter = contract.filters.TokenMinted();
        const mintEvents = await contract.queryFilter(mintFilter, -50000);
        
        console.log(`Found ${mintEvents.length} TokenMinted events, checking for listings...`);
        
        const fallbackNFTs = [];
        
        for (const event of mintEvents.slice(-100)) { // Check last 100 minted tokens
          try {
            const tokenId = event.args.tokenId.toString();
            
            // Check if this token is listed
            const listingData = await contract.getListedToken(tokenId);
            
            if (listingData[4]) { // isForSale is true
              const [tokenIdFromContract, seller, owner, price, isForSale, timestamp, category] = listingData;
              
              // FILTRO CLAVE: Excluir NFTs del usuario actual
              if (account && seller.toLowerCase() === account.toLowerCase()) {
                console.log(`Skipping NFT ${tokenId} - belongs to current user (fallback)`);
                continue; // Skip this NFT, it belongs to the current user
              }
              
              console.log("Found listed NFT (fallback):", {
                tokenId,
                seller,
                price: ethers.formatEther(price),
                category
              });
              
              // Get token metadata
              const tokenURI = await contract.tokenURI(tokenId);
              const metadata = await fetchTokenMetadata(tokenURI);
              
              const nftData = {
                id: tokenId,
                tokenId: tokenId,
                name: metadata.name || `NFT #${tokenId}`,
                description: metadata.description || 'No description available',
                image: metadata.image ? ipfsToHttp(metadata.image) : '/NFT-placeholder.webp',
                price: ethers.formatEther(price),
                priceWei: price.toString(),
                category: category,
                seller: seller,
                owner: owner,
                timestamp: parseInt(timestamp.toString()) * 1000,
                likes: 0,
                views: Math.floor(Math.random() * 200) + 50,
                attributes: metadata.attributes || [],
                tokenURI: tokenURI,
                isForSale: isForSale
              };

              fallbackNFTs.push(nftData);
            }
          } catch (tokenError) {
            console.error(`Error in fallback method for token ${event.args.tokenId}:`, tokenError);
          }
        }
        
        setListedNFTs(fallbackNFTs);
        console.log(`Fallback found ${fallbackNFTs.length} listed NFTs from other users`);
      }
      
    } catch (error) {
      console.error('Error loading marketplace NFTs:', error);
      setError('Failed to load marketplace NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async (nft) => {
    try {
      if (!account) {
        alert('Please connect your wallet first');
        return;
      }

      // Use the price in Wei from the contract
      await buyNFT(nft.tokenId, nft.price);
      alert('NFT purchased successfully!');
      
      // Refresh the listings
      await loadMarketplaceNFTs();
    } catch (error) {
      console.error('Error buying NFT:', error);
      alert('Error purchasing NFT: ' + (error.message || 'Please try again'));
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount || offerAmount <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await makeOffer(selectedNFT.tokenId, offerAmount, offerDays);
      setShowOfferModal(false);
      setOfferAmount('');
      alert('Offer made successfully!');
    } catch (error) {
      console.error('Error making offer:', error);
      alert('Error making offer: ' + (error.message || 'Please try again'));
    }
  };

  const filteredAndSortedNFTs = listedNFTs
    .filter(nft => {
      const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nft.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || nft.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'likes':
          return b.likes - a.likes;
        case 'newest':
        default:
          return b.timestamp - a.timestamp;
      }
    });

  if (loading) {
    return (
      <div className="relative min-h-screen bg-nuvo-gradient pb-12">
        <SpaceBackground customClass="" />
        <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-purple-400 mx-auto mb-4" />
            <div className="text-white text-xl">Loading marketplace...</div>
            <div className="text-gray-300 text-sm mt-2">Fetching NFTs from blockchain</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-nuvo-gradient pb-12">
        <SpaceBackground customClass="" />
        <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <button 
              onClick={loadMarketplaceNFTs}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-nuvo-gradient pb-12">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text tracking-tight">
              NFT Marketplace
            </h1>
            <p className="text-gray-300">Discover and trade unique digital assets</p>
            {listedNFTs.length > 0 && (
              <p className="text-purple-400 text-sm mt-2">
                {listedNFTs.length} NFTs currently listed for sale
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <div className="nuvos-card backdrop-blur-md p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadMarketplaceNFTs}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <FaSpinner className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* NFT Grid */}
          {filteredAndSortedNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedNFTs.map((nft) => (
                <m.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="nuvos-card backdrop-blur-md p-4 hover:scale-105 transition-transform duration-200"
                >
                  <div className="relative group">
                    <img
                      src={getCSPCompliantImageURL(nft.image)}
                      alt={nft.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.src = '/NFT-placeholder.webp';
                      }}
                    />
                    
                    {/* Sale Status Badge */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                      For Sale
                    </div>

                    {/* Likes Badge */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <FaHeart className="text-red-500 mr-1" /> 
                      {nft.likes}
                    </div>
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <div className="flex space-x-4">
                        {account && account.toLowerCase() !== nft.seller.toLowerCase() && (
                          <>
                            <button
                              onClick={() => handleBuyNFT(nft)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <FaDollarSign className="text-sm" />
                              Buy Now
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNFT(nft);
                                setShowOfferModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <FaGavel className="text-sm" />
                              Offer
                            </button>
                          </>
                        )}
                        {!account && (
                          <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                            Connect Wallet to Buy
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white truncate">{nft.name}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2">{nft.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-purple-400 font-bold">
                        {parseFloat(nft.price).toFixed(4)} MATIC
                      </div>
                      <div className="flex items-center space-x-3 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                          <FaHeart className="text-red-400" />
                          {nft.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaEye />
                          {nft.views}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <div>Category: {nft.category}</div>
                      <div>Seller: {nft.seller.substring(0, 6)}...{nft.seller.substring(38)}</div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? "No NFTs found matching your criteria." 
                  : "No NFTs are currently listed for sale."
                }
              </div>
              {!searchTerm && selectedCategory === 'all' && (
                <p className="text-gray-500 text-sm">
                  Be the first to list an NFT in the marketplace!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Make an Offer</h3>
            <p className="text-gray-300 mb-4">
              Make an offer for <span className="font-semibold text-purple-400">{selectedNFT?.name}</span>
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Current price: {selectedNFT?.price} MATIC
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Offer Amount (MATIC)</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Offer Expires In (Days)</label>
                <select
                  value={offerDays}
                  onChange={(e) => setOfferDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleMakeOffer}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Make Offer
              </button>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferAmount('');
                  setSelectedNFT(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </m.div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;
