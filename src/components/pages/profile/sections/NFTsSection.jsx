import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaExternalLinkAlt, FaShoppingCart, FaSpinner, FaLayerGroup } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useTokenization } from '../../../../context/TokenizationContext';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';

// Lazy load the NFT detail modal component
const NFTDetailModal = lazy(() => import('./NFTDetailModal'));

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x71f3d55856e4058ed06ee057d79ada615f65cdf5";
// Update to use LogoNuvos as placeholder image
const PLACEHOLDER_IMAGE = "/LogoNuvos.webp";

// Extracting NFTCard as a separate memoized component
const NFTCard = React.memo(({ nft, index, onClick }) => (
  <m.div
    key={`${nft.tokenId}-${index}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: Math.min(index * 0.05, 1) }} // Cap delay at 1 second max
    className="bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 flex flex-col"
    onClick={onClick}
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
          // Add width and height to prevent layout shift
          width="100%"
          height="100%"
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
    // Mostramos todos los NFTs, solo filtramos los que tienen un error explícito
    return nfts.filter(nft => !nft.error);
  }, [nfts]);

  // Use a stable callback that doesn't change on every render
  const handleNFTClick = useCallback((nft) => {
    setSelectedNFT(nft);
  }, []);
  
  // Render grid with virtualization for large collections
  const renderNFTGrid = useCallback(() => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {realNfts.slice(0, 20).map((nft, index) => (
          <NFTCard 
            key={`${nft.tokenId}-${index}`} 
            nft={nft} 
            index={index} 
            onClick={() => handleNFTClick(nft)}
          />
        ))}
        {realNfts.length > 20 && (
          <div className="col-span-full text-center py-4">
            <Link to="/nfts" className="text-purple-400 hover:text-purple-300">
              View all {realNfts.length} NFTs →
            </Link>
          </div>
        )}
      </div>
    );
  }, [realNfts, handleNFTClick]);
  
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
      
      {renderNFTGrid()}
      
      {/* NFT Detail Modal with Suspense */}
      {selectedNFT && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-16 h-16 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
        </div>}>
          <NFTDetailModal
            selectedNFT={selectedNFT}
            onClose={() => setSelectedNFT(null)}
            contractAddress={CONTRACT_ADDRESS}
          />
        </Suspense>
      )}
    </m.div>
  );
};

export default React.memo(NFTsSection);
