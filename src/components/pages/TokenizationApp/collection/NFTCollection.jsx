import React, { useState, useEffect, useMemo, useContext, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEthereum, FaHeart, FaTags, FaExternalLinkAlt, FaWallet } from 'react-icons/fa';
import { ethers } from 'ethers';
import { WalletContext } from '../../../../context/WalletContext';
import LoadingSpinner from '../../../LoadOverlay/LoadingSpinner';
import NFTErrorState from './NFTErrorState';
import IPFSImage from '../../../ui/IPFSImage';


const NFTDetailModal = lazy(() => import('../../../modals/NFTDetailModal'));


const NFTCollection = ({ nfts, loading, error, onRetry }) => {
  const { walletConnected, connectWallet } = useContext(WalletContext);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Handle retry action by forwarding to parent component if provided
  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry();
    } else {
      // Fallback - reload the page
      window.location.reload();
    }
  };
  // Handle NFT click to open modal
  const handleNFTClick = (nft) => {
    console.log('NFT clicked:', nft);
    setSelectedNFT(nft);
  };

  // Handle modal close
  const handleCloseModal = () => {
    console.log('Closing modal');
    setSelectedNFT(null);
  };

  // Debug log for selectedNFT state
  useEffect(() => {
    console.log('selectedNFT state changed:', selectedNFT);
  }, [selectedNFT]);

  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <LoadingSpinner size="default" message="Loading your NFTs..." />
      </div>
    );
  }

  if (error) {
    return <NFTErrorState error={error} onRetry={handleRetry} walletConnected={walletConnected} />;
  }

  // Show connect wallet message when wallet is not connected OR when no NFTs and wallet is connected
  if (!walletConnected || (walletConnected && nfts.length === 0)) {
    return (
      <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 text-center">
        {!walletConnected ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
              <FaWallet className="text-blue-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect Your Wallet
            </h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
              Please connect your wallet to view and manage your NFT collection
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              <FaTags className="text-purple-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              No NFTs Yet
            </h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
              Your collection is empty. Start building your digital asset portfolio by minting your first NFT.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {nfts.map((nft) => (
          <NFTCard 
            key={nft.id || `${nft.contractAddress}-${nft.tokenId}`} 
            nft={nft} 
            onClick={() => handleNFTClick(nft)}
          />
        ))}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <Suspense fallback={null}>
          <NFTDetailModal
            selectedNFT={selectedNFT}
            onClose={handleCloseModal}
            contractAddress={selectedNFT.contractAddress}
          />
        </Suspense>
      )}
    </>
  );
};

// NFT Card component - Minor styling updates for consistency
const NFTCard = ({ nft, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    onClick(nft);
  };
  
  // Format price nicely - memoize to avoid unnecessary calculations
  const formattedPrice = useMemo(() => {
    if (!nft.price || !ethers.formatEther) return "0.0000";
    return parseFloat(ethers.formatEther(nft.price)).toFixed(4);
  }, [nft.price]);

  return (
    <motion.div
      className="relative bg-gradient-to-b from-purple-900/40 to-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* NFT Image with consistent aspect ratio */}
      <div className="nft-collection-image-container">
        <IPFSImage 
          src={nft.image}
          alt={nft.name || "NFT"} 
          className="nft-collection-image"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          placeholderSrc="/LogoNuvos.webp"
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
        
        {/* Hover Details */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h3 className="text-white font-bold mb-1">{nft.name}</h3>
          <p className="text-gray-300 text-xs mb-3 line-clamp-3">{nft.description}</p>
          
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
    </motion.div>
  );
};

export default NFTCollection;
