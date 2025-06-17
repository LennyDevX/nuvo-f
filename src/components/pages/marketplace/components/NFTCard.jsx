import React, { useState, useContext } from 'react';
import { FiHeart, FiTag, FiDollarSign, FiUser, FiClock, FiCheck } from 'react-icons/fi';
import IPFSImage from '../../../ui/IPFSImage';
import OfferModal from './OfferModal';
import { WalletContext } from '../../../../context/WalletContext';

const NFTCard = ({ nft, onBuy, onMakeOffer, isOwner, isSeller }) => {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { account } = useContext(WalletContext);

  // Check if current user is the owner/seller
  const isCurrentUserOwner = account && (
    nft.owner?.toLowerCase() === account.toLowerCase() ||
    nft.seller?.toLowerCase() === account.toLowerCase()
  );

  const handleBuy = () => {
    onBuy(nft.tokenId, nft.price);
  };

  const handleMakeOffer = (amount, days) => {
    onMakeOffer(nft.tokenId, amount, days);
    setShowOfferModal(false);
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

  // Get image URL from various possible sources
  const getImageUrl = () => {
    return nft.metadata?.image || nft.image || nft.imageUrl || null;
  };

  return (
    <>
      <div className="nft-card-pro group">
        {/* Image using IPFSImage component with consistent sizing */}
        <div className="nft-card-pro-image-container">
          <IPFSImage 
            src={getImageUrl()}
            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
            className="nft-card-pro-image"
            placeholderSrc="/NFT-placeholder.webp"
            onLoad={() => console.log(`NFT #${nft.tokenId} image loaded successfully`)}
            onError={() => console.warn(`Failed to load image for NFT #${nft.tokenId}`, { 
              metadata: nft.metadata,
              imageUrl: getImageUrl() 
            })}
          />
        </div>

        {/* Badges Section */}
        <div className="nft-card-pro-badges-section">
          <span className="nft-card-pro-badge nft-badge-category">
            {nft.category || 'NFT'}
          </span>
          <button 
            className="nft-card-pro-badge nft-badge-like"
            onClick={handleLike}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart 
              className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
              style={{ fill: isLiked ? 'currentColor' : 'none' }}
            />
          </button>
          <span className="nft-card-pro-badge nft-badge-id">
            #{nft.tokenId}
          </span>
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
                className="btn-nuvo-base bg-nuvo-gradient-button text-white font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-2 flex-1 transition-all hover:opacity-90"
                aria-label={`Buy NFT ${nft.metadata?.name || nft.tokenId} for ${formatPrice(nft.price)} POL`}
              >
                <FiTag className="w-3 h-3" />
                Buy
              </button>
              <button
                onClick={() => setShowOfferModal(true)}
                className="btn-nuvo-base btn-nuvo-outline text-purple-400 font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-2 flex-1 transition-all hover:bg-purple-500/10"
                aria-label={`Make offer for NFT ${nft.metadata?.name || nft.tokenId}`}
              >
                <FiDollarSign className="w-3 h-3" />
                Offer
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
      />
    </>
  );
};

export default NFTCard;
