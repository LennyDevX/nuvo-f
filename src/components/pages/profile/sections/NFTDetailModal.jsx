import React, { useEffect, useState, useContext } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaTimes, FaHeart, FaShare, FaStore, FaCheck } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { WalletContext } from '../../../../context/WalletContext';
import IPFSImage from '../../../ui/IPFSImage';
import { getOptimizedImageUrl } from '../../../../utils/blockchain/blockchainUtils';
import { createPortal } from 'react-dom';
import MarketplaceABI from '../../../../Abi/Marketplace.json';

// Constants
const PLACEHOLDER_IMAGE = "/LogoNuvos.webp";
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS_V2 || "0xe8f1A205ACf4dBbb08d6d8856ae76212B9AE7582";

/**
 * Modal component for displaying detailed NFT information
 * 
 * @param {Object} selectedNFT - The NFT to display details for
 * @param {Function} onClose - Function to call when closing the modal
 * @param {String} contractAddress - The NFT contract address
 */
const NFTDetailModal = ({ selectedNFT, onClose, contractAddress }) => {
  const { account, walletConnected } = useContext(WalletContext);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(selectedNFT?.likes || 0);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

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
    
    // Load likes data when component mounts
    loadLikesData();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, selectedNFT?.tokenId, account, walletConnected]);

  // Load likes data from contract
  const loadLikesData = async () => {
    if (!selectedNFT?.tokenId) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress || CONTRACT_ADDRESS, 
        MarketplaceABI.abi, 
        provider
      );

      // Get likes count
      if (typeof contract.getLikesCount === 'function') {
        const count = await contract.getLikesCount(selectedNFT.tokenId);
        setLikesCount(count.toString());
        
        // Check if current user has liked (only if wallet is connected)
        if (walletConnected && account && typeof contract.hasUserLiked === 'function') {
          const userLiked = await contract.hasUserLiked(selectedNFT.tokenId, account);
          setHasLiked(userLiked);
        }
      }
    } catch (error) {
      console.warn('Error loading likes data:', error);
      // Continue without likes information
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle like functionality
  const handleLike = async () => {
    if (!walletConnected || !account || isLiking) {
      toast.error('Please connect your wallet to like this NFT');
      return;
    }
    
    setIsLiking(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress || CONTRACT_ADDRESS, 
        MarketplaceABI.abi, 
        signer
      );

      // Toggle like state
      const newLikeState = !hasLiked;
      
      // Call smart contract function
      const tx = await contract.toggleLike(selectedNFT.tokenId, newLikeState);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Update local state
        setHasLiked(newLikeState);
        setLikesCount(prev => {
          const currentCount = typeof prev === 'string' ? parseInt(prev) : prev;
          return newLikeState ? currentCount + 1 : Math.max(0, currentCount - 1);
        });
        
        toast.success(newLikeState ? 'NFT liked successfully!' : 'NFT unliked successfully!');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction cancelled by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error('Failed to update like. Please try again.');
      }
    } finally {
      setIsLiking(false);
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    if (shareLoading) return;
    
    setShareLoading(true);
    try {
      const shareUrl = `${window.location.origin}/nft/${selectedNFT.tokenId}`;
      const shareText = `Check out this amazing NFT: ${selectedNFT.name || `NFT #${selectedNFT.tokenId}`}`;
      
      if (navigator.share && isMobile) {
        await navigator.share({
          title: selectedNFT.name || `NFT #${selectedNFT.tokenId}`,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error.name !== 'AbortError') {
        try {
          const shareUrl = `${window.location.origin}/nft/${selectedNFT.tokenId}`;
          const shareText = `Check out this amazing NFT: ${selectedNFT.name || `NFT #${selectedNFT.tokenId}`}`;
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 3000);
        } catch (clipboardError) {
          toast.error('Failed to share. Please try again.');
        }
      }
    } finally {
      setShareLoading(false);
    }
  };

  // Handle marketplace navigation
  const handleGoToMarketplace = () => {
    onClose();
    navigate('/marketplace');
  };

  if (!selectedNFT) return null;

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
        <div className="overflow-y-auto nft-detail-modal-content" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
          <div className={isMobile ? 'p-3' : 'p-4'}>
            {isMobile ? (
              // Mobile Layout
              <div className="space-y-3">
                {/* Image */}
                <div className="w-full">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50 max-w-xs mx-auto">
                    <IPFSImage 
                      src={getOptimizedImageUrl(selectedNFT.image)} 
                      alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                      className="w-full h-full object-cover"
                      placeholderSrc={PLACEHOLDER_IMAGE}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex-1 nft-detail-action-button p-2 ${
                      hasLiked 
                        ? 'nft-like-button liked bg-red-600 text-white border-red-600' 
                        : 'nft-like-button bg-gray-700 text-gray-300 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isLiking ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaHeart className="w-3 h-3" />
                      )}
                      <span className="text-xs">{likesCount}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    disabled={shareLoading}
                    className="flex-1 nft-detail-action-button nft-share-button p-2"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {shareLoading ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : copied ? (
                        <FaCheck className="w-3 h-3" />
                      ) : (
                        <FaShare className="w-3 h-3" />
                      )}
                      <span className="text-xs">
                        {shareLoading ? 'Loading' : copied ? 'Copied!' : 'Share'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Marketplace Button */}
                <button
                  onClick={handleGoToMarketplace}
                  className="btn-nuvo-base bg-nuvo-gradient-button nft-marketplace-button"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaStore className="w-4 h-4" />
                    <span>Explore Marketplace</span>
                  </div>
                </button>

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
                          <div className="text-gray-300 truncate">{attr.trait_type}</div>
                          <div className="text-purple-300 font-medium truncate">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                    {selectedNFT.attributes.length > 4 && (
                      <p className="text-gray-400 text-xs text-center mt-1">
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
              // Desktop Layout
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Image */}
                  <div className="space-y-3">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/30 to-black/50">
                      <IPFSImage 
                        src={getOptimizedImageUrl(selectedNFT.image)} 
                        alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`} 
                        className="w-full h-full object-cover"
                        placeholderSrc={PLACEHOLDER_IMAGE}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex-1 nft-detail-action-button p-3 ${
                          hasLiked 
                            ? 'nft-like-button liked bg-red-600 text-white border-red-600' 
                            : 'nft-like-button bg-gray-700 text-gray-300 border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLiking ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FaHeart className="w-4 h-4" />
                          )}
                          <span className="text-sm">{likesCount}</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={handleShare}
                        disabled={shareLoading}
                        className="flex-1 nft-detail-action-button nft-share-button p-3"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {shareLoading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : copied ? (
                            <FaCheck className="w-4 h-4" />
                          ) : (
                            <FaShare className="w-4 h-4" />
                          )}
                          <span className="text-sm">
                            {shareLoading ? 'Sharing...' : copied ? 'Copied!' : 'Share'}
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Marketplace Button */}
                    <button
                      onClick={handleGoToMarketplace}
                      className="btn-nuvo-base bg-nuvo-gradient-button nft-marketplace-button"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FaStore className="w-4 h-4" />
                        <span>Explore Marketplace</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Information Section */}
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
                              <span className="text-gray-300 font-medium text-sm">{attr.trait_type}</span>
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

