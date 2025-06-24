import React, { useState, useContext, useCallback } from 'react';
import { FiHeart, FiTag, FiDollarSign, FiUser, FiClock, FiCheck } from 'react-icons/fi';
import IPFSImage from '../../../ui/IPFSImage';
import OfferModal from './OfferModal';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import { WalletContext } from '../../../../context/WalletContext';
import { imageCache } from '../../../../utils/blockchain/imageCache';
import { getCategoryDisplayName } from '../../../../utils/blockchain/blockchainUtils';

const NFTCard = ({ nft, onBuy, onMakeOffer, isOwner, isSeller, refreshing = false }) => {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { account } = useContext(WalletContext);

  // Check if current user is the owner/seller
  const isCurrentUserOwner = account && (
    nft.owner?.toLowerCase() === account.toLowerCase() ||
    nft.seller?.toLowerCase() === account.toLowerCase()
  );

  const handleBuy = async () => {
    setBuyLoading(true);
    try {
      await onBuy(nft.tokenId, nft.price);
    } finally {
      setBuyLoading(false);
    }
  };

  const handleMakeOffer = async (amount, days) => {
    setOfferLoading(true);
    try {
      await onMakeOffer(nft.tokenId, amount, days);
      setShowOfferModal(false);
    } finally {
      setOfferLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    console.log(`NFT ${nft.tokenId} ${isLiked ? 'unliked' : 'liked'}`);
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice >= 1000) {
      return `${(numPrice / 1000).toFixed(1)}K`;
    }
    return numPrice.toFixed(numPrice < 1 ? 4 : 2);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Get image URL from various possible sources with caching
  const getImageUrl = useCallback(() => {
    const imageUrl = nft.metadata?.image || nft.image || nft.imageUrl;
    if (!imageUrl) return null;
    
    // Use cached version if available
    const cached = imageCache.get(imageUrl);
    return cached || imageUrl;
  }, [nft.metadata?.image, nft.image, nft.imageUrl]);

  return (
    <>
      <div className={`nft-card-pro group relative ${refreshing ? 'opacity-75' : ''}`}>
        {/* Refresh overlay for individual cards */}
        {refreshing && (
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
            <LoadingSpinner size="small" variant="dots" className="text-purple-400" />
          </div>
        )}

        {/* Image using IPFSImage component with consistent sizing */}
        <div className="nft-card-pro-image-container">
          <IPFSImage 
            src={getImageUrl()}
            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
            className="nft-card-pro-image"
            placeholderSrc="/NFT-placeholder.webp"
            loading="lazy"
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Image loading overlay */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center rounded-t-lg">
              <LoadingSpinner size="small" variant="pulse" className="text-purple-400" />
            </div>
          )}
        </div>

        

        {/* Content */}
        <div className="nft-card-pro-content">
          {/* Header: Title/Description and Price */}
          <div className="nft-card-pro-header">
            <div className="nft-card-pro-title-section">
              <h3 className="nft-card-pro-title">
                {truncateText(nft.metadata?.name || `NFT #${nft.tokenId}`, 25)}
              </h3>
              {nft.metadata?.description && (
                <p className="nft-card-pro-desc">
                  {truncateText(nft.metadata.description, 60)}
                </p>
              )}
            </div>
            
            <div className="nft-card-pro-price-compact">
              <div className="nft-card-pro-price">
                <span>{formatPrice(nft.price)}</span>
                <span className="nft-card-pro-price-currency">POL</span>
              </div>
            </div>
          </div>

          {/* Badges Section */}
        <div className="nft-card-pro-badges-section">
          <span className="nft-card-pro-badge nft-badge-category">
            {getCategoryDisplayName(nft.category)}
          </span>
          
          <span className="nft-card-pro-badge nft-badge-id">
            #{nft.tokenId}
          </span>
        </div>

          {/* Owner Info */}
          <div className="nft-card-pro-info">
            <div className="nft-card-pro-owner-section">
              <div className="nft-card-pro-owner-label">
                <FiUser className="w-3 h-3" />
                <span>{isCurrentUserOwner ? 'Your Listing' : 'Owner'}</span>
              </div>
              <div className="nft-card-pro-owner">
                {nft.seller ?
                  `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}` :
                  'Unknown'
                }
              </div>
            </div>
          </div>

          {/* Time Info */}
          <div className="nft-card-pro-time">
            <FiClock className="w-3 h-3" />
            <span>
              Listed {nft.listedAt ?
                new Date(parseInt(nft.listedAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                'Recently'
              }
            </span>
          </div>

          {/* Actions - Show different buttons based on ownership */}
          {!isCurrentUserOwner ? (
            <div className="nft-card-pro-actions">
              <button
                onClick={handleBuy}
                disabled={buyLoading || refreshing}
                className="btn-nuvo-base bg-nuvo-gradient-button text-white font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-2 flex-1 transition-all hover:opacity-90 disabled:opacity-50"
                aria-label={`Buy NFT ${nft.metadata?.name || nft.tokenId} for ${formatPrice(nft.price)} POL`}
              >
                {buyLoading ? (
                  <>
                    <LoadingSpinner size="small" variant="dots" />
                    <span className="ml-1">Buying...</span>
                  </>
                ) : (
                  <>
                    <FiTag className="w-3 h-3" />
                    Buy
                  </>
                )}
              </button>
              <button
                onClick={() => setShowOfferModal(true)}
                disabled={offerLoading || refreshing}
                className="btn-nuvo-base btn-nuvo-outline text-purple-400 font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-2 flex-1 transition-all hover:bg-purple-500/10 disabled:opacity-50"
                aria-label={`Make offer for NFT ${nft.metadata?.name || nft.tokenId}`}
              >
                {offerLoading ? (
                  <>
                    <LoadingSpinner size="small" variant="dots" />
                    <span className="ml-1">Offering...</span>
                  </>
                ) : (
                  <>
                    <FiDollarSign className="w-3 h-3" />
                    Offer
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="nft-card-pro-actions">
              <button
                disabled
                className="btn-nuvo-base bg-green-600/80 text-white font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-2 w-full cursor-not-allowed opacity-75"
                aria-label="You own this NFT"
              >
                <FiCheck className="w-3 h-3" />
                You Own This NFT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleMakeOffer}
        nft={nft}
        loading={offerLoading}
      />
    </>
  );
};

export default NFTCard;

