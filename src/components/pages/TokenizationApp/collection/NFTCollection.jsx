import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEthereum, FaHeart, FaTags, FaExternalLinkAlt, FaPlus } from 'react-icons/fa';
import { ethers } from 'ethers';
import LoadingOverlay from '../../../LoadOverlay/LoadingSpinner';

const NFTCollection = ({ nfts, loading, error }) => {
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
    return (
      <div className="bg-red-500/20 text-red-300 p-4 rounded-lg border border-red-500/30">
        <p>Error loading your NFTs: {error}</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 text-center">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.tokenId} nft={nft} />
      ))}
    </div>
  );
};

const NFTCard = ({ nft }) => {
  const { tokenId, name, description, image, isForSale, price, likes, category } = nft;
  const [imageLoading, setImageLoading] = useState(true);
  
  // If there's an error loading this particular NFT
  if (nft.error) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all h-full">
        <div className="p-3 bg-red-500/10 border-b border-red-500/20 h-36 flex items-center justify-center">
          <p className="text-red-300 text-xs">Error loading NFT</p>
        </div>
        <div className="p-2">
          <p className="font-semibold text-white text-sm">NFT #{tokenId}</p>
        </div>
      </div>
    );
  }

  // Format price if it exists
  const formattedPrice = price && ethers && ethers.formatEther 
    ? ethers.formatEther(price) 
    : '0';

  return (
    <Link to={`/nft/${tokenId}`} className="block h-full cursor-pointer">
      <motion.div
        whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
        className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all h-full flex flex-col"
      >
        {/* Image */}
        <div className="aspect-square bg-black/50 relative overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-contain"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.onerror = null;
                e.target.src = '/NFT-X1.webp'; // Fallback image
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400 text-xs">No image</p>
            </div>
          )}
        </div>
        
        {/* Information */}
        <div className="p-2 sm:p-3 flex-grow">
          {/* Badges moved from image to here */}
          <div className="flex justify-between items-center mb-2">
            <div className="bg-purple-900/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] sm:text-xs text-purple-200 font-medium">
              {category || 'Collectible'}
            </div>
            
            <div className={`backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${isForSale ? 'bg-green-900/70 text-green-200' : 'bg-gray-900/70 text-gray-200'}`}>
              {isForSale ? 'For sale' : 'Not listed'}
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-white line-clamp-1">{name}</h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{description || 'No description'}</p>
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <FaHeart className="text-red-400 mr-1 text-xs" />
              <span className="text-gray-300 text-xs">{likes || '0'}</span>
            </div>
            
            {isForSale && price && (
              <div className="flex items-center text-green-300 text-xs">
                <FaEthereum className="mr-1" />
                <span>{formattedPrice} POL</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-2 border-t border-purple-500/10 bg-purple-900/10 flex justify-between items-center">
          <div className="text-xs text-purple-300">#{tokenId}</div>
          <div className="flex space-x-1">
            {!isForSale && (
              <button 
                className="p-1 bg-green-500/20 rounded-lg text-green-300 hover:bg-green-500/30 transition-colors"
                onClick={(e) => {
                  e.preventDefault(); // Prevent navigation when clicking the button
                  // Your sell NFT logic here
                }}
              >
                <FaTags size={12} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default NFTCollection;
