import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';
import { fetchNFTs, fetchTokenMetadata, ipfsToHttp } from '../../utils/blockchain/blockchainUtils';
import useProvider from '../blockchain/useProvider';

// Cache time for log fetching to prevent excessive API calls
const LOG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const logFetchCache = new Map();

// Directly access the environment variable and log it for debugging
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;
console.log('Raw TOKENIZATION CONTRACT ADDRESS from env:', CONTRACT_ADDRESS);

// Make sure the address is valid by removing any surrounding whitespace
const cleanedAddress = CONTRACT_ADDRESS ? CONTRACT_ADDRESS.trim() : '';

// Validate the address format
const isValidAddress = ethers.isAddress(cleanedAddress);
console.log('Is tokenization address valid format?', isValidAddress);

// Use the valid address or fallback
const TOKENIZATION_ADDRESS = isValidAddress ? cleanedAddress : "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";
console.log('Final TOKENIZATION_ADDRESS being used:', TOKENIZATION_ADDRESS);

// Default image placeholder
const DEFAULT_IMAGE = "/LogoNuvos.webp";

export default function useUserNFTs(address) {
  // Rename provider to avoid shadowing
  const { provider: ethProvider } = useProvider();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  const fetchingRef = useRef(false); // To prevent concurrent fetches
  const logsInProgressRef = useRef(false); // Track if we're currently fetching logs
  const lastFetchTimeRef = useRef(0); // Track when we last did a full fetch

  // Function to refresh NFTs
  const refreshNFTs = useCallback(() => {
    // Only allow refreshes if enough time has passed since last fetch
    const now = Date.now();
    if (now - lastFetchTimeRef.current > 10000) { // 10 seconds minimum between forced refreshes
      lastFetchTimeRef.current = now;
      setLastUpdated(now);
    } else {
      console.log("Refresh request throttled - too frequent");
    }
  }, []);

  // Check if we should fetch logs based on cache
  const shouldFetchLogs = useCallback((userAddress) => {
    if (!userAddress) return false;
    
    // Check if we're already fetching logs
    if (logsInProgressRef.current) {
      console.log("Log fetching already in progress, skipping");
      return false;
    }
    
    const cacheKey = `logs_${userAddress}_${TOKENIZATION_ADDRESS}`;
    const cachedData = logFetchCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < LOG_CACHE_DURATION) {
      console.log("Using cached logs data");
      return false;
    }
    
    return true;
  }, []);

  // Main effect for fetching NFTs
  useEffect(() => {
    if (!address || !ethProvider) return;
    
    // Skip if we're already fetching
    if (fetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    const abortController = new AbortController();
    let isMounted = true;
    fetchingRef.current = true;
    
    console.log("Fetching NFTs for address:", address);
    console.log("Using tokenization contract address:", TOKENIZATION_ADDRESS);

    const getAndProcessNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Starting NFT fetch process...");

        // Double-check contract address validity
        if (!ethers.isAddress(TOKENIZATION_ADDRESS)) {
          console.error("Invalid contract address format:", TOKENIZATION_ADDRESS);
          throw new Error(`Dirección de contrato inválida: ${TOKENIZATION_ADDRESS}`);
        }

        const provider = ethProvider;
        const contract = new ethers.Contract(TOKENIZATION_ADDRESS, TokenizationAppABI.abi, provider);
        
        let allNFTs = [];
        
        // Method 1: Use getTokensByCreator function from the contract
        try {
          console.log("Trying getTokensByCreator method...");
          const tokenIds = await contract.getTokensByCreator(address);
          console.log("Tokens created by user:", tokenIds.length);
          
          for (const tokenId of tokenIds) {
            try {
              // Check if user still owns this token
              const owner = await contract.ownerOf(tokenId);
              if (owner.toLowerCase() !== address.toLowerCase()) {
                console.log(`User no longer owns token ${tokenId.toString()}`);
                continue;
              }
              
              console.log("Processing owned token:", tokenId.toString());
              
              const tokenURI = await contract.tokenURI(tokenId);
              
              // Get listing info
              let listingInfo = null;
              try {
                listingInfo = await contract.getListedToken(tokenId);
              } catch (e) {
                console.log(`No listing info for token ${tokenId}`);
              }
              
              const nftData = {
                tokenId: tokenId.toString(),
                uniqueId: `${TOKENIZATION_ADDRESS}-${tokenId.toString()}-${Date.now()}`,
                tokenURI,
                contract: TOKENIZATION_ADDRESS,
                name: `NFT #${tokenId.toString()}`,
                description: 'Loading...',
                image: '',
                isForSale: listingInfo ? listingInfo[4] : false,
                price: listingInfo ? listingInfo[3].toString() : '0',
                category: listingInfo ? listingInfo[6] : 'collectible',
                blockNumber: 0,
                transactionHash: ''
              };
              
              allNFTs.push(nftData);
            } catch (tokenError) {
              console.error(`Error processing token ${tokenId}:`, tokenError);
            }
          }
        } catch (creatorError) {
          console.log("getTokensByCreator failed, trying balance method:", creatorError);
          
          // Method 2: Try getting balance first, then use Transfer events
          try {
            const balance = await contract.balanceOf(address);
            console.log("User balance:", balance.toString());
            
            if (balance > 0) {
              // Since tokenOfOwnerByIndex doesn't exist, use Transfer events
              console.log("Using Transfer events method");
              
              // Get Transfer events to find user's NFTs
              const transferFilter = contract.filters.Transfer(null, address);
              const transferEvents = await contract.queryFilter(transferFilter, -50000);
              
              console.log("Found Transfer events to user:", transferEvents.length);
              
              for (const event of transferEvents) {
                try {
                  const tokenId = event.args.tokenId.toString();
                  
                  // Check if user still owns this token
                  const owner = await contract.ownerOf(tokenId);
                  if (owner.toLowerCase() !== address.toLowerCase()) {
                    console.log(`User no longer owns token ${tokenId}`);
                    continue;
                  }
                  
                  // Skip if we already have this token
                  if (allNFTs.some(nft => nft.tokenId === tokenId)) {
                    continue;
                  }
                  
                  const tokenURI = await contract.tokenURI(tokenId);
                  
                  // Get listing info
                  let listingInfo = null;
                  try {
                    listingInfo = await contract.getListedToken(tokenId);
                  } catch (e) {
                    console.log(`No listing info for token ${tokenId}`);
                  }
                  
                  const nftData = {
                    tokenId,
                    uniqueId: `${TOKENIZATION_ADDRESS}-${tokenId}-${event.blockNumber}-${event.transactionIndex}`,
                    tokenURI,
                    contract: TOKENIZATION_ADDRESS,
                    name: `NFT #${tokenId}`,
                    description: 'Loading...',
                    image: '',
                    isForSale: listingInfo ? listingInfo[4] : false,
                    price: listingInfo ? listingInfo[3].toString() : '0',
                    category: listingInfo ? listingInfo[6] : 'collectible',
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                  };
                  
                  allNFTs.push(nftData);
                } catch (tokenError) {
                  console.error(`Error processing token from transfer event:`, tokenError);
                }
              }
            }
          } catch (balanceError) {
            console.error("Error getting balance:", balanceError);
            
            // Method 3: Fallback - use TokenMinted events
            try {
              const filter = contract.filters.TokenMinted(null, address);
              const events = await contract.queryFilter(filter, -50000);
              
              console.log("Found TokenMinted events:", events.length);
              
              for (const event of events) {
                try {
                  const tokenId = event.args.tokenId.toString();
                  console.log("Processing minted token:", tokenId);
                  
                  // Check if user still owns this token
                  const owner = await contract.ownerOf(tokenId);
                  if (owner.toLowerCase() !== address.toLowerCase()) {
                    console.log(`User no longer owns token ${tokenId}`);
                    continue;
                  }
                  
                  const tokenURI = await contract.tokenURI(tokenId);
                  
                  // Get listing info
                  let listingInfo = null;
                  try {
                    listingInfo = await contract.getListedToken(tokenId);
                  } catch (e) {
                    console.log(`No listing info for token ${tokenId}`);
                  }
                  
                  const nftData = {
                    tokenId,
                    uniqueId: `${TOKENIZATION_ADDRESS}-${tokenId}-${event.blockNumber}-${event.transactionIndex}`,
                    tokenURI,
                    contract: TOKENIZATION_ADDRESS,
                    name: `NFT #${tokenId}`,
                    description: 'Loading...',
                    image: '',
                    isForSale: listingInfo ? listingInfo[4] : false,
                    price: listingInfo ? listingInfo[3].toString() : '0',
                    category: listingInfo ? listingInfo[6] : 'collectible',
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                  };
                  
                  allNFTs.push(nftData);
                } catch (tokenError) {
                  console.error(`Error processing token from event:`, tokenError);
                }
              }
            } catch (eventError) {
              console.error("Error fetching TokenMinted events:", eventError);
            }
          }
        }

        console.log(`Final NFTs found: ${allNFTs.length}`);

        // Process metadata for all NFTs
        if (allNFTs.length > 0) {
          const processedNFTs = await Promise.all(
            allNFTs.map(async (nft) => {
              try {
                let metadata = { name: nft.name, description: nft.description, image: nft.image };
                
                if (nft.tokenURI) {
                  const httpUrl = ipfsToHttp(nft.tokenURI);
                  const response = await fetch(httpUrl);
                  if (response.ok) {
                    metadata = await response.json();
                  }
                }
                
                return {
                  ...nft,
                  name: metadata.name || nft.name,
                  description: metadata.description || nft.description,
                  image: metadata.image ? ipfsToHttp(metadata.image) : nft.image || DEFAULT_IMAGE,
                  attributes: metadata.attributes || []
                };
              } catch (metadataError) {
                console.error(`Error fetching metadata for token ${nft.tokenId}:`, metadataError);
                return {
                  ...nft,
                  image: nft.image || DEFAULT_IMAGE
                };
              }
            })
          );
          
          setNfts(processedNFTs);
        } else {
          setNfts([]);
        }

      } catch (err) {
        console.error("Error in getAndProcessNFTs:", err);
        setError(err.message || 'Error fetching NFTs');
        setNfts([]);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    getAndProcessNFTs();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [address, lastUpdated, ethProvider, shouldFetchLogs]);

  return { nfts, loading, error, refreshNFTs };
}