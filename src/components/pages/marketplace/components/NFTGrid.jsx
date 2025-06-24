import React from 'react';
import NFTCard from './NFTCard';
import LoadingSpinner from '../../../ui/LoadingSpinner';

// Añade la prop loading
const NFTGrid = ({ nfts, onBuy, onMakeOffer, currentAccount, loading, refreshing = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner 
          size="large" 
          variant="gradient"
          text="Loading NFTs"
          showDots={true}
          className="text-purple-400"
        />
      </div>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No NFTs to display</p>
      </div>
    );
  }

  return (
    <div className="nft-grid-pro">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.tokenId}
          nft={nft}
          onBuy={onBuy}
          onMakeOffer={onMakeOffer}
          isOwner={nft.owner?.toLowerCase() === currentAccount?.toLowerCase()}
          isSeller={nft.seller?.toLowerCase() === currentAccount?.toLowerCase()}
          refreshing={refreshing}
        />
      ))}
    </div>
  );
};

export default NFTGrid;
