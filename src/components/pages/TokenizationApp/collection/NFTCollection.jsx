import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEthereum, FaHeart, FaTags, FaExternalLinkAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { ethers } from 'ethers';
import LoadingOverlay from '../../../LoadOverlay/LoadingSpinner';
import NFTErrorState from './NFTErrorState';

const NFTCollection = ({ nfts, loading, error, onRetry }) => {
  // Handle retry action by forwarding to parent component if provided
  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry();
    } else {
      // Fallback - reload the page
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <LoadingOverlay isLoading={true} message="Loading your NFTs...">
          <div className="w-full h-full"></div>
        </LoadingOverlay>
      </div>
    );
  }

  if (error) {
    return <NFTErrorState error={error} onRetry={handleRetry} />;
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-purple-500/20 text-center">
        <p className="text-gray-300 mb-6">You don't have any NFTs in your collection yet</p>
        <Link
          to="/tokenize"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
        >
          <FaPlus className="mr-2" /> Create my first NFT
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.tokenId} nft={nft} />
      ))}
    </div>
  );
};

// NFT Card component
const NFTCard = ({ nft }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Format price nicely
  const formattedPrice = nft.price && ethers.formatEther ? 
    parseFloat(ethers.formatEther(nft.price)).toFixed(4) : 
    "0.0000";

  return (
    <motion.div
      className="relative bg-gradient-to-b from-purple-900/40 to-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* NFT Image */}
      <div className="aspect-square relative overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <FaSpinner className="text-purple-400 animate-spin" />
          </div>
        )}
        <img 
          src={nft.image || "/LogoNuvos.webp"} 
          alt={nft.name} 
          className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${imageError ? 'hidden' : ''}`}
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false);
            setImageError(true);
            e.target.src = "/LogoNuvos.webp";
          }}
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
        <h3 className="text-white font-medium text-sm truncate">{nft.name}</h3>
        
        {/* Price and Category */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-gray-300 text-xs">
            <FaTags className="mr-1" />
            <span>{nft.category || 'Collectible'}</span>
          </div>
          
          <div className="flex items-center text-green-400 text-xs font-semibold">
            <FaEthereum className="mr-1" />
            <span>{formattedPrice}</span>
          </div>
        </div>
        
        {/* Hover Details - Shown on touch for mobile */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h3 className="text-white font-bold mb-1">{nft.name}</h3>
          <p className="text-gray-300 text-xs mb-3 line-clamp-3">{nft.description}</p>
          
          <Link
            to={`/nft/${nft.tokenId}`}
            className="mt-2 flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg w-full transition-colors"
          >
            <FaExternalLinkAlt className="text-xs" /> View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCollection;
