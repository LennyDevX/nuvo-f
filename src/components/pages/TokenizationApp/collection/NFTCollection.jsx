import React, { useState, useEffect, useMemo, useContext, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEthereum, FaHeart, FaTags, FaExternalLinkAlt, FaWallet, FaClock } from 'react-icons/fa';
import { ethers } from 'ethers';
import { WalletContext } from '../../../../context/WalletContext';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import NFTErrorState from './NFTErrorState';
import IPFSImage from '../../../ui/IPFSImage';
import { normalizeCategory } from '../../../../utils/blockchain/blockchainUtils';


const NFTDetailModal = lazy(() => import('../../../modals/NFTDetailModal'));


const NFTCollection = ({ nfts, loading, error, onRetry, cacheStatus }) => {
  const { walletConnected, connectWallet } = useContext(WalletContext);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Handle retry action by forwarding to parent component if provided
  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry();
    } else {
      // Fallback - reload the page
      window.location.reload();
    }
  };

  // Handle NFT click to open modal
  const handleNFTClick = (nft) => {
    console.log('NFT clicked:', nft);
    setSelectedNFT(nft);
  };

  // Handle modal close
  const handleCloseModal = () => {
    console.log('Closing modal');
    setSelectedNFT(null);
  };

  // Debug log for selectedNFT state
  useEffect(() => {
    console.log('selectedNFT state changed:', selectedNFT);
  }, [selectedNFT]);

  // Remove the loading state from here since it's now handled in the parent component
  // The parent (NFTDashboard) will show the LoadingSpinner and won't render NFTCollection until loading is false

  // Show cache status if available
  const renderCacheStatus = () => {
    if (!cacheStatus) return null;
    
    return (
      <div className="mb-4 text-xs text-gray-400 flex items-center gap-2">
        <FaClock className="text-green-400" />
        <span>Data loaded from cache ({cacheStatus})</span>
      </div>
    );
  };

  if (error) {
    return <NFTErrorState error={error} onRetry={handleRetry} walletConnected={walletConnected} />;
  }

  // Show connect wallet message when wallet is not connected OR when no NFTs and wallet is connected
  if (!walletConnected || (walletConnected && nfts.length === 0)) {
    return (
      <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 text-center">
        {!walletConnected ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
              <FaWallet className="text-blue-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect Your Wallet
            </h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
              Please connect your wallet to view and manage your NFT collection
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              <FaTags className="text-purple-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              No NFTs Yet
            </h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
              Your collection is empty. Start building your digital asset portfolio by minting your first NFT.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {renderCacheStatus()}
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {nfts.map((nft) => (
          <NFTCard 
            key={nft.uniqueId || `${nft.contractAddress}-${nft.tokenId}`} 
            nft={nft} 
            onClick={() => handleNFTClick(nft)}
          />
        ))}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <Suspense fallback={null}>
          <NFTDetailModal
            selectedNFT={selectedNFT}
            onClose={handleCloseModal}
            contractAddress={selectedNFT.contractAddress}
          />
        </Suspense>
      )}
    </>
  );
};

// Enhanced NFT Card with image caching optimization
const NFTCard = ({ nft, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    onClick(nft);
  };
  
  // Memoize formatted price
  const formattedPrice = useMemo(() => {
    if (!nft.price || !ethers.formatEther) return "0.0000";
    try {
      return parseFloat(ethers.formatEther(nft.price)).toFixed(4);
    } catch (e) {
      return "0.0000";
    }
  }, [nft.price]);

  // Get the correct image URL with IPFS handling
  const getImageUrl = useMemo(() => {
    // Priority order: direct image, metadata.image, fallback
    let imageUrl = nft.image || nft.metadata?.image;
    
    // Handle IPFS URLs consistently
    if (imageUrl && imageUrl.startsWith('ipfs://')) {
      const ipfsHash = imageUrl.replace('ipfs://', '');
      imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } else if (imageUrl && imageUrl.includes('/ipfs/')) {
      // Already converted IPFS URL, use as is
      imageUrl = imageUrl;
    } else if (!imageUrl || imageError) {
      // Use fallback if no image or error
      imageUrl = '/NFT-placeholder.webp';
    }
    
    return imageUrl;
  }, [nft.image, nft.metadata?.image, imageError]);

  // Get NFT name with fallback
  const getNftName = useMemo(() => {
    return nft.name || nft.metadata?.name || `NFT #${nft.tokenId || 'Unknown'}`;
  }, [nft.name, nft.metadata?.name, nft.tokenId]);

  // Get NFT description with fallback
  const getNftDescription = useMemo(() => {
    return nft.description || nft.metadata?.description || 'No description available';
  }, [nft.description, nft.metadata?.description]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.warn('Image failed to load:', getImageUrl);
    setImageError(true);
    setImageLoaded(true); // Still set to true to hide spinner
  };

  return (
    <motion.div
      className="relative bg-gradient-to-b from-purple-900/40 to-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* NFT Image with loading optimization */}
      <div className="nft-collection-image-container relative aspect-square">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={getImageUrl}
          alt={getNftName}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Sale Status Badge */}
        {nft.isForSale && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
            For Sale
          </div>
        )}
        
        {/* Likes Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
          <FaHeart className="text-red-500 mr-1" /> 
          {nft.likes || 0}
        </div>
      </div>
      
      {/* NFT Info */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate">{getNftName}</h3>
        
        {/* Price and Category */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-gray-300 text-xs">
            <FaTags className="mr-1" />
            <span>{normalizeCategory(nft.category) || 'Collectible'}</span>
          </div>
          
          <div className="flex items-center text-green-400 text-xs font-semibold">
            <FaEthereum className="mr-1" />
            <span>{formattedPrice}</span>
          </div>
        </div>
        
        {/* Hover Details */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h3 className="text-white font-bold mb-1">{getNftName}</h3>
          <p className="text-gray-300 text-xs mb-3 line-clamp-3">{getNftDescription}</p>
          
          <button
            className="btn-nuvo-base bg-nuvo-gradient-button btn-sm btn-full mt-2 flex items-center justify-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <FaExternalLinkAlt className="text-xs" /> View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCollection;

