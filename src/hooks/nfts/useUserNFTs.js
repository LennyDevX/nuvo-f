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
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Double-check contract address validity
        if (!ethers.isAddress(TOKENIZATION_ADDRESS)) {
          console.error("Invalid contract address format:", TOKENIZATION_ADDRESS);
          throw new Error(`Dirección de contrato inválida: ${TOKENIZATION_ADDRESS}`);
        }

        // Try to use our enhanced fetchNFTs function first
        if (ethProvider) {
          try {
            console.log("Using enhanced fetchNFTs function with contract:", TOKENIZATION_ADDRESS);
            
            // Set flag to indicate we're fetching NFTs
            const cacheKey = `nfts_${address}_${TOKENIZATION_ADDRESS}`;
            
            // Use configured options to reduce log fetching
            const fetchedNfts = await fetchNFTs(address, ethProvider, {
              contractAddress: TOKENIZATION_ADDRESS,
              limit: 100,
              withMetadata: true,
              skipLogs: !shouldFetchLogs(address) // Skip logs fetching if recently done
            });
            
            if (shouldFetchLogs(address)) {
              // Mark that we've fetched logs and cache the result
              logsInProgressRef.current = true;
              const logCacheKey = `logs_${address}_${TOKENIZATION_ADDRESS}`;
              logFetchCache.set(logCacheKey, {
                timestamp: Date.now(),
                // Could store actual log data here if needed
              });
            }
            
            // Rest of the function processing the NFTs
            const filteredNfts = fetchedNfts.filter(nft => {
              const nftContract = nft.contract?.toLowerCase();
              const ourContract = TOKENIZATION_ADDRESS.toLowerCase();
              if (nftContract) {
                console.log(`Comparing NFT contract: ${nftContract} with our contract: ${ourContract}`);
              }
              return nftContract === ourContract;
            });
            
            const uniqueNfts = filteredNfts.map((nft, index) => {
              const uniqueId = `${nft.contract || TOKENIZATION_ADDRESS}-${nft.tokenId || `unknown-${index}`}`;
              return {
                ...nft,
                uniqueId,
                tokenId: nft.tokenId || `unknown-${index}`
              };
            });
            
            if (uniqueNfts.length > 0) {
              console.log("Successfully filtered NFTs for our contract:", uniqueNfts.length);
              setNfts(uniqueNfts);
              setLoading(false);
              return;
            } else {
              console.log("No NFTs found for our contract using enhanced method, trying fallback");
            }
            
            // After we're done with logs processing
            logsInProgressRef.current = false;
          } catch (enhancedError) {
            console.warn("Enhanced NFT fetch failed, falling back to contract:", enhancedError);
            logsInProgressRef.current = false;
          }
        }

        // Fallback to direct contract method
        console.log("Using direct contract method to fetch NFTs from:", TOKENIZATION_ADDRESS);
        
        // Connect to provider without shadowing
        if (!window.ethereum) {
          throw new Error("No se encontró una wallet de Ethereum");
        }
        
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        
        try {
          const code = await browserProvider.getCode(TOKENIZATION_ADDRESS);
          if (code === '0x' || code === '') {
            console.error("Contract does not exist at address:", TOKENIZATION_ADDRESS);
            throw new Error(`No se encontró un contrato en la dirección: ${TOKENIZATION_ADDRESS}`);
          }
          console.log("Contract exists at address:", TOKENIZATION_ADDRESS);
        } catch (codeError) {
          console.error("Error checking contract code:", codeError);
          throw new Error("Error verificando la existencia del contrato");
        }
        
        const contract = new ethers.Contract(
          TOKENIZATION_ADDRESS,
          TokenizationAppABI.abi,
          browserProvider
        );
        
        let tokenIds = [];
        try {
          const balance = await contract.balanceOf(address);
          console.log("User has", balance.toString(), "NFTs from our contract");
          
          if (balance && Number(balance) > 0) {
            for (let i = 0; i < Number(balance); i++) {
              try {
                const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                console.log("Found token:", tokenId.toString());
                if (tokenId) tokenIds.push(tokenId);
              } catch (indexError) {
                console.warn("Could not get token by index:", indexError);
              }
            }
          }
          
          try {
            console.log("Checking for tokens created by user");
            if (contract.getTokensByCreator) {
              const createdTokens = await contract.getTokensByCreator(address);
              if (createdTokens && createdTokens.length) {
                const existingIds = new Set(tokenIds.map(id => id.toString()));
                createdTokens.forEach(token => {
                  if (!existingIds.has(token.toString())) {
                    tokenIds.push(token);
                  }
                });
                console.log("Added creator tokens, total tokens:", tokenIds.length);
              }
            }
          } catch (creatorError) {
            console.warn("Could not get creator tokens:", creatorError.message);
          }
        } catch (balanceError) {
          if (balanceError.message && balanceError.message.includes("BAD_DATA") && 
              balanceError.message.includes("resolver")) {
            console.warn("ENS resolution error - ignoring:", balanceError.message);
          } else {
            console.error("Error checking token balance:", balanceError);
          }
        }
        
        if (!isMounted) return;
        
        if (tokenIds.length === 0) {
          console.log("No tokens found from our contract for address:", address);
          setNfts([]);
          setLoading(false);
          return;
        }
        
        const BATCH_SIZE = 5;
        const results = [];
        
        for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
          if (!isMounted) break;
          
          const batch = tokenIds.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(async (tokenId, batchIndex) => {
            try {
              const tokenIdString = tokenId.toString();
              
              const [tokenURI, tokenData, likes, owner] = await Promise.all([
                contract.tokenURI(tokenId),
                contract.getListedToken(tokenId),
                contract.getLikesCount(tokenId),
                contract.ownerOf(tokenId)
              ]);
              
              const metadata = await fetchTokenMetadata(tokenURI);
              
              const uniqueId = `${TOKENIZATION_ADDRESS}-${tokenIdString}-${i}-${batchIndex}`;

              return {
                tokenId: tokenIdString,
                uniqueId,
                tokenURI,
                contract: TOKENIZATION_ADDRESS,
                name: metadata.name || `NFT #${tokenIdString}`,
                description: metadata.description || "Sin descripción",
                image: metadata.image ? ipfsToHttp(metadata.image) : DEFAULT_IMAGE,
                attributes: metadata.attributes || [],
                owner,
                creator: address,
                price: tokenData[3] ? tokenData[3] : ethers.parseEther("0"),
                isForSale: tokenData[4],
                likes: likes.toString(),
                category: tokenData[6] || "collectibles"
              };
            } catch (err) {
              console.error(`Error processing token ${tokenId}:`, err);
              return null;
            }
          });
          
          try {
            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter(Boolean);
            
            if (validResults.length > 0) {
              results.push(...validResults);
              
              if (isMounted) {
                setNfts(prev => {
                  const nftMap = new Map(prev.map(nft => [nft.uniqueId, nft]));
                  validResults.forEach(nft => nftMap.set(nft.uniqueId, nft));
                  return Array.from(nftMap.values());
                });
              }
            }
          } catch (batchError) {
            console.error("Error processing batch:", batchError);
          }
        }
        
        if (isMounted) {
          const uniqueNfts = Array.from(new Map(results.map(nft => [nft.uniqueId, nft])).values());
          console.log(`Final NFTs from contract: ${uniqueNfts.length}`);
          setNfts(uniqueNfts);
        }
      } catch (err) {
        console.error("Error fetching Tokenization NFTs:", err);
        if (isMounted) {
          let userFriendlyError = "Error al obtener tus NFTs";
          
          if (err.message.includes("inválida") || err.message.includes("Invalid")) {
            userFriendlyError = "Dirección de contrato inválida. Por favor verifica la configuración.";
          } else if (err.message.includes("No se encontró un contrato")) {
            userFriendlyError = "No se encontró un contrato en la dirección configurada.";
          } else if (err.message.includes("BAD_DATA")) {
            userFriendlyError = "No se pudieron decodificar los datos del contrato. Es posible que aún no tengas NFTs o que estés en la red incorrecta.";
          } else if (err.message.includes("network")) {
            userFriendlyError = "Error de conexión a la red blockchain. Por favor verifica tu conexión.";
          } else if (err.message.includes("user rejected")) {
            userFriendlyError = "Operación cancelada por el usuario.";
          }
          
          setError(userFriendlyError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchingRef.current = false;
          lastFetchTimeRef.current = Date.now();
        }
        logsInProgressRef.current = false;
      }
    };

    getAndProcessNFTs();

    return () => {
      isMounted = false;
      abortController.abort();
      // Don't reset fetchingRef here, as the cleanup might run during component re-renders
    };
  }, [address, lastUpdated, ethProvider, shouldFetchLogs]);

  return { nfts, loading, error, refreshNFTs };
}