import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaUser, FaWallet, FaExternalLinkAlt, FaCopy, FaCheckCircle, FaCoins, FaImage, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useStaking } from '../../../../context/StakingContext';
import { useTokenization } from '../../../../context/TokenizationContext';
import IPFSImage from '../../../ui/IPFSImage';
import { getOptimizedImageUrl } from '../../../../utils/blockchain/blockchainUtils';

// Move constants outside component to prevent recreation
const FALLBACK_IMAGES = [
  '/LogoNuvos.webp',
  '/NFT-X1.webp',
  '/NuvosToken.webp',
  '/placeholder-nft.webp'
];

// Extract NFTImage as a memoized component
const NFTImage = React.memo(({ src, alt, className }) => {
  return (
    <IPFSImage 
      src={getOptimizedImageUrl(src)} 
      alt={alt} 
      className={className}
      placeholderSrc={FALLBACK_IMAGES[0]}
      onLoad={() => console.log('Account overview NFT image loaded')}
      onError={() => console.warn('Account overview NFT image failed to load')}
      loading="lazy"
    />
  );
});

// NFT preview list component
const NFTPreviewList = React.memo(({ nfts = [], count = 0 }) => (
  <div className="flex flex-wrap gap-2 mt-3 mb-2">
    {nfts.slice(0, 3).map((nft, idx) => (
      <div key={idx} className="w-12 h-12 rounded-md overflow-hidden bg-purple-900/30">
        <NFTImage 
          src={nft.image} 
          alt={nft.name || `NFT #${nft.tokenId}`} 
          className="w-full h-full object-cover"
        />
      </div>
    ))}
    {count > 3 && (
      <div className="w-12 h-12 rounded-md bg-purple-900/30 flex items-center justify-center">
        <span className="text-xs text-purple-300">+{count - 3}</span>
      </div>
    )}
  </div>
));

const AccountOverview = ({ account, balance, network }) => {
  const [copied, setCopied] = useState(false);
  const { state } = useStaking();
  const { 
    nfts: userNfts, 
    nftsLoading, 
    updateUserAccount 
  } = useTokenization();
  
  // Cleanup for context update
  useEffect(() => {
    let isMounted = true;
    
    if (account && isMounted) {
      updateUserAccount(account);
    }
    
    return () => {
      isMounted = false;
    };
  }, [account, updateUserAccount]);
  
  // Memoize derived values
  const censoredAddress = useMemo(() => 
    account ? `${account.substring(0, 6)}...${account.substring(account.length - 6)}` : 'Not Connected',
  [account]);
  
  const actualNfts = useMemo(() => 
    userNfts?.filter(nft => !nft.error) || [],
  [userNfts]);
  
  const nftCount = useMemo(() => actualNfts.length, [actualNfts]);
  const userDeposits = useMemo(() => state?.userDeposits || [], [state?.userDeposits]);
  
  // Stable copy function
  const copyAddressToClipboard = useCallback(() => {
    if (navigator.clipboard && account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      const timerId = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timerId);
    }
  }, [account]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card  p-4 sm:p-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
        <FaUser className="text-purple-400" /> Account Overview
      </h2>

      {/* Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Wallet Address Card */}
        <div className="nuvos-card p-4 sm:p-5 ">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Wallet Address</h3>
          
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="bg-purple-900/30 p-2 sm:p-3 rounded-lg">
              <FaWallet className="text-purple-400 text-sm sm:text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs sm:text-sm text-gray-300 break-all">{censoredAddress}</div>
              <div className="text-xs text-gray-400 mt-1">{network} Network</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row mt-3 sm:mt-4 gap-2">
            <button
              onClick={copyAddressToClipboard}
              className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 py-2 px-3 rounded-lg transition-colors"
            >
              {copied ? <FaCheckCircle /> : <FaCopy />} 
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <a
              href={`https://polygonscan.com/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 py-2 px-3 rounded-lg transition-colors"
            >
              <FaExternalLinkAlt /> View on Explorer
            </a>
          </div>
        </div>
        
        {/* Account Stats */}
        <div className=" nuvos-card p-4 sm:p-5 ">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Account Stats</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className=" text-sm">MATIC Balance</span>
              <span className=" font-medium text-sm">{parseFloat(balance).toFixed(6)} MATIC</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className=" text-sm">Active Staking Deposits</span>
              <span className="text-sm">{userDeposits.length || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">NUVOS NFTs</span>
              <span className=" text-sm">
                {nftsLoading ? (
                  <span className="text-xs text-gray-400">Loading...</span>
                ) : (
                  <span className="text-gray-400 font-medium">{nftCount}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Staking Summary */}
        <div className="nuvos-card p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 flex items-center gap-2">
            <FaCoins className="text-purple-400" />
            Staking Summary
          </h3>
          
          {userDeposits && userDeposits.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                You have <span className="text-purple-400 font-medium">{userDeposits.length}</span> active staking deposits.
              </p>
              <Link 
                to="/staking"
                className="inline-block text-sm text-purple-400 hover:text-purple-300 underline mt-2"
              >
                View details in Smart Staking
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                You don't have any active staking positions.
              </p>
              <Link 
                to="/staking"
                className="inline-block px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm mt-2 w-full sm:w-auto text-center"
              >
                Start Staking Now
              </Link>
            </div>
          )}
        </div>
        
        {/* NFT Summary */}
        <div className="nuvos-card p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3 flex items-center gap-2">
            <FaImage className="text-purple-400" />
            NFT Collection
          </h3>
          
          {nftsLoading ? (
            <p className="text-sm text-gray-300">Loading your NFTs...</p>
          ) : actualNfts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                You have <span className="text-purple-400 font-medium">{nftCount}</span> NFTs in your wallet
              </p>
              
              <NFTPreviewList nfts={actualNfts} count={nftCount} />
              
              <Link 
                to="/nfts"
                className="inline-block text-sm text-purple-400 hover:text-purple-300 underline mt-2"
              >
                View your NFT collection
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                Your NUVOS NFT collection is empty.
              </p>
              <Link 
                to="/nfts"
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm mt-2 w-full sm:w-auto"
              >
                <FaShoppingCart /> Buy NFTs
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Compact User Guide */}
      
    </m.div>
  );
};

export default React.memo(AccountOverview);
           