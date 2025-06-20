import React, { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import IPFSImage from '../../../ui/IPFSImage';
import { getOptimizedImageUrl } from '../../../../utils/blockchain/blockchainUtils';

// Constants
const PLACEHOLDER_IMAGE = "/LogoNuvos.webp";

/**
 * Modal component for displaying detailed NFT information
 * 
 * @param {Object} selectedNFT - The NFT to display details for
 * @param {Function} onClose - Function to call when closing the modal
 * @param {String} contractAddress - The NFT contract address
 */
const NFTDetailModal = ({ selectedNFT, onClose, contractAddress }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Check if mobile device and capture scroll position
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setScrollY(window.scrollY);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!selectedNFT) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm ${
        isMobile ? 'flex items-start pt-4' : 'flex items-center justify-center p-4'
      }`}
      onClick={handleBackdropClick}
      style={isMobile ? { paddingTop: `${Math.max(scrollY * 0.1, 16)}px` } : {}}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: isMobile ? 50 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: isMobile ? 50 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl relative z-[99999] ${
          isMobile 
            ? 'w-full max-w-sm mx-4 max-h-[80vh]' 
            : 'w-full max-w-4xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-purple-500/20 bg-gray-900/90 sticky top-0 z-10 backdrop-blur-sm">
          <h3 className={`font-bold text-white truncate pr-3 ${isMobile ? 'text-sm' : 'text-xl'}`}>
            {selectedNFT.name || `NFT #${selectedNFT.tokenId}`}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full p-1.5 transition-all flex-shrink-0"
          >
            <FaTimes className={isMobile ? 'text-sm' : 'text-lg'} />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-3rem)]">
          <div className={isMobile ? 'p-3' : 'p-6'}>
            {isMobile ? (
              // Mobile Layout - Horizontal compact design
              <div className="space-y-3">
                {/* Mobile: Horizontal layout with image left, info right */}
                <div className="flex gap-3">
                  {/* Compact Image with consistent aspect ratio */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50 flex items-center justify-center flex-shrink-0">
                    <IPFSImage 
                      src={selectedNFT.image} 
                      alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                      className="w-full h-full object-cover"
                      placeholderSrc={PLACEHOLDER_IMAGE}
                      loading="lazy"
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-2">
                    <div className="p-2 bg-purple-900/30 rounded text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">ID:</span>
                        <span className="text-purple-300 font-bold">#{selectedNFT.tokenId}</span>
                      </div>
                    </div>
                    
                    {selectedNFT.isForSale && selectedNFT.price && (
                      <div className="p-2 bg-green-900/30 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Price:</span>
                          <span className="text-green-400 font-bold">
                            {ethers.formatUnits(selectedNFT.price, 18)} POL
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description - Compact */}
                {selectedNFT.description && (
                  <div className="p-2 bg-gray-800/50 rounded">
                    <h4 className="text-white font-medium text-xs mb-1">Description</h4>
                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                      {selectedNFT.description}
                    </p>
                  </div>
                )}
                
                {/* Attributes - Very compact */}
                {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                  <div className="p-2 bg-gray-800/50 rounded">
                    <h4 className="text-white font-medium text-xs mb-1">Atributos</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {selectedNFT.attributes.slice(0, 4).map((attr, i) => (
                        <div key={i} className="bg-black/20 p-1 rounded text-center">
                          <div className="text-gray-400 truncate">{attr.trait_type}</div>
                          <div className="text-purple-300 font-medium truncate">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                    {selectedNFT.attributes.length > 4 && (
                      <p className="text-gray-500 text-xs text-center mt-1">
                        +{selectedNFT.attributes.length - 4} más
                      </p>
                    )}
                  </div>
                )}
                
                {/* Mobile: Compact action buttons */}
                <div className="w-full">
                  <Link
                    to={`/nft/${selectedNFT.tokenId}`}
                    className="flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors rounded px-2 py-2 font-medium text-xs w-full"
                    onClick={onClose}
                  >
                    <FaImage className="text-xs" /> 
                    Detalles
                  </Link>
                </div>
              </div>
            ) : (
              // Desktop Layout - Enhanced horizontal
              <div className="flex gap-6">
                {/* Image Section - Left side, with consistent aspect ratio */}
                <div className="w-80 flex-shrink-0">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50 flex items-center justify-center">
                    <IPFSImage 
                      src={getOptimizedImageUrl(selectedNFT.image)} 
                      alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                      className="w-full h-full object-cover"
                      placeholderSrc={PLACEHOLDER_IMAGE}
                      onLoad={() => console.log(`Desktop modal image loaded for NFT ${selectedNFT.tokenId}`)}
                      onError={() => console.warn(`Desktop modal image failed for NFT ${selectedNFT.tokenId}`)}
                    />
                  </div>
                </div>
                
                {/* Details Section - Right side, more space */}
                <div className="flex-1 space-y-4">
                  {/* Token ID and Price Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-900/30 rounded-lg text-center">
                      <span className="text-gray-300 text-sm block mb-1">Token ID</span>
                      <span className="text-purple-300 font-bold text-lg">#{selectedNFT.tokenId}</span>
                    </div>
                    
                    {selectedNFT.isForSale && selectedNFT.price && (
                      <div className="p-3 bg-green-900/30 rounded-lg text-center">
                        <span className="text-gray-300 text-sm block mb-1">Precio</span>
                        <span className="text-green-400 font-bold text-lg">
                          {ethers.formatUnits(selectedNFT.price, 18)} POL
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedNFT.description && (
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium text-lg mb-2">Descripción</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {selectedNFT.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Attributes */}
                  {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium text-lg mb-3">Atributos</h4>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {selectedNFT.attributes.map((attr, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded">
                            <span className="text-gray-400 font-medium text-sm">{attr.trait_type}</span>
                            <span className="text-purple-300 font-bold text-sm">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="w-full">
                    <Link
                      to={`/nft/${selectedNFT.tokenId}`}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors rounded-lg px-4 py-3 font-medium w-full"
                      onClick={onClose}
                    >
                      <FaImage /> 
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default NFTDetailModal;

