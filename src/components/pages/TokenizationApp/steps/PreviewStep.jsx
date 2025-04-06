import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaCoins, FaSpinner } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';
import { WalletContext } from '../../../../context/WalletContext';

const PreviewStep = () => {
  const { account, walletConnected } = useContext(WalletContext);
  const {
    image,
    metadata,
    setCurrentStep,
    isMinting,
    setIsMinting,
    mintingError,
    setMintingError,
    setMintedNFT
  } = useTokenization();

  // NFT Minting logic
  const mintNFT = async () => {
    if (!walletConnected) {
      return alert('Please connect your wallet first');
    }
    
    setIsMinting(true);
    setMintingError(null);
    
    try {
      // This would connect to your actual NFT minting contract
      // For demonstration, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock response
      setMintedNFT({
        tokenId: Math.floor(Math.random() * 1000000) + 1,
        transactionHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        imageUrl: image
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintingError('Failed to mint NFT: ' + (error.message || 'Unknown error'));
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white">Review & Mint</h2>
      <p className="text-gray-300">Confirm your asset details before creating the NFT</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="aspect-square bg-black/20 rounded-xl overflow-hidden">
            {image && (
              <img 
                src={image} 
                alt="Asset Preview" 
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-300">
              This image will be permanently stored on IPFS and linked to your NFT.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-4">
              {metadata.name}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Description:</span>
                <p className="text-white">{metadata.description}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Category:</span>
                <p className="text-white capitalize">{metadata.category}</p>
              </div>
              {metadata.physicalLocation && (
                <div>
                  <span className="text-gray-400 text-sm">Physical Location:</span>
                  <p className="text-white">{metadata.physicalLocation}</p>
                </div>
              )}
              <div>
                <span className="text-gray-400 text-sm">Owner:</span>
                <p className="text-white font-mono text-sm">
                  {account ? 
                    `${account.slice(0, 6)}...${account.slice(-4)}` : 
                    'Connect wallet'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-300">
              By minting this NFT, you're creating a digital representation of your physical asset that can be traded and verified on the blockchain.
            </p>
          </div>
          
          <div className="pt-4 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center gap-2"
              onClick={() => setCurrentStep('metadata')}
            >
              <FaEdit /> Edit Details
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex-1 flex items-center justify-center gap-2"
              onClick={mintNFT}
              disabled={isMinting || !walletConnected}
            >
              {isMinting ? (
                <>
                  <FaSpinner className="animate-spin" /> Minting...
                </>
              ) : (
                <>
                  <FaCoins /> Mint NFT
                </>
              )}
            </motion.button>
          </div>
          
          {mintingError && (
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-red-400">
              {mintingError}
            </div>
          )}
          
          {!walletConnected && (
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-yellow-400">
              Please connect your wallet to mint this NFT
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewStep;
