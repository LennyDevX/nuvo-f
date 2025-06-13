import React, { useState, useEffect, useMemo, useContext, lazy, Suspense, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEthereum, FaHeart, FaTags, FaExternalLinkAlt, FaWallet, FaLayerGroup, FaShoppingCart, FaImage, FaSpinner, FaChevronDown } from 'react-icons/fa';
import { ethers } from 'ethers';
import { WalletContext } from '../../../../context/WalletContext';
import LoadingSpinner from '../../../LoadOverlay/LoadingSpinner';
import NFTErrorState from './NFTErrorState';
import IPFSImage from '../../../ui/IPFSImage';
import NFTSkeleton from '../../../ui/NFTSkeleton';


const NFTDetailModal = lazy(() => import('../../profile/sections/NFTDetailModal'));

// Add the CONTRACT_ADDRESS constant
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

// Memoize NFT card to prevent unnecessary re-renders
const NFTCard = memo(({ nft, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = useCallback(() => {
    onClick(nft);
  }, [nft, onClick]);

  const formattedPrice = useMemo(() => {
    if (!nft.price || nft.price === '0') return "0.0000";
    try {
      return parseFloat(ethers.formatUnits(nft.price, 18)).toFixed(4);
    } catch (e) {
      return "0.0000";
    }
  }, [nft.price]);

  // Ensure we have valid data for display
  const safeNft = {
    ...nft,
    name: nft.name || `NFT #${nft.tokenId || nft.id}`,
    description: nft.description || 'No description available',
    image: nft.image || DEFAULT_PLACEHOLDER,
    category: nft.category || 'Collectible',
    likes: nft.likes || 0
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
      className="relative bg-gradient-to-b from-purple-900/40 to-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
      whileHover={{ scale: 1.03, y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Optimized image with better loading */}
      <div className="aspect-square relative overflow-hidden">
        <IPFSImage 
          src={safeNft.image} 
          alt={safeNft.name}
          className="w-full h-full object-cover"
          placeholderSrc="/LogoNuvos.webp"
        />
        
        {/* Sale Status Badge */}
        {safeNft.isForSale && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
            For Sale
          </div>
        )}
        
        {/* Likes Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
          <FaHeart className="text-red-500 mr-1" /> 
          {safeNft.likes}
        </div>
      </div>
      
      {/* NFT Info */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate">{safeNft.name}</h3>
        
        {/* Price and Category */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-gray-300 text-xs">
            <FaTags className="mr-1" />
            <span>{safeNft.category}</span>
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
          <h3 className="text-white font-bold mb-1">{safeNft.name}</h3>
          <p className="text-gray-300 text-xs mb-3 line-clamp-3">{safeNft.description}</p>
          
          <button
            className="btn-primary btn-sm btn-full mt-2 flex items-center justify-center gap-1"
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
});

const NFTCollection = ({ nfts, loading, error, onRetry, hasMore, onLoadMore, totalCount }) => {
  const { walletConnected, connectWallet } = useContext(WalletContext);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const handleNFTClick = useCallback((nft) => {
    setSelectedNFT(nft);
  }, []);

  const handleRetry = useCallback(() => {
    if (typeof onRetry === 'function') {
      onRetry();
    }
  }, [onRetry]);

  const handleLoadMore = useCallback(() => {
    if (typeof onLoadMore === 'function' && hasMore && !loading) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loading]);

  // Ensure nfts is always an array to prevent length errors
  const safeNfts = Array.isArray(nfts) ? nfts : [];

  // Show skeleton during initial load
  if (loading && safeNfts.length === 0) {
    return (
      <div className="p-6">
        <NFTSkeleton count={20} />
      </div>
    );
  }

  if (error && safeNfts.length === 0) {
    return <NFTErrorState error={error} onRetry={handleRetry} />;
  }

  if (!loading && safeNfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <FaLayerGroup className="text-purple-400 text-4xl" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">No NFTs Found</h3>
          <p className="text-gray-300 mb-6">
            {walletConnected 
              ? "You don't have any NFTs yet. Start your collection by creating or purchasing your first NFT."
              : "Connect your wallet to view your NFT collection."
            }
          </p>
          
          {walletConnected ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/tokenize" className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg">
                <FaImage className="mr-2" /> Create NFT
              </Link>
              <Link to="/marketplace" className="btn-nuvo-base btn-nuvo-outline btn-nuvo-lg">
                <FaShoppingCart className="mr-2" /> Browse Marketplace
              </Link>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg"
            >
              <FaWallet className="mr-2" /> Connect Wallet
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with count */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your NFT Collection</h2>
        {totalCount > 0 && (
          <span className="text-purple-400 text-sm">
            Showing {safeNfts.length} of {totalCount} NFTs
          </span>
        )}
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {safeNfts.map((nft, index) => (
          <NFTCard 
            key={`${nft.tokenId || nft.id}-${index}`} 
            nft={nft} 
            index={index} 
            onClick={handleNFTClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn-nuvo-base btn-nuvo-outline btn-nuvo-lg min-w-[200px]"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                Load More NFTs
                <FaChevronDown className="ml-2" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && safeNfts.length > 0 && (
        <div className="mt-6">
          <NFTSkeleton count={4} />
        </div>
      )}

      {/* NFT Detail Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        {selectedNFT && (
          <NFTDetailModal
            selectedNFT={selectedNFT}
            onClose={() => setSelectedNFT(null)}
            contractAddress={CONTRACT_ADDRESS}
          />
        )}
      </Suspense>
    </div>
  );
};

export default memo(NFTCollection);
