import React from 'react';
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
  if (!selectedNFT) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-purple-500/20">
          <h3 className="text-xl font-bold text-white">{selectedNFT.name || `NFT #${selectedNFT.tokenId}`}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div>
              <p className="text-gray-300 mb-4">{selectedNFT.description || "Sin descripción disponible"}</p>
              
              <div className="mb-4 p-3 bg-purple-900/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Token ID:</span>
                  <span className="text-purple-300">#{selectedNFT.tokenId}</span>
                </div>
              </div>
              
              {selectedNFT.isForSale && selectedNFT.price && (
                <div className="mb-4 p-3 bg-green-900/30 rounded-lg">
                  <p className="text-green-400 font-medium">
                    Precio: {ethers.formatUnits(selectedNFT.price, 18)} POL
                  </p>
                </div>
              )}
              
              {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                <>
                  <h4 className="text-white font-medium mb-2">Atributos</h4>
                  <div className="space-y-2 mb-6 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
                    {selectedNFT.attributes.map((attr, i) => (
                      <div key={i} className="flex justify-between bg-black/30 p-2 rounded">
                        <span className="text-gray-400">{attr.trait_type}</span>
                        <span className="text-purple-300">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {contractAddress && (
                  <a
                    href={`https://opensea.io/assets/matic/${contractAddress}/${selectedNFT.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                  >
                    <FaExternalLinkAlt /> Ver en OpenSea
                  </a>
                )}
                
                <Link
                  to={`/nft/${selectedNFT.tokenId}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white transition-colors"
                  onClick={onClose}
                >
                  <FaImage /> Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default NFTDetailModal;
