import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaExternalLinkAlt, FaShoppingCart, FaSpinner, FaLayerGroup, FaHeart, FaTags, FaEthereum } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useTokenization } from '../../../../context/TokenizationContext';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';
import { getOptimizedImageUrl } from '../../../../utils/blockchain/blockchainUtils';
import IPFSImage from '../../../ui/IPFSImage';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x71f3d55856e4058ed06ee057d79ada615f65cdf5";
const PLACEHOLDER_IMAGE = "/LogoNuvos.webp";

// Updated NFTCard to match NFTCollection style
const NFTCard = React.memo(({ nft, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format price nicely
  const formattedPrice = useMemo(() => {
    if (!nft.price || !ethers.formatUnits) return "0.0000";
    return parseFloat(ethers.formatUnits(nft.price, 18)).toFixed(4);
  }, [nft.price]);

  const handleClick = () => {
    onClick(nft);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 1) }}
      className="relative bg-gradient-to-b from-purple-900/40 to-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
      whileHover={{ scale: 1.03, y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* NFT Image with consistent aspect ratio */}
      <div className="nft-profile-image-container">
        <IPFSImage 
          src={getOptimizedImageUrl(nft.image)}
          alt={nft.name || `NFT #${nft.tokenId}`} 
          className="nft-profile-image"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          placeholderSrc={PLACEHOLDER_IMAGE}
          onLoad={() => console.log(`NFT ${nft.tokenId} loaded in profile`)}
          onError={() => console.warn(`NFT ${nft.tokenId} failed to load in profile`)}
          loading="lazy"
        />
        
        {/* Sale Status Badge */}
        {nft.isForSale && nft.price && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
            For Sale
          </div>
        )}
        
        {/* Likes Badge */}
        {nft.likes && parseInt(nft.likes) > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
            <FaHeart className="text-red-500 mr-1" /> 
            {nft.likes}
          </div>
        )}
      </div>
      
      {/* NFT Info - Matching NFTCollection style */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate">{nft.name || `NFT #${nft.tokenId}`}</h3>
        
        {/* Price and Category */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-gray-300 text-xs">
            <FaTags className="mr-1" />
            <span>ID: #{nft.tokenId}</span>
          </div>
          
          {nft.isForSale && nft.price && (
            <div className="flex items-center text-green-400 text-xs font-semibold">
              <FaEthereum className="mr-1" />
              <span>{formattedPrice}</span>
            </div>
          )}
        </div>
        
        {/* Hover Details */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h3 className="text-white font-bold mb-1">{nft.name}</h3>
          <p className="text-gray-300 text-xs mb-3 line-clamp-3">
            {nft.description && nft.description.length > 80
              ? `${nft.description.substring(0, 80)}...`
              : nft.description || "Sin descripción"}
          </p>
          
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
    </m.div>
  );
});

const NFTsSection = ({ account }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { 
    nfts, 
    nftsLoading: loading, 
    nftsError: error, 
    updateUserAccount 
  } = useTokenization();
  
  // Update TokenizationContext with current user account - add cleanup
  useEffect(() => {
    let isMounted = true;
    
    if (account && isMounted) {
      updateUserAccount(account);
    }
    
    return () => {
      isMounted = false;
    };
  }, [account, updateUserAccount]);
  
  // Show preview after a short delay even if still loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowPreview(true);
      }, 1500); // Show preview after 1.5 seconds even if still loading
      
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false); // Reset when loading completes
    }
  }, [loading]);
  
  // Debug for checking raw NFT data
  useEffect(() => {
    if (nfts && nfts.length > 0) {
      console.log("NFTs loaded:", nfts);
    }
  }, [nfts]);
  
  // Memoize filtered NFTs to prevent unnecessary filtering on each render
  const realNfts = useMemo(() => {
    if (!nfts || nfts.length === 0) return [];
    return nfts.filter(nft => !nft.error);
  }, [nfts]);

  // Use a stable callback that doesn't change on every render
  const handleNFTClick = useCallback((nft) => {
    setSelectedNFT(nft);
  }, []);
  
  // Render grid matching NFTCollection layout
  const renderNFTGrid = useCallback(() => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {realNfts.slice(0, 20).map((nft, index) => (
          <NFTCard 
            key={`${nft.tokenId}-${index}`} 
            nft={nft} 
            index={index} 
            onClick={() => handleNFTClick(nft)}
          />
        ))}
      </div>
    );
  }, [realNfts, handleNFTClick]);
  
  // Loading state
  if (loading && !showPreview) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-purple-400 animate-spin mb-4 mx-auto" />
          <p className="text-gray-300">Cargando NFTs...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-purple-500/20 backdrop-blur-sm">
          <FaImage className="text-red-400 text-3xl" />
        </div>
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Error al cargar NFTs
        </h3>
        <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
          Hubo un problema al cargar tu colección: {error?.message || error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  // Empty state
  if (!realNfts || realNfts.length === 0) {
    return (
      <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
          <FaLayerGroup className="text-purple-400 text-3xl" />
        </div>
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          No NFTs Yet
        </h3>
        <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
          Aún no tienes ningún NFT de NUVOS en tu colección. Adquiere tu primer NFT para representar la propiedad digital de activos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/tokenize"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white flex items-center justify-center gap-2 transition-colors hover:from-purple-700 hover:to-pink-700"
          >
            <FaImage className="text-sm" /> Tokenizar un Activo
          </Link>
          <Link
            to="/nfts"
            className="px-6 py-3 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
          >
            <FaShoppingCart className="text-sm" /> Explorar Colección NFT
          </Link>
        </div>
      </div>
    );
  }
  
  // Display NFTs - Remove the card wrapper to prevent modal containment
  return (
    <>
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-purple-500/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaImage className="text-purple-400" /> Tus NFTs
          </h2>
          <div className="flex items-center gap-2">
            {loading && showPreview && (
              <FaSpinner className="text-purple-400 animate-spin" />
            )}
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
              {realNfts.length} {realNfts.length === 1 ? 'NFT' : 'NFTs'}
            </span>
          </div>
        </div>
        
        {renderNFTGrid()}
        
        {realNfts.length > 20 && (
          <div className="text-center mt-6">
            <Link to="/nfts" className="text-purple-400 hover:text-purple-300 text-sm">
              Ver todos los {realNfts.length} NFTs →
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(NFTsSection);
      