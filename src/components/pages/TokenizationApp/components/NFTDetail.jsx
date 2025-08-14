import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy, FaStore } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import MarketplaceABI from '../../../../Abi/Marketplace.json';
import IPFSImage from '../../../ui/IPFSImage';
import useListNFT from '../../../../hooks/nfts/useListNFT';
import { getCSPCompliantImageURL, getOptimizedImageUrl, getCategoryDisplayName, normalizeCategory } from '../../../../utils/blockchain/blockchainUtils';

// Agregar un simple sistema de caché para evitar llamadas repetidas
const nftCache = new Map();
// Caché para metadatos
const metadataCache = new Map();

// Ensure we have the contract address from environment variables or hardcoded fallback
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS_V2 || "0xe8f1A205ACf4dBbb08d6d8856ae76212B9AE7582";

// Debug log
console.log("TokenizationApp Contract Address:", CONTRACT_ADDRESS);

// Utilidad para abreviar wallets
const formatWallet = (address) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const NFTDetail = () => {
  const { tokenId } = useParams();
  const { account, walletConnected } = useContext(WalletContext);
  const navigate = useNavigate();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  // Nuevo estado para mostrar el formulario de listado
  const [showListForm, setShowListForm] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [listCategory, setListCategory] = useState(nft?.category || 'collectible');
  const [isLiking, setIsLiking] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  
  const { listNFT, loading: listingLoading, error: listingError, success: listingSuccess, txHash } = useListNFT();
  const callCountRef = useRef(0);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!tokenId) return;
      
      // Avoid multiple simultaneous requests
      if (fetchingRef.current) {
        console.log("Fetch already in progress, avoiding duplicate call");
        return;
      }
      
      // Check cache
      const cacheKey = `nft-${tokenId}`;
      if (nftCache.has(cacheKey)) {
        console.log("Using cached data for NFT", tokenId);
        const cachedData = nftCache.get(cacheKey);
        setNft(cachedData.nft);
        setLikesCount(cachedData.likesCount);
        setHasLiked(cachedData.hasLiked);
        setLoading(false);
        return;
      }
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // Enhanced validation with logging
        // Removed prefetchNFTMetadata call as it's not defined

        console.log("Validating address:", CONTRACT_ADDRESS);
        console.log("Is valid address:", ethers.isAddress(CONTRACT_ADDRESS));

        // Correct hexadecimal format for Ethereum address
        const formattedAddress = CONTRACT_ADDRESS.trim().toLowerCase();
        
        if (!formattedAddress || !ethers.isAddress(formattedAddress)) {
          console.error("Validation failed for address:", formattedAddress);
          setError("Invalid or unconfigured contract address.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Validate tokenId
        if (isNaN(tokenId) || Number(tokenId) < 0) {
          setError("Invalid token ID.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        console.log("Attempting to connect with address:", formattedAddress);
        
        // Connect to provider with delay to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          formattedAddress,
          MarketplaceABI.abi,
          provider
        );

        // Get token URI
        let tokenURI;
        try {
          tokenURI = await contract.tokenURI(tokenId);
          if (!tokenURI) throw new Error("Contract did not return a valid tokenURI.");
          console.log("Token URI obtained:", tokenURI);
        } catch (err) {
          console.error("Error getting tokenURI:", err);
          setError("NFT not found or contract did not return valid data.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Get metadata from IPFS
        const metadata = await fetchMetadata(tokenURI);
        console.log("Metadata:", metadata);
        
        // Get token details in marketplace
        let tokenDetails;
        try {
          tokenDetails = await contract.getListedToken(tokenId);
          console.log("Token details:", tokenDetails);
        } catch (err) {
          console.error("Error getting token details:", err);
          setError("Could not get token details from marketplace.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Get likes count and if current user has liked
        let likesCount = 0;
        let hasLiked = false;
        try {
          // First check if contract has these functions implemented
          if (typeof contract.getLikesCount === 'function') {
            likesCount = await contract.getLikesCount(tokenId);
            
            if (walletConnected && typeof contract.hasUserLiked === 'function') {
              hasLiked = await contract.hasUserLiked(tokenId, account);
            }
          } else {
            console.log("Contract does not implement getLikesCount function");
          }
        } catch (err) {
          console.warn("Error getting likes:", err);
          // If it fails, continue without likes and add necessary logs
          console.log("Continuing without likes information");
        }
        
        // Get original creator/owner address
        let owner = "";
        try {
          owner = await contract.ownerOf(tokenId);
          if (!owner || owner === ethers.ZeroAddress) {
            owner = "0x0000000000000000000000000000000000000000";
          }
        } catch (err) {
          console.warn("Error getting owner:", err);
          owner = "0x0000000000000000000000000000000000000000";
        }
        
        console.log("NFT data retrieved successfully");
        
        const nftData = {
          tokenId,
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || '',
          image: metadata?.image || '',
          attributes: metadata?.attributes || [],
          seller: tokenDetails[1],
          owner,
          price: tokenDetails[3].toString(),
          isForSale: tokenDetails[4],
          listedTimestamp: tokenDetails[5].toString(),
          category: tokenDetails[6]
        };
        
        // Save to cache
        nftCache.set(`nft-${tokenId}`, {
          nft: nftData,
          likesCount: likesCount.toString(),
          hasLiked
        });
        
        setNft(nftData);
        setLikesCount(likesCount.toString());
        setHasLiked(hasLiked);
      } catch (err) {
        console.error("Error fetching NFT details:", err);
        setError(err.message || "Error loading NFT details");
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    
    fetchNFTDetails();
    
    // Cleanup to avoid updates on unmounted components
    return () => {
      fetchingRef.current = true; // Prevents more calls during unmounting
    };
  }, [tokenId, account, walletConnected]);
  
  // Helper function to get metadata from IPFS with enhanced caching
  const fetchMetadata = async (uri) => {
    try {
      if (!uri) {
        return {
          name: `NFT #${tokenId}`,
          description: 'No description available',
          image: '/NFT-X1.webp',
          attributes: []
        };
      }
      
      // Use enhanced cache for metadata
      if (metadataCache.has(uri)) {
        console.log("Using cached metadata for URI:", uri);
        return metadataCache.get(uri);
      }

      const ipfsURL = getCSPCompliantImageURL(uri);
      const response = await fetch(ipfsURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const metadata = await response.json();

      metadataCache.set(uri, metadata);
      return metadata;
    } catch (error) {
      console.error("Error fetching metadata from IPFS:", error);
      return {
        name: `NFT #${tokenId}`,
        description: 'Error loading description.',
        image: '/NFT-X1.webp',
        attributes: []
      };
    }
  };

  const handleLike = async () => {
    if (!walletConnected || !account || isLiking) {
      toast.error('Please connect your wallet to like this NFT');
      return;
    }
    
    setIsLiking(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceABI.abi,
        signer
      );
      
      // Toggle like state
      const newLikeState = !hasLiked;
      
      // Call smart contract function
      const tx = await contract.toggleLike(tokenId, newLikeState);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Update local state
        setHasLiked(newLikeState);
        setLikesCount(prev => {
          const currentCount = typeof prev === 'string' ? parseInt(prev) : prev;
          return newLikeState ? currentCount + 1 : Math.max(0, currentCount - 1);
        });
        
        toast.success(newLikeState ? 'NFT liked successfully!' : 'NFT unliked successfully!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error('Failed to update like. Please try again.');
      }
    } finally {
      setIsLiking(false);
    }
  };

  // Add missing share function
  const handleShare = async () => {
    if (shareLoading) return;
    
    setShareLoading(true);
    
    try {
      const shareUrl = `${window.location.origin}/nft/${tokenId}`;
      const shareText = `Check out this amazing NFT: ${nft.name || `NFT #${tokenId}`}`;
      
      // Try native Web Share API first (mobile)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({
          title: nft.name || `NFT #${tokenId}`,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        
        // Reset copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      if (error.name === 'AbortError') {
        // User cancelled share dialog
        toast.info('Share cancelled');
      } else {
        // Fallback: Try copying to clipboard
        try {
          const shareUrl = `${window.location.origin}/nft/${tokenId}`;
          const shareText = `Check out this amazing NFT: ${nft.name || `NFT #${tokenId}`}`;
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 3000);
        } catch (clipboardError) {
          toast.error('Failed to share. Please try again.');
        }
      }
    } finally {
      setShareLoading(false);
    }
  };

  // Add missing marketplace navigation function
  const handleGoToMarketplace = () => {
    navigate('/marketplace');
  };

  // Handler para mostrar el formulario de listado
  const handleShowListForm = () => setShowListForm(true);
  const handleHideListForm = () => setShowListForm(false);

  // Handler para listar NFT (debes conectar con tu lógica real)
  const handleListNFT = (e) => {
    e.preventDefault();
    listNFT({
      tokenId: nft.tokenId,
      price: listPrice,
      category: listCategory
    });
    setShowListForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen pb-20"
    >
      <SpaceBackground />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link 
          to="/marketplace" 
          className="inline-flex items-center gap-3 px-4 py-2 mb-8 bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-md border border-gray-600/40 hover:border-purple-500/50 rounded-lg text-white transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <FaArrowLeft className="text-purple-400" />
          <span className="font-medium text-white">Back to Marketplace</span>
        </Link>
        
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {nft && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Image Section */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 shadow-lg border border-gray-700/50">
                  <div className="aspect-square w-full">
                    <IPFSImage
                      src={getOptimizedImageUrl(nft.image)}
                      alt={nft.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Details Section */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-700/50 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-gray-700/80 px-3 py-1 rounded-full text-white font-medium">#{nft.tokenId}</span>
                    <span className="bg-purple-600 px-3 py-1 rounded-full text-white font-medium">
                      {getCategoryDisplayName(nft.category)}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">{nft.name}</h1>
                </div>
                
                {/* Price Section */}
                <div className="bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                  <span className="text-gray-300 font-medium block mb-2">Current Price</span>
                  <div className="flex items-center text-2xl lg:text-3xl font-bold text-white mb-2">
                    <FaEthereum className="mr-2 text-blue-400" />
                    <span>{parseFloat(ethers.formatEther(nft.price)).toFixed(2)} POL</span>
                  </div>
                  {nft.isForSale && (
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <FaCheck className="inline mr-2 bg-green-500/20 text-green-400 rounded-full p-0.5" />
                      <span>Available for purchase</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleGoToMarketplace}
                      className="btn-nuvo-base bg-nuvo-gradient-button w-full"
                    >
                      <FaStore className="w-4 h-4" />
                      <span className="font-medium">Explore</span>
                    </button>
                    <button
                      onClick={handleShowListForm}
                      className="btn-nuvo-base btn-nuvo-primary w-full"
                      disabled={nft.isForSale}
                    >
                      {nft.isForSale ? 'Already Listed' : 'List NFT'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`btn-nuvo-base btn-nuvo-outline w-full ${
                        hasLiked ? 'active-like' : ''
                      }`}
                    >
                      {isLiking ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent  rounded-full animate-spin" />
                      ) : (
                        <FaHeart />
                      )}
                      <span>{hasLiked ? 'Liked' : 'Like'} ({likesCount})</span>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      disabled={shareLoading}
                      className="btn-nuvo-base btn-nuvo-outline share w-full"
                    >
                      {shareLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : copied ? (
                        <FaCheck />
                      ) : (
                        <FaShareAlt />
                      )}
                      <span>{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                  
                  {/* Listing Form */}
                  {showListForm && (
                    <form onSubmit={handleListNFT} className="bg-gray-900/70 p-4 rounded-lg mt-3 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3">List your NFT</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Price (POL)</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={listPrice}
                            onChange={e => setListPrice(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Category</label>
                          <input
                            type="text"
                            value={listCategory}
                            onChange={e => setListCategory(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button type="submit" className="btn-nuvo-base bg-blue-600 hover:bg-blue-700 text-white flex-1">Confirm Listing</button>
                        <button type="button" onClick={handleHideListForm} className="btn-nuvo-base bg-gray-600 hover:bg-gray-700 text-white flex-1">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
                
                {/* Description */}
                {nft.description && (
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{nft.description}</p>
                  </div>
                )}
                
                {/* Attributes */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Attributes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className="bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 text-center">
                          <div className="text-purple-400 text-sm uppercase tracking-wider font-medium">
                            {attr.trait_type}
                          </div>
                          <div className="text-white font-semibold mt-1 text-lg break-all">
                            {(() => {
                              const value = String(attr.value);
                              const traitType = String(attr.trait_type).toLowerCase();

                              if (ethers.isAddress(value)) {
                                return formatWallet(value);
                              }

                              if ((traitType === 'created' || traitType === 'date') && !isNaN(Date.parse(value))) {
                                return new Date(value).toLocaleDateString();
                              }

                              return attr.value;
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Owner & Seller Info */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-gray-300 flex items-center font-medium">
                        <FaUser className="mr-3 text-gray-400" />
                        Owner
                      </span>
                      <a
                        href={`https://polygonscan.com/address/${nft.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors font-mono text-sm"
                      >
                        {formatWallet(nft.owner)}
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-gray-300 flex items-center font-medium">
                        <FaTags className="mr-3 text-gray-400" />
                        Seller
                      </span>
                      <a
                        href={`https://polygonscan.com/address/${nft.seller}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors font-mono text-sm"
                      >
                        {formatWallet(nft.seller)}
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-gray-300 flex items-center font-medium">
                        <FaClock className="mr-3 text-gray-400" />
                        Listed
                      </span>
                      <span className="text-white text-sm font-medium">
                        {new Date(nft.listedTimestamp * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NFTDetail;