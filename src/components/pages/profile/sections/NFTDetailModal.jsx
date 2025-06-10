import React, { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';

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
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Get current scroll position when modal opens
    setScrollPosition(window.scrollY);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!selectedNFT) return null;

  const modalStyle = isMobile ? {
    position: 'absolute',
    top: `${scrollPosition + 40}px`,
    left: '16px',
    right: '16px',
    transform: 'none'
  } : {};
  return (
    <div className={`fixed inset-0 z-[9999] bg-red-500/50 ${isMobile ? 'p-0' : 'p-8 flex items-center justify-center'}`}>
      {console.log('NFTDetailModal rendering with NFT:', selectedNFT)}
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl ${
          isMobile 
            ? 'w-auto max-h-[75vh] overflow-y-auto mx-4 my-8' 
            : 'w-full max-w-2xl'
        }`}
        style={modalStyle}
      >
        {/* Header */}
        <div className={`flex justify-between items-center border-b border-purple-500/20 ${
          isMobile ? 'p-3 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10' : 'p-4'
        }`}>
          <h3 className={`font-bold text-white truncate pr-3 ${isMobile ? 'text-base' : 'text-xl'}`}>
            {selectedNFT.name || `NFT #${selectedNFT.tokenId}`}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-xl font-bold transition-colors p-1 hover:bg-gray-800/50 rounded-full flex-shrink-0"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className={isMobile ? 'p-3' : 'p-4'}>
          {isMobile ? (
            // Mobile Layout - Optimized
            <div className="space-y-4">
              {/* Mobile: Compact Image and Token ID */}
              <div className="flex gap-3 items-start">
                {/* Smaller Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  {selectedNFT.image ? (
                    <img 
                      src={selectedNFT.image} 
                      alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <FaImage className="text-xl text-purple-400" />
                  )}
                </div>
                
                {/* Compact Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">Token ID:</span>
                      <span className="text-purple-300 font-medium">#{selectedNFT.tokenId}</span>
                    </div>
                  </div>
                  
                  {selectedNFT.isForSale && selectedNFT.price && (
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <p className="text-green-400 font-medium text-xs">
                        {ethers.formatUnits(selectedNFT.price, 18)} POL
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Description */}
              {selectedNFT.description && (
                <div className="bg-gray-800/30 p-2 rounded-lg">
                  <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                    {selectedNFT.description}
                  </p>
                </div>
              )}
              
              {/* Compact Attributes */}
              {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                <div>
                  <h4 className="text-white font-medium text-xs mb-2">Atributos</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
                    {selectedNFT.attributes.slice(0, 6).map((attr, i) => (
                      <div key={i} className="flex justify-between bg-black/30 p-2 rounded text-xs">
                        <span className="text-gray-400 truncate pr-2">{attr.trait_type}</span>
                        <span className="text-purple-300 font-medium text-right flex-shrink-0">{attr.value}</span>
                      </div>
                    ))}
                    {selectedNFT.attributes.length > 6 && (
                      <p className="text-gray-500 text-xs text-center py-1">
                        +{selectedNFT.attributes.length - 6} más
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Mobile: Compact buttons */}
              <div className="flex gap-2 pt-2">
                {contractAddress && (
                  <a
                    href={`https://opensea.io/assets/matic/${contractAddress}/${selectedNFT.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-nuvo-base btn-nuvo-info inline-flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white transition-colors rounded-lg px-3 py-2 text-xs font-medium flex-1"
                  >
                    <FaExternalLinkAlt className="text-xs" /> 
                    OpenSea
                  </a>
                )}
                
                <Link
                  to={`/nft/${selectedNFT.tokenId}`}
                  className="btn-nuvo-base bg-nuvo-gradient-button inline-flex items-center justify-center gap-1 text-white transition-colors rounded-lg px-3 py-2 text-xs font-medium flex-1"
                  onClick={onClose}
                >
                  <FaImage className="text-xs" /> 
                  Detalles
                </Link>
              </div>
            </div>
          ) : (
            // Desktop Layout - unchanged
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="rounded-xl overflow-hidden bg-purple-900/30 aspect-square flex items-center justify-center">
                {selectedNFT.image ? (
                  <img 
                    src={selectedNFT.image} 
                    alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-5xl text-purple-400" />
                  </div>
                )}
              </div>
              
              {/* Details Section */}
              <div className="space-y-3">
                {/* Description */}
                <p className="text-gray-300 mb-4">
                  {selectedNFT.description || "Sin descripción disponible"}
                </p>
                
                {/* Token ID */}
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Token ID:</span>
                    <span className="text-purple-300 font-medium">#{selectedNFT.tokenId}</span>
                  </div>
                </div>
                
                {/* Price */}
                {selectedNFT.isForSale && selectedNFT.price && (
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="text-green-400 font-medium">
                      Precio: {ethers.formatUnits(selectedNFT.price, 18)} POL
                    </p>
                  </div>
                )}
                
                {/* Attributes */}
                {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Atributos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
                      {selectedNFT.attributes.map((attr, i) => (
                        <div key={i} className="flex justify-between bg-black/30 p-2 rounded">
                          <span className="text-gray-400 truncate pr-2">{attr.trait_type}</span>
                          <span className="text-purple-300 font-medium text-right">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {contractAddress && (
                    <a
                      href={`https://opensea.io/assets/matic/${contractAddress}/${selectedNFT.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-nuvo-base btn-nuvo-info inline-flex items-center justify-center gap-2 bg-purple-600 text-white transition-colors rounded-lg px-4 py-2"
                    >
                      <FaExternalLinkAlt /> 
                      Ver en OpenSea
                    </a>
                  )}
                  
                  <Link
                    to={`/nft/${selectedNFT.tokenId}`}
                    className="btn-nuvo-base bg-nuvo-gradient-button inline-flex items-center justify-center gap-2 text-white transition-colors rounded-lg px-4 py-2"
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
      </m.div>
    </div>
  );
};

export default NFTDetailModal;
