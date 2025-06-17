import React, { useState } from 'react';
import { FiHeart, FiTag, FiDollarSign, FiUser, FiClock } from 'react-icons/fi';
import OfferModal from './OfferModal';

const NFTCard = ({ nft, onBuy, onMakeOffer, isOwner, isSeller }) => {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleBuy = () => {
    onBuy(nft.tokenId, nft.price);
  };

  const handleMakeOffer = (amount, days) => {
    onMakeOffer(nft.tokenId, amount, days);
    setShowOfferModal(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Aquí puedes agregar la lógica para guardar el like en el backend
    console.log(`NFT ${nft.tokenId} ${isLiked ? 'unliked' : 'liked'}`);
  };

  const getImageUrl = () => {
    if (nft.metadata?.image) {
      if (nft.metadata.image.startsWith('ipfs://')) {
        const ipfsHash = nft.metadata.image.replace('ipfs://', '');
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
      return nft.metadata.image;
    }
    return '/placeholder-nft.jpg';
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

  return (
    <>
      <div className="nft-card-pro group">
        {/* Imagen grande y profesional */}
        <div style={{ position: 'relative' }}>
          {(isImageLoading || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-t-lg">
              {imageError ? (
                <div className="text-center text-gray-400">
                  <FiTag className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No Image</p>
                </div>
              ) : (
                <div className="animate-pulse w-full h-full bg-purple-900/30 rounded-t-lg" />
              )}
            </div>
          )}
          {!imageError && (
            <img
              src={getImageUrl()}
              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
              className="nft-card-pro-image"
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
              draggable={false}
              style={{ border: 'none', outline: 'none' }}
            />
          )}
        </div>

        {/* Badges Section - Like e ID intercambiados */}
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

        {/* Contenido organizado */}
        <div className="nft-card-pro-content">
          {/* Header: Título/Descripción a la izquierda, Precio a la derecha */}
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

          {/* Info: Solo Owner */}
          <div className="nft-card-pro-info">
            <div className="nft-card-pro-owner-section">
              <div className="nft-card-pro-owner-label">
                <FiUser className="w-3 h-3" />
                <span>{isSeller ? 'Your Listing' : 'Owner'}</span>
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

          {/* Actions */}
          {!isOwner && !isSeller ? (
            <div className="nft-card-pro-actions">
              <button
                onClick={handleBuy}
                className="nft-buy-btn"
                aria-label={`Buy NFT ${nft.metadata?.name || nft.tokenId} for ${formatPrice(nft.price)} POL`}
              >
                <FiTag className="w-3 h-3" />
                Buy
              </button>
              <button
                onClick={() => setShowOfferModal(true)}
                className="nft-offer-btn"
                aria-label={`Make offer for NFT ${nft.metadata?.name || nft.tokenId}`}
              >
                <FiDollarSign className="w-3 h-3" />
                Offer
              </button>
            </div>
          ) : (
            <div className="nft-card-pro-status">
              {isSeller ? '🏷️ Yours' : '👑 Owned'}
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
