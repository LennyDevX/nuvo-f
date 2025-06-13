import React, { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaTimes } from 'react-icons/fa';
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
  const [scrollY, setScrollY] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

  // Helper function to check if text is long
  const isLongText = (text) => text && text.length > 100;

  if (!selectedNFT) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm ${
        isMobile ? 'flex items-center justify-center p-3' : 'flex items-center justify-center p-4'
      }`}
      onClick={handleBackdropClick}
    >
      {console.log('NFTDetailModal rendering with NFT:', selectedNFT)}
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl relative z-[99999] ${
          isMobile 
            ? 'w-full max-w-sm mx-2 max-h-[90vh] min-h-[400px]' 
            : 'w-full max-w-4xl max-h-[90vh]'
        } flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed height */}
        <div className="flex justify-between items-center p-3 border-b border-purple-500/20 bg-gray-900/95 backdrop-blur-sm flex-shrink-0">
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
        
        {/* Content wrapper - Dynamic height */}
        <div className="flex flex-col flex-1 min-h-0">
          {isMobile ? (
            <>
              {/* Scrollable content - Mobile with dynamic spacing */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-3">
                  {/* Compact image and basic info */}
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50 flex items-center justify-center flex-shrink-0">
                      {selectedNFT.image ? (
                        <img 
                          src={selectedNFT.image} 
                          alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      ) : (
                        <FaImage className="text-xl text-purple-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="p-1.5 bg-purple-900/30 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-300">ID:</span>
                          <span className="text-purple-300 font-bold">#{selectedNFT.tokenId}</span>
                        </div>
                      </div>
                      
                      {selectedNFT.isForSale && selectedNFT.price && (
                        <div className="p-1.5 bg-green-900/30 rounded text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Precio:</span>
                            <span className="text-green-400 font-bold">
                              {ethers.formatUnits(selectedNFT.price, 18)} POL
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description - Dynamic expansion */}
                  {selectedNFT.description && (
                    <m.div 
                      layout
                      className="p-2.5 bg-gray-800/50 rounded"
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <h4 className="text-white font-medium text-xs mb-1.5">Descripción</h4>
                      <div className="text-gray-300 text-xs leading-relaxed">
                        {isLongText(selectedNFT.description) ? (
                          <>
                            <m.p 
                              layout
                              className={`${isDescriptionExpanded ? '' : 'line-clamp-2'} transition-all duration-300 break-words`}
                              transition={{ duration: 0.3 }}
                            >
                              {selectedNFT.description}
                            </m.p>
                            <button
                              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                              className="text-purple-400 hover:text-purple-300 text-xs font-medium mt-1.5 flex items-center gap-1 transition-colors"
                            >
                              {isDescriptionExpanded ? 'Mostrar menos' : 'Mostrar más'}
                              <m.span 
                                animate={{ rotate: isDescriptionExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs"
                              >
                                ▼
                              </m.span>
                            </button>
                          </>
                        ) : (
                          <p className="break-words">{selectedNFT.description}</p>
                        )}
                      </div>
                    </m.div>
                  )}
                  
                  {/* Attributes - Compact */}
                  {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                    <div className="p-2.5 bg-gray-800/50 rounded">
                      <h4 className="text-white font-medium text-xs mb-1.5">Atributos</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        {selectedNFT.attributes.slice(0, 4).map((attr, i) => (
                          <div key={i} className="bg-black/30 p-1.5 rounded text-center">
                            <div className="text-gray-400 truncate text-xs">{attr.trait_type}</div>
                            <div className="text-purple-300 font-medium truncate text-xs">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                      {selectedNFT.attributes.length > 4 && (
                        <p className="text-gray-500 text-xs text-center mt-1.5">
                          +{selectedNFT.attributes.length - 4} más
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer - Sticky at bottom */}
              <m.div 
                layout
                className="p-3 bg-gray-900/95 border-t border-purple-500/20 backdrop-blur-sm flex-shrink-0"
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/nft/${selectedNFT.tokenId}`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all transform hover:scale-105"
                  onClick={onClose}
                >
                  <FaImage className="text-sm"/> Ver Detalles Completos
                </Link>
              </m.div>
            </>
          ) : (
            <>
              {/* Desktop content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex gap-6">
                  {/* Image Section - Left side, smaller */}
                  <div className="w-80 flex-shrink-0">
                    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50 aspect-square flex items-center justify-center">
                      {selectedNFT.image ? (
                        <img 
                          src={selectedNFT.image} 
                          alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      ) : (
                        <FaImage className="text-6xl text-purple-400" />
                      )}
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

                    {/* Description - Full text for desktop */}
                    {selectedNFT.description && (
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-white font-medium text-lg mb-2">Descripción</h4>
                        <div className="text-gray-300 leading-relaxed max-h-32 overflow-y-auto">
                          <p className="whitespace-pre-wrap break-words">
                            {selectedNFT.description}
                          </p>
                        </div>
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
                  </div>
                </div>
              </div>
              {/* sticky footer desktop */}
              <div className="p-4 bg-gray-900/90 sticky bottom-0 border-t border-purple-500/20">
                <Link
                  to={`/nft/${selectedNFT.tokenId}`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-4 py-3 font-medium"
                  onClick={onClose}
                >
                  <FaImage/> Ver Detalles
                </Link>
              </div>
            </>
          )}
        </div>
      </m.div>
    </div>
  );
};

export default NFTDetailModal;
