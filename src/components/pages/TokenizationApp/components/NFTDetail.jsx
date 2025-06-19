import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingOverlay from '../../../ui/LoadingOverlay';
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
  
  // Helper function to get metadata from IPFS
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
      
      // Check global metadata cache
      if (metadataCache.has(uri)) {
        console.log("Using cached metadata for:", uri);
        return metadataCache.get(uri);
      }
      
      // Handle different URI formats
      let url = uri;
      
      // Normalize IPFS URIs
      if (uri.includes('ipfs')) {
        if (uri.startsWith('ipfs://')) {
          url = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        }
      }
      
      // Time control to avoid rate limiting errors
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Set timeout for request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error fetching metadata: ${response.statusText}`);
        }
        
        const metadata = await response.json();
        
        // Save to cache
        metadataCache.set(uri, metadata);
        
        return metadata;
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.error("Error in metadata fetch:", fetchErr);
        return {
          name: `NFT #${tokenId}`,
          description: 'Error loading metadata',
          image: '/NFT-X1.webp',
          attributes: []
        };
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return {
        name: `NFT #${tokenId}`,
        description: 'Error loading metadata',
        image: '/NFT-X1.webp',
        attributes: []
      };
    }
  };
  
  // Function to like/unlike an NFT
  const toggleLike = async () => {
    if (!walletConnected) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TokenizationAppABI.abi,
        signer
      );
      
      // Check if contract has the function implemented
      if (typeof contract.toggleLike !== 'function') {
        console.warn("The toggleLike function is not implemented in the contract");
        return;
      }
      
      const tx = await contract.toggleLike(tokenId, !hasLiked);
      await tx.wait();
      
      // Update local state
      setHasLiked(!hasLiked);
      setLikesCount(prev => !hasLiked ? String(Number(prev) + 1) : String(Math.max(0, Number(prev) - 1)));
    } catch (err) {
      console.error("Error liking/unliking:", err);
      // Don't show error in UI, just log to console
    }
  };
  
  // Function to buy an NFT
  const buyNFT = async () => {
    if (!walletConnected || !nft || !nft.isForSale) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TokenizationAppABI.abi,
        signer
      );
      
      const tx = await contract.buyToken(tokenId, {
        value: nft.price
      });
      
      await tx.wait();
      
      // Reload data after purchase
      window.location.reload();
    } catch (err) {
      console.error("Error buying NFT:", err);
    }
  };

  // Function to copy the URL to clipboard
  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  // Determine if NFT is listed
  const isListed = nft && nft.price && Number(nft.price) > 0;

  // Check if current user is the owner
  const isOwner = account && nft && account.toLowerCase() === nft.owner.toLowerCase();

  // Handler to list NFT
  const handleListNFT = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!nft?.tokenId) {
        throw new Error("Invalid token ID");
      }
      
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error("Price must be a positive number");
      }

      if (parseFloat(price) < 0.001) {
        throw new Error("Minimum price is 0.001 POL");
      }

      console.log('Attempting to list NFT:', {
        tokenId: nft.tokenId,
        price: price,
        category: category || 'collectibles'
      });

      await listNFT({
        tokenId: nft.tokenId,
        price: price.toString(),
        category: category || 'collectibles'
      });
      
      setShowListForm(false);
      setPrice('');
      setCategory('collectibles');
      
      // Reload NFT data after successful listing
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Error listing NFT:', err);
      // Error is handled by the hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
        <SpaceBackground />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center relative z-10">
          <LoadingOverlay text="Loading NFT details..." />
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
        <SpaceBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-md p-8 rounded-xl border border-red-500/20 text-center shadow-xl">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-300 mb-6">{error || "Could not load NFT"}</p>
            <Link to="/my-nfts" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium inline-flex items-center transition-all">
              <FaArrowLeft className="mr-2" /> Back to my collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formatear el precio
  const formattedPrice = nft.price ? ethers.formatEther(nft.price) : '0';
  
  // Formatear la fecha de listado
  const listedDate = nft.listedTimestamp && nft.listedTimestamp !== '0' 
    ? new Date(Number(nft.listedTimestamp) * 1000).toLocaleDateString() 
    : 'Not listed';

  return (
    <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
      <SpaceBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Navegación */}
          <div className="mb-6">
            <Link to="/my-nfts" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to my collection
            </Link>
          </div>
          
          {/* Contenido principal */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-purple-500/20 overflow-hidden shadow-2xl hover:shadow-purple-900/10 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Image Section - Left side, smaller */}
              <div className="w-80 flex-shrink-0">
                <div className="aspect-square bg-black/40 rounded-xl overflow-hidden shadow-lg border border-purple-500/10">
                  <IPFSImage 
                    src={getOptimizedImageUrl(nft.image)} 
                    alt={nft.name} 
                    className="w-full h-full object-cover"
                    placeholderSrc="/NFT-X1.webp"
                    onLoad={() => console.log(`NFT ${nft.tokenId} image loaded`)}
                    onError={() => console.warn(`NFT ${nft.tokenId} image failed to load`)}
                  />
                </div>
                
                {/* Acciones debajo de la imagen */}
                <div className="mt-4 flex justify-between">
                  <motion.button 
                    onClick={toggleLike}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      hasLiked 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70 border border-slate-600/30'
                    }`}
                  >
                    <FaHeart className={hasLiked ? "text-red-400" : ""} /> {likesCount}
                  </motion.button>
                  
                  <motion.button 
                    onClick={copyToClipboard}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70 border border-slate-600/30'
                    }`}
                  >
                    {copied ? <FaCheck className="text-green-400" /> : <FaShareAlt />} 
                    {copied ? 'Copied!' : 'Share'}
                  </motion.button>
                </div>
              </div>
              
              {/* Lado derecho - Información */}
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-purple-900/70 text-purple-200 text-xs rounded-full shadow-sm border border-purple-500/30">
                      {nft.category || 'Collectible'}
                    </span>
                    <span className="text-gray-400 text-sm bg-black/30 px-3 py-1 rounded-full">Token ID: {nft.tokenId}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">{nft.name}</h1>
                  <p className="text-gray-300 mb-6 leading-relaxed">{nft.description}</p>
                </div>
                
                <div className="space-y-4 mb-8 bg-black/20 p-4 rounded-xl border border-purple-500/10">
                  <div className="flex justify-between py-2 border-b border-purple-500/10">
                    <span className="text-gray-400 flex items-center"><FaUser className="mr-2 text-blue-400" /> Owner</span>
                    <span className="text-white font-mono bg-black/30 px-2 py-1 rounded-md">{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
                  </div>
                  
                  {nft.isForSale && (
                    <div className="flex justify-between py-2 border-b border-purple-500/10">
                      <span className="text-gray-400 flex items-center"><FaEthereum className="mr-2 text-purple-400" /> Price</span>
                      <span className="text-white flex items-center bg-green-900/30 px-2 py-1 rounded-md border border-green-500/20">
                        <FaEthereum className="mr-1 text-green-400" />
                        {formattedPrice} POL
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-b border-purple-500/10">
                    <span className="text-gray-400 flex items-center"><FaClock className="mr-2 text-blue-400" /> Listed date</span>
                    <span className="text-white flex items-center bg-black/30 px-2 py-1 rounded-md">
                      {listedDate}
                    </span>
                  </div>
                </div>
                
                {/* Atributos */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <span className="w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
                      Attributes
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                          <span className="text-purple-300 text-xs">{attr.trait_type}</span>
                          <div className="text-white font-medium">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Botones de acción */}
                <div className="space-y-3">
                  {/* Buy button - only for non-owners when NFT is for sale */}
                  {nft.isForSale && !isOwner && (
                    <motion.button 
                      onClick={buyNFT}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-nuvo-base bg-nuvo-gradient-button w-full py-4 rounded-lg text-white font-medium flex items-center justify-center shadow-lg"
                    >
                      <FaEthereum className="mr-2" /> Buy for {formattedPrice} POL
                    </motion.button>
                  )}

                  {/* Owner status button - only for owners */}
                  {isOwner && (
                    <div className="btn-nuvo-base btn-nuvo-success w-full py-4 rounded-lg text-white font-medium flex items-center justify-center shadow-lg cursor-default">
                      <FaCheck className="mr-2" /> You own this NFT
                    </div>
                  )}
                  
                  {/* List for sale button - only for owners when not listed */}
                  {isOwner && !nft.isForSale && (
                    <motion.button 
                      onClick={() => setShowListForm(true)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-medium flex items-center justify-center shadow-lg hover:shadow-green-500/20 transition-all"
                    >
                      <FaTags className="mr-2" /> List for sale
                    </motion.button>
                  )}
                  
                  {/* Not available button - for non-owners when not for sale */}
                  {!isOwner && !nft.isForSale && (
                    <button className="w-full py-4 bg-gray-700 rounded-lg text-white font-medium flex items-center justify-center opacity-70 cursor-not-allowed shadow-lg">
                      Not available for sale
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Form to list NFT */}
          {!isListed && isOwner && (
            <div className="mt-8 p-6 bg-black/30 rounded-xl border border-purple-500/20 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">List NFT for sale</h3>
              
              {showListForm ? (
                <form onSubmit={handleListNFT} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">
                      Price (POL):
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                      placeholder="e.g. 1.5"
                      className="w-full p-3 bg-black/40 rounded-lg border border-purple-500/20 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum price: 0.001 POL</p>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">
                      Category:
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full p-3 bg-black/40 rounded-lg border border-purple-500/20 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-white"
                    >
                      <option value="collectibles">Collectibles</option>
                      <option value="art">Art</option>
                      <option value="photography">Photography</option>
                      <option value="music">Music</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={listingLoading || !price}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold flex items-center justify-center transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listingLoading ? 'Listing...' : 'Confirm listing'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowListForm(false)}
                      className="flex-1 py-3 bg-gray-700 rounded-lg text-white font-medium flex items-center justify-center transition-all hover:shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
              
                  {listingError && (
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm">{listingError}</p>
                    </div>
                  )}
                  {listingSuccess && (
                    <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 text-sm">NFT listed successfully</p>
                    </div>
                  )}
                  {txHash && (
                    <div className="mt-2">
                      <a
                        href={`https://polygonscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline text-sm hover:text-blue-300"
                      >
                        View transaction on Polygonscan
                      </a>
                    </div>
                  )}
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-gray-300 text-sm">
                    This NFT is not listed for sale. You can list your NFT by setting a price and category.
                  </p>
                  <button
                    onClick={() => setShowListForm(true)}
                    className="py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold flex items-center justify-center transition-all hover:shadow-lg"
                  >
                    List NFT for sale
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Mensaje para no propietarios */}
          {!isListed && !isOwner && (
            <div className="mt-4 text-gray-400 text-sm">
              Only the owner can list this NFT.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NFTDetail;