import React from 'react';
import NFTCard from './NFTCard';
import LoadingSpinner from '../../../ui/LoadingSpinner';

// Añade la prop loading
const NFTGrid = ({ nfts, onBuy, onMakeOffer, currentAccount, loading }) => {
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
        />
      ))}
    </div>
  );
};

export default NFTGrid;
