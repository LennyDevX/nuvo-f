import React, { useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion as m } from 'framer-motion';
import { FaImage, FaTimes, FaChevronDown, FaChevronUp, FaHeart, FaShare, FaCheck, FaStore, FaEthereum } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { WalletContext } from '../../context/WalletContext';
import IPFSImage from '../ui/IPFSImage';
import { getOptimizedImageUrl } from '../../utils/blockchain/blockchainUtils';
import MarketplaceABI from '../../Abi/Marketplace.json';
import useListNFT from '../../hooks/nfts/useListNFT';

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
const NFTDetailModal = ({ selectedNFT, onClose, contractAddress, onListNFT }) => {
  const { account, walletConnected } = useContext(WalletContext);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(selectedNFT?.likes || 0);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [listCategory, setListCategory] = useState(selectedNFT?.category || 'collectible');
  const { listNFT, loading: listingLoading, error: listingError, success: listingSuccess, txHash } = useListNFT();
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
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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

  // Utilidad para abreviar wallets
  const formatWallet = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Agrega estas funciones para mostrar/ocultar el formulario de listado
  const handleShowListForm = () => setShowListForm(true);
  const handleHideListForm = () => setShowListForm(false);

  // Handler para listar NFT en el marketplace
  const handleListNFT = async (e) => {
    e.preventDefault();
    try {
      const result = await listNFT({
        tokenId: selectedNFT.tokenId,
        price: listPrice,
        category: listCategory
      });
      setShowListForm(false);
      setListPrice('');
      setListCategory(selectedNFT?.category || 'collectible');
      // Optimized toast with link to transaction
      toast.success(
        <span>
          NFT listado correctamente.{' '}
          {result?.txHash && (
            <a
              href={`https://polygonscan.com/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-200 ml-1"
            >
              Ver transacción
            </a>
          )}
        </span>,
        { duration: 7000 }
      );
    } catch (err) {
      toast.error(listingError || err.message || 'Error al listar el NFT');
    }
  };

  if (!selectedNFT) return null;

  // Render modal using portal to document.body
  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
      style={isMobile ? { paddingTop: `${Math.max(scrollY * 0.1, 16)}px` } : {}}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.97, y: isMobile ? 30 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: isMobile ? 30 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-xl shadow-2xl relative z-[99999] w-full max-w-3xl max-h-[90vh] flex ${isMobile ? 'flex-col' : 'flex-row'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 right-0 m-3 z-20">
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full p-2 transition-all"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto" style={{ maxHeight: '90vh' }}>
          {/* Left: Image & Actions */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-start gap-6 p-6 border-r border-purple-900/20">
            <div className="w-full aspect-square max-w-xs rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-700/30 shadow-lg">
              <IPFSImage
                src={getOptimizedImageUrl(selectedNFT.image)}
                alt={selectedNFT.name || `NFT #${selectedNFT.tokenId}`}
                className="w-full h-full object-cover"
                placeholderSrc={PLACEHOLDER_IMAGE}
              />
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold btn-nuvo-base btn-nuvo-outline transition-all duration-200 ${
                    hasLiked
                      ? 'bg-red-600 text-white border-red-600 shadow'
                      : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {isLiking ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaHeart />
                  )}
                  <span>{isLiking ? '...' : hasLiked ? 'Liked' : 'Like'} ({likesCount})</span>
                </button>
                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold btn-nuvo-base btn-nuvo-outline transition-all duration-200"
                >
                  {shareLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : copied ? (
                    <FaCheck />
                  ) : (
                    <FaShare />
                  )}
                  <span>{shareLoading ? 'Sharing...' : copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGoToMarketplace}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold border border-blue-600 bg-blue-700 text-white hover:bg-blue-800 transition-all duration-200"
                >
                  <FaStore />
                  <span>Marketplace</span>
                </button>
                <button
                  onClick={handleShowListForm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold btn-nuvo-base btn-nuvo-primary text-white hover:bg-green-800 transition-all duration-200"
                  disabled={selectedNFT.isForSale}
                >
                  <FaChevronUp />
                  <span>{selectedNFT.isForSale ? 'Already Listed' : 'Listar NFT'}</span>
                </button>
              </div>
              {/* List NFT Form */}
              {showListForm && (
                <form onSubmit={handleListNFT} className="bg-gray-800/90 p-4 rounded-lg mt-2 border border-gray-700">
                  <div className="mb-2">
                    <label className="block text-xs text-gray-300 mb-1">Price (POL)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={listPrice}
                      onChange={e => setListPrice(e.target.value)}
                      className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs text-gray-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={listCategory}
                      onChange={e => setListCategory(e.target.value)}
                      className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" disabled={listingLoading}>
                      {listingLoading ? 'Listando...' : 'Listar'}
                    </button>
                    <button type="button" onClick={handleHideListForm} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancelar</button>
                  </div>
                  {/* Solo muestra errores, no mensajes de éxito aquí */}
                  {listingError && <div className="text-red-400 text-xs mt-2">{listingError}</div>}
                </form>
              )}
            </div>
          </div>
          {/* Right: NFT Info */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 p-6">
            {/* Title & Category */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{selectedNFT.name || `NFT #${selectedNFT.tokenId}`}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-gray-700/80 px-3 py-1 rounded-full text-white font-medium text-xs">#{selectedNFT.tokenId}</span>
                <span className="bg-purple-700/80 px-3 py-1 rounded-full text-white font-medium text-xs">
                  {selectedNFT.category}
                </span>
                {selectedNFT.isForSale && (
                  <span className="bg-green-700/80 px-3 py-1 rounded-full text-green-200 font-medium text-xs flex items-center gap-1">
                    <FaChevronUp /> For Sale
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <FaEthereum className="text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {selectedNFT.price ? parseFloat(ethers.formatUnits(selectedNFT.price, 18)).toFixed(3) : '0.00'} POL
                </span>
              </div>
            </div>
            {/* Description */}
            {selectedNFT.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-200 leading-relaxed text-base">{selectedNFT.description}</p>
              </div>
            )}
            {/* Attributes */}
            {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedNFT.attributes.map((attr, index) => (
                    <div key={index} className="bg-gray-800/80 border border-gray-700 rounded-lg p-2">
                      <div className="text-gray-400 text-xs uppercase font-medium">{attr.trait_type}</div>
                      <div className="text-white font-semibold mt-1 text-sm">
                        {attr.trait_type?.toLowerCase() === 'creator'
                          ? formatWallet(attr.value)
                          : attr.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Creator/Owner */}
            <div>
              <h4 className="text-white font-medium text-sm mb-2">Creator</h4>
              <span className="text-purple-300 font-mono text-xs">{formatWallet(selectedNFT.creator || selectedNFT.owner)}</span>
            </div>
            {/* Details Button */}
            <Link
              to={`/nft/${selectedNFT.tokenId}`}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors rounded-lg px-4 py-2.5 font-medium text-sm w-full mt-2"
              onClick={onClose}
            >
              <FaImage className="text-sm" />
              View Details
            </Link>
          </div>
        </div>
      </m.div>
    </div>,
    document.body
  );
};

export default NFTDetailModal;
