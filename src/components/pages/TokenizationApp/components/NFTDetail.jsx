import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy, FaStore } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';
import IPFSImage from '../../../ui/IPFSImage';
import useListNFT from '../../../../hooks/nfts/useListNFT';
import { getCSPCompliantImageURL, getOptimizedImageUrl, getCategoryDisplayName, normalizeCategory } from '../../../../utils/blockchain/blockchainUtils';

// Agregar un simple sistema de caché para evitar llamadas repetidas
const nftCache = new Map();
// Caché para metadatos
const metadataCache = new Map();

// Ensure we have the contract address from environment variables or hardcoded fallback
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

// Debug log
console.log("TokenizationApp Contract Address:", CONTRACT_ADDRESS);

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
  const [showListForm, setShowListForm] = useState(false);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('collectible');
  // Add missing state variables
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
          TokenizationAppABI.abi,
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
        TokenizationAppABI.abi,
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen pb-10"
    >
      <SpaceBackground />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link 
          to="/marketplace" 
          className="inline-flex items-center gap-3 px-4 py-2 mb-6 bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-md border border-gray-600/40 hover:border-purple-500/50 rounded-lg text-white transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
            {/* Image Section - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block bg-gray-800/80 backdrop-blur-md rounded-lg p-4 py-20 shadow-lg border border-gray-700/50">
              <div className="aspect-square w-full max-w-md mx-auto">
                <IPFSImage
                  src={getOptimizedImageUrl(nft.image)}
                  alt={nft.name}
                  className="w-full h-full rounded-lg overflow-hidden"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 font-medium nft-detail-action-button ${
                    hasLiked 
                      ? 'bg-red-600 text-white shadow-lg nft-like-button liked' 
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 nft-like-button border border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isLiking ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaHeart />
                    )
                    }
                    <span className="text-white">{isLiking ? 'Loading...' : hasLiked ? 'Liked' : 'Like'} ({likesCount})</span>
                  </div>
                </button>
                
                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg transition-all duration-300 hover:bg-purple-700 font-medium nft-detail-action-button nft-share-button border border-purple-500"
                >
                  <div className="flex items-center gap-2">
                    {shareLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : copied ? (
                      <FaCheck />
                    ) : (
                      <FaCopy />
                    )}
                    <span className="text-white">{shareLoading ? 'Sharing...' : copied ? 'Copied!' : 'Share'}</span>
                  </div>
                </button>
              </div>

              {/* Marketplace Button */}
              <button
                onClick={handleGoToMarketplace}
                className="btn-nuvo-base bg-nuvo-gradient-button nft-marketplace-button mt-4 w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <FaStore className="w-4 h-4" />
                  <span className="text-white font-medium">Explore Marketplace</span>
                </div>
              </button>
            </div>
            
            {/* Details Section */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 lg:p-6 shadow-lg lg:col-span-1 border border-gray-700/50">
              <div className="space-y-4 lg:space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{nft.name}</h1>
                  <div className="flex items-center text-gray-300 text-sm">
                    <span className="bg-gray-700/80 px-3 py-1 rounded-full mr-3 text-white font-medium">#{nft.tokenId}</span>
                    <span className="bg-purple-600 px-3 py-1 rounded-full text-white font-medium">
                      {getCategoryDisplayName(nft.category)}
                    </span>
                  </div>
                </div>
                
                {/* Price Section with Mobile Image */}
                <div className="bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                  <div className="flex items-start justify-between gap-4">
                    {/* Price Info */}
                    <div className="flex-1">
                      <span className="text-gray-200 font-medium block mb-2">Current Price</span>
                      <div className="flex items-center text-xl lg:text-2xl font-bold text-white mb-2">
                        <FaEthereum className="mr-2 text-blue-400" />
                        <span className="text-white">{parseFloat(ethers.formatEther(nft.price)).toFixed(2)} POL</span>
                      </div>
                      {nft.isForSale && (
                        <div className="text-green-400 text-sm font-medium">
                          <FaTags className="inline mr-1" />
                          <span className="text-green-400">Available for purchase</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile Image - only show on mobile */}
                    <div className="lg:hidden w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                      <IPFSImage
                        src={getOptimizedImageUrl(nft.image)}
                        alt={nft.name}
                        className="w-full h-full rounded-lg overflow-hidden"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300 font-medium text-sm nft-detail-action-button ${
                        hasLiked 
                          ? 'bg-red-600 text-white shadow-lg nft-like-button liked border border-red-500' 
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600 nft-like-button border border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLiking ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaHeart />
                        )}
                        <span className="text-white">{isLiking ? 'Loading' : hasLiked ? 'Liked' : 'Like'} ({likesCount})</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleShare}
                      disabled={shareLoading}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg transition-all duration-300 hover:bg-purple-700 font-medium text-sm nft-detail-action-button nft-share-button border border-purple-500"
                    >
                      <div className="flex items-center gap-2">
                        {shareLoading ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : copied ? (
                          <FaCheck />
                        ) : (
                          <FaCopy />
                        )}
                        <span className="text-white">{shareLoading ? 'Loading' : copied ? 'Copied!' : 'Share'}</span>
                      </div>
                    </button>
                  </div>

                  {/* Marketplace Button */}
                  <button
                    onClick={handleGoToMarketplace}
                    className="btn-nuvo-base bg-nuvo-gradient-button nft-marketplace-button w-full"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaStore className="w-4 h-4" />
                      <span className="text-white font-medium">Explore Marketplace</span>
                    </div>
                  </button>
                </div>
                
                {/* Description */}
                {nft.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-gray-200 leading-relaxed text-sm lg:text-base">{nft.description}</p>
                  </div>
                )}
                
                {/* Attributes */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className="bg-gray-700/80 border border-gray-600/50 rounded-lg p-2 lg:p-3">
                          <div className="text-gray-200 text-xs lg:text-sm uppercase tracking-wide font-medium">
                            {attr.trait_type}
                          </div>
                          <div className="text-white font-semibold mt-1 text-sm lg:text-base">
                            {attr.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Owner & Seller Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Details</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-600">
                      <span className="text-gray-200 flex items-center text-sm font-medium">
                        <FaUser className="mr-2" />
                        Owner
                      </span>
                      <a
                        href={`https://polygonscan.com/address/${nft.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors font-mono text-xs lg:text-sm"
                      >
                        {`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-600">
                      <span className="text-gray-200 flex items-center text-sm font-medium">
                        <FaTags className="mr-2" />
                        Seller
                      </span>
                      <a
                        href={`https://polygonscan.com/address/${nft.seller}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors font-mono text-xs lg:text-sm"
                      >
                        {`${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}`}
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-200 flex items-center text-sm font-medium">
                        <FaClock className="mr-2" />
                        Listed
                      </span>
                      <span className="text-white text-xs lg:text-sm font-medium">
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