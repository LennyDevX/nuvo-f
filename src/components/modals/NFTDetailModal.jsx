import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion as m } from 'framer-motion';
import { FaImage, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import IPFSImage from '../ui/IPFSImage';
import { getOptimizedImageUrl } from '../../utils/blockchain/blockchainUtils';

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
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const truncateDescription = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!selectedNFT) return null;

  // Render modal using portal to document.body
  return createPortal(
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
            ? 'w-full max-w-sm mx-4 max-h-[85vh]' 
            : 'w-full max-w-3xl max-h-[85vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-purple-500/20 bg-gray-900/90 sticky top-0 z-10 backdrop-blur-sm">
          <h3 className={`font-bold text-white truncate pr-3 ${isMobile ? 'text-sm' : 'text-lg'}`}>
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
        <div className="overflow-y-auto nft-detail-modal-content" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
          <div className={isMobile ? 'p-3' : 'p-4'}>
            {isMobile ? (
              // Mobile Layout - Vertical compact design
              <div className="space-y-3">
                {/* Imagen compacta centrada */}
                <div className="w-full">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50 max-w-xs mx-auto">
                    <IPFSImage 
                      src={getOptimizedImageUrl(selectedNFT.image)} 
                      alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                      className="w-full h-full object-cover"
                      placeholderSrc={PLACEHOLDER_IMAGE}
                      onLoad={() => console.log(`Modal image loaded for NFT ${selectedNFT.tokenId}`)}
                      onError={() => console.warn(`Modal image failed for NFT ${selectedNFT.tokenId}`)}
                    />
                  </div>
                </div>

                {/* Token ID y Precio en fila */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg text-center">
                    <span className="text-gray-300 text-xs block">Token ID</span>
                    <span className="text-purple-300 font-bold text-sm">#{selectedNFT.tokenId}</span>
                  </div>
                  
                  {selectedNFT.isForSale && selectedNFT.price && (
                    <div className="p-2 bg-green-900/30 rounded-lg text-center">
                      <span className="text-gray-300 text-xs block">Precio</span>
                      <span className="text-green-400 font-bold text-xs">
                        {parseFloat(ethers.formatUnits(selectedNFT.price, 18)).toFixed(2)} POL
                      </span>
                    </div>
                  )}
                </div>

                {/* Descripción compacta */}
                {selectedNFT.description && (
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">Descripción</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {isDescriptionExpanded 
                        ? selectedNFT.description 
                        : truncateDescription(selectedNFT.description, 100)
                    }
                    </p>
                    {selectedNFT.description.length > 100 && (
                      <button 
                        onClick={toggleDescription}
                        className="text-purple-400 text-xs mt-2 flex items-center gap-1 hover:text-purple-300"
                      >
                        {isDescriptionExpanded ? (
                          <>Ver menos <FaChevronUp className="text-xs" /></>
                        ) : (
                          <>Ver más <FaChevronDown className="text-xs" /></>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Atributos compactos */}
                {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">Atributos</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {selectedNFT.attributes.slice(0, 4).map((attr, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400 truncate">{attr.trait_type}</span>
                          <span className="text-purple-300 font-medium truncate ml-1">{attr.value}</span>
                        </div>
                      ))}
                      {selectedNFT.attributes.length > 4 && (
                        <p className="text-gray-500 text-xs">+{selectedNFT.attributes.length - 4} más</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <Link
                  to={`/nft/${selectedNFT.tokenId}`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors rounded-lg px-4 py-2.5 font-medium text-sm w-full"
                  onClick={onClose}
                >
                  <FaImage className="text-sm" /> 
                  Ver Detalles
                </Link>
              </div>
            ) : (
              // Desktop Layout - Más compacto
              <div className="space-y-4">
                {/* Layout principal en 2 columnas */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Imagen - Lado izquierdo */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50">
                      <IPFSImage 
                        src={getOptimizedImageUrl(selectedNFT.image)} 
                        alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                        className="w-full h-full object-cover"
                        placeholderSrc={PLACEHOLDER_IMAGE}
                        onLoad={() => console.log(`Desktop modal image loaded for NFT ${selectedNFT.tokenId}`)}
                        onError={() => console.warn(`Desktop modal image failed for NFT ${selectedNFT.tokenId}`)}
                      />
                    </div>

                    {/* Token ID y Precio debajo de la imagen */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-purple-900/30 rounded-lg text-center">
                        <span className="text-gray-300 text-xs block mb-1">Token ID</span>
                        <span className="text-purple-300 font-bold text-sm">#{selectedNFT.tokenId}</span>
                      </div>
                      
                      {selectedNFT.isForSale && selectedNFT.price && (
                        <div className="p-2 bg-green-900/30 rounded-lg text-center">
                          <span className="text-gray-300 text-xs block mb-1">Precio</span>
                          <span className="text-green-400 font-bold text-sm">
                            {parseFloat(ethers.formatUnits(selectedNFT.price, 18)).toFixed(3)} POL
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Información - Lado derecho */}
                  <div className="space-y-3">
                    {/* Descripción */}
                    {selectedNFT.description && (
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <h4 className="text-white font-medium text-sm mb-2">Descripción</h4>
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {isDescriptionExpanded 
                              ? selectedNFT.description 
                              : truncateDescription(selectedNFT.description, 150)
                            }
                          </p>
                          {selectedNFT.description.length > 150 && (
                            <button 
                              onClick={toggleDescription}
                              className="text-purple-400 text-sm flex items-center gap-2 hover:text-purple-300 transition-colors"
                            >
                              {isDescriptionExpanded ? (
                                <>Ver menos <FaChevronUp /></>
                              ) : (
                                <>Ver más <FaChevronDown /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Atributos */}
                    {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <h4 className="text-white font-medium text-sm mb-2">Atributos</h4>
                        <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pr-1">
                          {selectedNFT.attributes.map((attr, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded text-xs">
                              <span className="text-gray-400 font-medium">{attr.trait_type}</span>
                              <span className="text-purple-300 font-bold">{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                <Link
                  to={`/nft/${selectedNFT.tokenId}`}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors rounded-lg px-6 py-3 font-medium text-base w-full"
                  onClick={onClose}
                >
                  <FaImage /> 
                  Ver Detalles Completos
                </Link>
              </div>
            )}
          </div>
        </div>
      </m.div>
    </div>,
    document.body
  );
};

export default NFTDetailModal;
    

