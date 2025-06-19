import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaCoins, FaSpinner, FaShieldAlt } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';
import { WalletContext } from '../../../../context/WalletContext';
import TransactionToast from '../../../ui/TransactionToast';

const PreviewStep = () => {
  const { account, walletConnected } = useContext(WalletContext);
  const {
    image,
    imageFile,
    metadata,
    setCurrentStep,
    isMinting,
    setIsMinting,
    mintingError,
    setMintingError,
    setMintedNFT,
    mintNFT: mintNFTReal,
    mintLoading: loading,
    mintError: error,
    mintTxHash: txHash,
    updateUserAccount
  } = useTokenization();
  
  // Update TokenizationContext with current user account
  useEffect(() => {
    if (account) {
      updateUserAccount(account);
    }
  }, [account, updateUserAccount]);
  
  // Transaction status state for internal tracking
  const [txStatus, setTxStatus] = useState(null);
  
  // Toast state for UI notification
  const [toastInfo, setToastInfo] = useState({
    show: false,
    type: 'info',
    message: '',
    details: '',
    hash: ''
  });

  // Simple error parsing function
  const parseError = (error) => {
    if (!error) return { status: 'error', message: 'Unknown error' };
    
    const errorString = String(error);
    
    // Check for user rejection
    if (errorString.includes('user rejected') || errorString.includes('User denied')) {
      return { 
        status: 'rejected', 
        message: 'Transaction rejected: You declined the request in your wallet.'
      };
    }
    
    // Check for insufficient funds
    if (errorString.includes('insufficient funds')) {
      return { 
        status: 'error', 
        message: 'Insufficient funds: Not enough MATIC to complete this transaction.'
      };
    }
    
    // Default error case
    return { 
      status: 'error', 
      message: 'Error processing transaction. Please try again.'
    };
  };

  // Show transaction toast with appropriate information
  const showTransactionToast = (type, message, details, hash = null) => {
    setToastInfo({
      show: true,
      type,
      message,
      details,
      hash
    });
    
    // Auto-hide success toast after transaction completion
    if (type === 'success') {
      setTimeout(() => {
        setToastInfo(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  // NFT Minting logic
  const mintNFT = async () => {
    if (!walletConnected) {
      return alert('Please connect your wallet first');
    }
    
    if (!imageFile) {
      setMintingError('Image file is missing. Please retake or reupload the image.');
      return;
    }
    
    setIsMinting(true);
    setMintingError(null);
    setTxStatus('pending');
    
    // Show pending transaction toast
    showTransactionToast(
      'loading', 
      'Processing Transaction', 
      'Please confirm the transaction in your wallet...'
    );
    
    try {
      const royalty = 250; // 2.5% default
      const result = await mintNFTReal({
        file: imageFile,
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        royalty
      });
      
      if (!result) throw new Error('Minting failed');
      
      setTxStatus('success');
      setMintedNFT({
        tokenId: result.tokenId || null,
        transactionHash: result.txHash,
        imageUrl: result.imageUrl,
        metadataUrl: result.metadataUrl
      });
      
      // Show success transaction toast
      showTransactionToast(
        'success', 
        'NFT Successfully Minted', 
        `Your asset "${metadata.name}" has been tokenized as NFT #${result.tokenId || 'N/A'}`,
        result.txHash
      );
      
      // Wait a moment to show success state before moving to success screen
      setTimeout(() => {
        setCurrentStep('success');
      }, 2000);
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      const parsedError = parseError(error);
      
      setTxStatus(parsedError.status);
      setMintingError(parsedError.message);
      
      // Show error or rejected transaction toast
      showTransactionToast(
        parsedError.status === 'rejected' ? 'info' : 'error',
        parsedError.status === 'rejected' ? 'Transaction Cancelled' : 'Transaction Failed',
        parsedError.status === 'rejected' ? 
          'Transaction rejected. No gas fees were charged.' : 
          parsedError.message
      );
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-nuvo-gradient-text bg-clip-text text-transparent mb-2">Review & Mint</h2>
        <p className="text-sm sm:text-base text-gray-300">Confirm your asset details before creating the NFT</p>
      </div>
      
      {/* Mobile-first layout: details first on mobile, image below */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Details section - first on mobile for accessibility */}
        <div className="space-y-3 sm:space-y-4 order-1 lg:order-2">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              {metadata.name}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <span className="text-gray-400 text-xs sm:text-sm">Description:</span>
                <p className="text-white text-sm sm:text-base">{metadata.description}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs sm:text-sm">Category:</span>
                <p className="text-white text-sm sm:text-base capitalize">{metadata.category}</p>
              </div>
              {metadata.physicalLocation && (
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm">Physical Location:</span>
                  <p className="text-white text-sm sm:text-base">{metadata.physicalLocation}</p>
                </div>
              )}
              <div>
                <span className="text-gray-400 text-xs sm:text-sm">Owner:</span>
                <p className="text-white font-mono text-xs sm:text-sm">
                  {account ? 
                    `${account.slice(0, 6)}...${account.slice(-4)}` : 
                    'Connect wallet'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <p className="text-xs sm:text-sm text-purple-300">
              By minting this NFT, you're creating a digital representation of your asset that can be traded and verified on the blockchain.
            </p>
          </div>
          
          {/* Responsive buttons */}
          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center justify-center gap-2 touch-manipulation"
              onClick={() => setCurrentStep('metadata')}
              disabled={isMinting}
            >
              <FaEdit /> Edit Details
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg touch-manipulation"
              onClick={mintNFT}
              disabled={isMinting || !walletConnected || txStatus === 'success'}
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
          
          {!walletConnected && (
            <div className="p-3 sm:p-4 bg-yellow-500/10 backdrop-blur-sm rounded-lg border border-yellow-500/30 text-yellow-400 text-xs sm:text-sm">
              Please connect your wallet to mint this NFT
            </div>
          )}
        </div>
        
        {/* Image section - moved below details on mobile, ajustar altura */}
        <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
          <div className="aspect-square bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-lg max-w-xs mx-auto lg:max-w-none lg:mx-0">
            {image && (
              <img 
                src={image} 
                alt="Asset Preview" 
                className="w-full h-full object-contain p-2"
                style={{ maxHeight: '100%' }}
              />
            )}
          </div>
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <p className="text-xs sm:text-sm text-purple-300 flex items-start">
              <FaShieldAlt className="mr-2 mt-0.5 flex-shrink-0" />
              <span>This image will be permanently stored on IPFS and linked to your NFT on the blockchain.</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Transaction Toast - Improved positioning */}
      {toastInfo.show && (
        <TransactionToast
          id="mint-transaction"
          type={toastInfo.type}
          message={toastInfo.message}
          details={toastInfo.details}
          hash={toastInfo.hash}
          duration={toastInfo.type === 'loading' ? 0 : 8000}
          onDismiss={() => setToastInfo(prev => ({ ...prev, show: false }))}
        />
      )}
    </motion.div>
  );
};

export default PreviewStep;