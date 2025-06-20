import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';
import IPFSImage from '../../../ui/IPFSImage';
import useListNFT from '../../../../hooks/nfts/useListNFT';
import { getCSPCompliantImageURL, getOptimizedImageUrl } from '../../../../utils/blockchain/blockchainUtils';

// Agregar un simple sistema de caché para evitar llamadas repetidas
const nftCache = new Map();
// Caché para metadatos
const metadataCache = new Map();

// Ensure we have the contract address from environment variables or hardcoded fallback
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

// Debug log
console.log("TokenizationApp Contract Address:", CONTRACT_ADDRESS);

const NFTDetail = () => {
  const { tokenId } = useParams();
  const { account, walletConnected } = useContext(WalletContext);
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('collectible');
  const { listNFT, loading: listingLoading, error: listingError, success: listingSuccess, txHash } = useListNFT();
  const callCountRef = useRef(0);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!tokenId) return;
      
      // Avoid multiple simultaneous requests
      if (fetchingRef.current) {
        console.log("Fetch already in progress, avoiding duplicate call");
        return;
      }
      
      // Check cache
      const cacheKey = `nft-${tokenId}`;
      if (nftCache.has(cacheKey)) {
        console.log("Using cached data for NFT", tokenId);
        const cachedData = nftCache.get(cacheKey);
        setNft(cachedData.nft);
        setLikesCount(cachedData.likesCount);
        setHasLiked(cachedData.hasLiked);
        setLoading(false);
        return;
      }
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // Enhanced validation with logging
        // Removed prefetchNFTMetadata call as it's not defined

        console.log("Validating address:", CONTRACT_ADDRESS);
        console.log("Is valid address:", ethers.isAddress(CONTRACT_ADDRESS));

        // Correct hexadecimal format for Ethereum address
        const formattedAddress = CONTRACT_ADDRESS.trim().toLowerCase();
        
        if (!formattedAddress || !ethers.isAddress(formattedAddress)) {
          console.error("Validation failed for address:", formattedAddress);
          setError("Invalid or unconfigured contract address.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Validate tokenId
        if (isNaN(tokenId) || Number(tokenId) < 0) {
          setError("Invalid token ID.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        console.log("Attempting to connect with address:", formattedAddress);
        
        // Connect to provider with delay to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          formattedAddress,
          TokenizationAppABI.abi,
          provider
        );

        // Get token URI
        let tokenURI;
        try {
          tokenURI = await contract.tokenURI(tokenId);
          if (!tokenURI) throw new Error("Contract did not return a valid tokenURI.");
          console.log("Token URI obtained:", tokenURI);
        } catch (err) {
          console.error("Error getting tokenURI:", err);
          setError("NFT not found or contract did not return valid data.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Get metadata from IPFS
        const metadata = await fetchMetadata(tokenURI);
        console.log("Metadata:", metadata);
        
        // Get token details in marketplace
        let tokenDetails;
        try {
          tokenDetails = await contract.getListedToken(tokenId);
          console.log("Token details:", tokenDetails);
        } catch (err) {
          console.error("Error getting token details:", err);
          setError("Could not get token details from marketplace.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Get likes count and if current user has liked
        let likesCount = 0;
        let hasLiked = false;
        try {
          // First check if contract has these functions implemented
          if (typeof contract.getLikesCount === 'function') {
            likesCount = await contract.getLikesCount(tokenId);
            
            if (walletConnected && typeof contract.hasUserLiked === 'function') {
              hasLiked = await contract.hasUserLiked(tokenId, account);
            }
          } else {
            console.log("Contract does not implement getLikesCount function");
          }
        } catch (err) {
          console.warn("Error getting likes:", err);
          // If it fails, continue without likes and add necessary logs
          console.log("Continuing without likes information");
        }
        
        // Get original creator/owner address
        let owner = "";
        try {
          owner = await contract.ownerOf(tokenId);
          if (!owner || owner === ethers.ZeroAddress) {
            owner = "0x0000000000000000000000000000000000000000";
          }
        } catch (err) {
          console.warn("Error getting owner:", err);
          owner = "0x0000000000000000000000000000000000000000";
        }
        
        console.log("NFT data retrieved successfully");
        
        const nftData = {
          tokenId,
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || '',
          image: metadata?.image || '',
          attributes: metadata?.attributes || [],
          seller: tokenDetails[1],
          owner,
          price: tokenDetails[3].toString(),
          isForSale: tokenDetails[4],
          listedTimestamp: tokenDetails[5].toString(),
          category: tokenDetails[6]
        };
        
        // Save to cache
        nftCache.set(`nft-${tokenId}`, {
          nft: nftData,
          likesCount: likesCount.toString(),
          hasLiked
        });
        
        setNft(nftData);
        setLikesCount(likesCount.toString());
        setHasLiked(hasLiked);
      } catch (err) {
        console.error("Error fetching NFT details:", err);
        setError(err.message || "Error loading NFT details");
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    
    fetchNFTDetails();
    
    // Cleanup to avoid updates on unmounted components
    return () => {
      fetchingRef.current = true; // Prevents more calls during unmounting
    };
  }, [tokenId, account, walletConnected]);
  
  // Helper function to get metadata from IPFS with enhanced caching
  const fetchMetadata = async (uri) => {
    try {
      if (!uri) {
        return {
          name: `NFT #${tokenId}`,
          description: 'No description available',
          image: '/NFT-X1.webp',
          attributes: []
        };
      }
      
      // Use enhanced cache for metadata
      if (metadataCache.has(uri)) {
        console.log("Using cached metadata for URI:", uri);
        return metadataCache.get(uri);
      }

      const ipfsURL = getCSPCompliantImageURL(uri);
      const response = await fetch(ipfsURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const metadata = await response.json();

      metadataCache.set(uri, metadata);
      return metadata;
    } catch (error) {
      console.error("Error fetching metadata from IPFS:", error);
      return {
        name: `NFT #${tokenId}`,
        description: 'Error loading description.',
        image: '/NFT-X1.webp',
        attributes: []
      };
    }
  };

  const handleLike = async () => {
    if (!walletConnected) {
      setError("Please connect your wallet to like NFTs.");
      return;
    }
    
    if (hasLiked) {
      setError("You have already liked this NFT.");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TokenizationAppABI.abi,
        provider
      );
      
      // Send transaction to like the NFT
      const tx = await contract.likeNFT(tokenId);
      setLikesCount(prev => (parseInt(prev) + 1).toString());
      setHasLiked(true);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      console.log("NFT liked successfully:", txHash);
    } catch (err) {
      console.error("Error liking NFT:", err);
      setError("Failed to like NFT. Please try again later.");
    }
  };
  
  const handleCopy = () => {
    if (!nft) return;
    
    navigator.clipboard.writeText(`${window.location.origin}/nft/${nft.tokenId}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Error copying link:", err);
        setError("Failed to copy link. Please try again later.");
      });
  };
  
  const handleListNFT = async (e) => {
    e.preventDefault();
    
    if (!walletConnected) {
      setError("Please connect your wallet to list NFTs.");
      return;
    }
    
    try {
      const parsedPrice = ethers.parseEther(price);
      
      if (category === 'collectible') {
        await listNFT(tokenId, parsedPrice, 0, 0);
      } else {
        // For other categories, you might want to add specific logic
        await listNFT(tokenId, parsedPrice, 0, 0);
      }
    } catch (err) {
      console.error("Error listing NFT:", err);
      setError("Failed to list NFT. Please try again later.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen pb-10"
    >
      <SpaceBackground />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/nft-marketplace" className="text-white flex items-center mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Marketplace
        </Link>
        
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {nft && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                <IPFSImage
                  src={nft.image}
                  alt={nft.name}
                  className="rounded-lg w-full h-auto"
                  width={400}
                  height={400}
                />
              </div>
              
              <div className="flex-grow">
                <h1 className="text-3xl font-bold text-white mb-2">{nft.name}</h1>
                
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <span className="mr-2">{`#${nft.tokenId}`}</span>
                  <span className="mr-2"><FaEthereum className="inline mr-1" />{parseFloat(ethers.formatEther(nft.price)).toFixed(4)}</span>
                  <span className="mr-2"><FaClock className="inline mr-1" />{new Date(nft.listedTimestamp * 1000).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center mb-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 mr-2 ${
                      hasLiked ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                    disabled={listingLoading}
                  >
                    <FaHeart className="mr-2" />
                    {hasLiked ? 'Liked' : 'Like'}
                  </button>
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-lg transition-all duration-300"
                  >
                    <FaCopy className="mr-2" />
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </button>
                </div>
                
                <div className="text-gray-400 text-sm mb-4">
                  Owner:{" "}
                  <a
                    href={`https://etherscan.io/address/${nft.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline"
                  >
                    {nft.owner}
                  </a>
                </div>
                
                <div className="text-gray-400 text-sm mb-4">
                  Seller:{" "}
                  <a
                    href={`https://etherscan.io/address/${nft.seller}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline"
                  >
                    {nft.seller}
                  </a>
                </div>
                
                <div className="text-gray-400 text-sm mb-4">
                  Category:{" "}
                  <span className="text-white">{nft.category}</span>
                </div>
                
                <div className="text-gray-400 text-sm mb-4">
                  Description:{" "}
                  <p className="text-white">{nft.description || 'No description available'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NFTDetail;