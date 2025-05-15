import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaExternalLinkAlt, FaShoppingCart, FaSpinner, FaLayerGroup } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useTokenization } from '../../../../context/TokenizationContext';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x71f3d55856e4058ed06ee057d79ada615f65cdf5";
// Update to use LogoNuvos as placeholder image
const PLACEHOLDER_IMAGE = "/LogoNuvos.webp";

const NFTsSection = ({ account }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  // Add state to track if content should be shown while still loading
  const [showPreview, setShowPreview] = useState(false);
  const { 
    nfts, 
    nftsLoading: loading, 
    nftsError: error, 
    updateUserAccount 
  } = useTokenization();
  
  // Update TokenizationContext with current user account
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
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
  
  // Filter out placeholder images or representative NFTs
  const realNfts = useMemo(() => {
    if (!nfts || nfts.length === 0) return [];
    // Mostramos todos los NFTs, solo filtramos los que tienen un error explícito
    return nfts.filter(nft => !nft.error);
  }, [nfts]);

  // Cache rendered NFT elements to prevent rerenders
  const renderedNFTs = useCallback(() => {
    return realNfts.map((nft, index) => (
      <m.div
        key={`${nft.tokenId}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 flex flex-col"
        onClick={() => setSelectedNFT(nft)}
      >
        {/* Contenedor de imagen mejorado - ratio fijo y objeto contenido en lugar de recortado */}
        <div className="relative w-full pt-[100%] bg-purple-900/10">
          {nft.image ? (
            <img 
              src={nft.image} 
              alt={nft.name || `NFT #${nft.tokenId}`} 
              className="absolute inset-0 w-full h-full object-contain p-2"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE;
              }}
              loading="lazy" // Add lazy loading
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <FaImage className="text-3xl text-purple-400" />
            </div>
          )}
          {nft.isForSale && nft.price && (
            <div className="absolute top-2 right-2 bg-green-600/80 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
              {ethers.formatUnits(nft.price, 18)} POL
            </div>
          )}
        </div>
        
        {/* NFT text content */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-white font-medium mb-2 text-lg leading-tight min-h-[3.5rem]">
              {nft.name || `NFT #${nft.tokenId}`}
            </h3>
            <p className="text-gray-400 text-sm min-h-[2.5rem] mb-2">
              {nft.description && nft.description.length > 80
                ? `${nft.description.substring(0, 80)}...`
                : nft.description || "Sin descripción"}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-purple-500/10">
            <span className="text-xs text-purple-400">ID: #{nft.tokenId}</span>
            {nft.likes && parseInt(nft.likes) > 0 && (
              <div className="text-xs text-pink-400">
                ♥ {nft.likes} likes
              </div>
            )}
          </div>
        </div>
      </m.div>
    ));
  }, [realNfts]);
  
  // Show loading state, but with a shorter duration
  if (loading && !showPreview) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "400px" }}
      >
        <FaSpinner className="text-5xl text-purple-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Cargando NFTs</h3>
        <p className="text-gray-300">
          Recuperando tu colección de NFTs desde la blockchain...
        </p>
      </m.div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "400px" }}
      >
        <div className="mb-6 p-3 bg-red-900/30 rounded-full">
          <FaImage className="text-5xl text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Error al cargar NFTs</h3>
        <p className="text-gray-300 max-w-md mb-6">
          Hubo un problema al cargar tu colección de NFT: {error?.message || error}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white flex items-center justify-center gap-2"
          >
            Intentar de nuevo
          </button>
        </div>
      </m.div>
    );
  }
  
  // If no real NFTs are found, show empty state
  if (!realNfts || realNfts.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "400px" }}
      >
        <div className="mb-6 p-3 bg-purple-900/30 rounded-full">
          <FaLayerGroup className="text-5xl text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Colección de NFT vacía</h3>
        <p className="text-gray-300 max-w-md mb-6">
          Aún no tienes ningún NFT de NUVOS en tu colección. Adquiere tu primer NFT para representar la propiedad digital de activos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/tokenize"
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white flex items-center justify-center gap-2"
          >
            <FaImage className="text-sm" /> Tokenizar un Activo
          </Link>
          <Link
            to="/nfts"
            className="px-5 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="text-sm" /> Explorar Colección NFT
          </Link>
        </div>
      </m.div>
    );
  }
  
  // Display real NFTs
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderedNFTs()}
      </div>
      
      {/* NFT Detail Modal */}
      {selectedNFT && (
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
                onClick={() => setSelectedNFT(null)} 
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
                    <a
                      href={`https://opensea.io/assets/matic/${CONTRACT_ADDRESS}/${selectedNFT.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                    >
                      <FaExternalLinkAlt /> Ver en OpenSea
                    </a>
                    
                    <Link
                      to={`/nft/${selectedNFT.tokenId}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white transition-colors"
                      onClick={() => setSelectedNFT(null)}
                    >
                      <FaImage /> Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </m.div>
  );
};

export default NFTsSection;
