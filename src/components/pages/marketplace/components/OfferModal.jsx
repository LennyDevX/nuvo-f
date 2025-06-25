import React, { useState } from 'react';
import { FiX, FiDollarSign } from 'react-icons/fi';

const OfferModal = ({ isOpen, onClose, onSubmit, nft, loading = false }) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [expirationDays, setExpirationDays] = useState(7);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!offerAmount || parseFloat(offerAmount) <= 0) return;
    
    onSubmit(parseFloat(offerAmount), expirationDays);
    setOfferAmount('');
    setExpirationDays(7);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center p-4`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gray-800 rounded-lg p-6 w-full max-w-md border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Make an Offer</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-primary/20 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* NFT Info */}
        <div className="mb-6 p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-primary/20">
          <h4 className="text-white font-semibold">
            {nft.metadata?.name || `NFT #${nft.tokenId}`}
          </h4>
          <p className="text-gray-400 text-sm">
            Current Price: {parseFloat(nft.price).toFixed(4)} POL
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Offer Amount */}
          <div className="nuvos-filter-group">
            <label className="nuvos-filter-label">
              Offer Amount (POL)
            </label>
            <div className="nuvos-search-container">
              <FiDollarSign className="nuvos-search-icon" />
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="0.0000"
                className="nuvos-search-input"
                required
              />
            </div>
          </div>

          {/* Expiration */}
          <div className="nuvos-filter-group">
            <label className="nuvos-filter-label">
              Offer Expires In
            </label>
            <select
              value={expirationDays}
              onChange={(e) => setExpirationDays(parseInt(e.target.value))}
              className="nuvos-select"
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!offerAmount || loading}
              className="flex-1 px-4 py-2 bg-nuvo-gradient-button text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" variant="dots" />
                  <span>Making Offer...</span>
                </>
              ) : (
                'Make Offer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;

