import React from 'react';
import NFTCard from './NFTCard';

const NFTGrid = ({ nfts, onBuy, onMakeOffer, currentAccount }) => {
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
