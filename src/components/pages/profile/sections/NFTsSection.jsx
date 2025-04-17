import React, { useState, useMemo } from 'react';
import { motion as m } from 'framer-motion';
import { FaImage, FaExternalLinkAlt, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NFTsSection = ({ nfts = [], account }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  
  // Filter out placeholder images or representative NFTs
  const realNfts = useMemo(() => {
    return nfts.filter(nft => 
      nft?.tokenId && 
      !nft.isPlaceholder && 
      // Additional checks to ensure it's a real NFT
      nft.contractAddress && 
      !nft.isRepresentative
    );
  }, [nfts]);
  
  // If no real NFTs are found, show empty state
  if (!realNfts || realNfts.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "400px" }}
      >
        <div className="mb-6 p-3 bg-purple-900/30 rounded-full">
          <FaImage className="text-5xl text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">NFT Collection Empty</h3>
        <p className="text-gray-300 max-w-md mb-6">
          You don't have any NUVOS NFTs in your collection yet. Acquire your first NFT to represent digital ownership of assets.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/tokenize"
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white flex items-center justify-center gap-2"
          >
            <FaImage className="text-sm" /> Tokenize an Asset
          </Link>
          <Link
            to="/nfts"
            className="px-5 py-2 bg-purple-600/50 hover:bg-purple-600/70 rounded-lg text-white flex items-center justify-center gap-2"
          >
            <FaShoppingCart className="text-sm" /> Explore NFT Collection
          </Link>
        </div>
      </m.div>
    );
  }
  
  // Display real NFTs
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaImage className="text-purple-400" /> Your NFTs
        </h2>
        <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
          {realNfts.length} {realNfts.length === 1 ? 'NFT' : 'NFTs'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {realNfts.map((nft, index) => (
          <m.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedNFT(nft)}
          >
            <div className="aspect-square relative">
              <img 
                src={nft.image} 
                alt={nft.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium mb-1">{nft.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{nft.description}</p>
            </div>
          </m.div>
        ))}
      </div>
      
      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-purple-500/20">
              <h3 className="text-xl font-bold text-white">{selectedNFT.name}</h3>
              <button 
                onClick={() => setSelectedNFT(null)} 
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-square rounded-xl overflow-hidden">
                  <img 
                    src={selectedNFT.image} 
                    alt={selectedNFT.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <p className="text-gray-300 mb-4">{selectedNFT.description}</p>
                  
                  <h4 className="text-white font-medium mb-2">Attributes</h4>
                  <div className="space-y-2 mb-6">
                    {selectedNFT.attributes?.map((attr, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-400">{attr.trait_type}</span>
                        <span className="text-purple-300">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <a
                    href={`https://opensea.io/assets/matic/${selectedNFT.contractAddress || '0x000'}/${selectedNFT.tokenId || selectedNFT.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                  >
                    <FaExternalLinkAlt /> View on Marketplace
                  </a>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </m.div>
  );
};

export default NFTsSection;
