import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import MarketplaceABI from '../../Abi/Marketplace.json';
import { fetchNFTs, fetchTokenMetadata, ipfsToHttp } from '../../utils/blockchain/blockchainUtils';
import useProvider from '../blockchain/useProvider';
import { nftCollectionCache } from '../../utils/cache/NFTCollectionCache';



const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS_V2;
console.log('Raw TOKENIZATION CONTRACT ADDRESS from env:', CONTRACT_ADDRESS);

// Make sure the address is valid by removing any surrounding whitespace
const cleanedAddress = CONTRACT_ADDRESS ? CONTRACT_ADDRESS.trim() : '';

// Validate the address format
const isValidAddress = ethers.isAddress(cleanedAddress);
console.log('Is tokenization address valid format?', isValidAddress);

// Use the valid address or fallback to V2 address
const TOKENIZATION_ADDRESS = isValidAddress ? cleanedAddress : "0xe8f1A205ACf4dBbb08d6d8856ae76212B9AE7582";
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
  const [cacheStatus, setCacheStatus] = useState(null);
  const fetchingRef = useRef(false); // To prevent concurrent fetches
  const logsInProgressRef = useRef(false); // Track if we're currently fetching logs
  const lastFetchTimeRef = useRef(0); // Track when we last did a full fetch

  // Enhanced cache checking using NFTCollectionCache
  const shouldFetchUserNFTs = useCallback((userAddress) => {
    if (!userAddress) return false;
    
    if (fetchingRef.current) {
      console.log("User NFT fetch already in progress, skipping");
      return false;
    }
    
    const cachedData = nftCollectionCache.getUserNFTs(userAddress, TOKENIZATION_ADDRESS);
    const cacheStatus = nftCollectionCache.getUserCacheStatus(userAddress, TOKENIZATION_ADDRESS);
    
    if (cachedData && cacheStatus && !cacheStatus.expired) {
      console.log("Using cached user NFTs data");
      setNfts(cachedData);
      setLoading(false);
      setCacheStatus(`cached ${cacheStatus.age}s ago`);
      return false;
    }
    
    return true;
  }, []);

  // Function to refresh NFTs with cache invalidation
  const refreshNFTs = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current > 5000) {
      // Clear user NFT cache using new system
      nftCollectionCache.invalidateUserData(address, TOKENIZATION_ADDRESS);
      setCacheStatus(null);
      lastFetchTimeRef.current = now;
      setLastUpdated(now);
    } else {
      console.log("Refresh request throttled - too frequent");
    }
  }, [address]);

  // Enhanced metadata fetching using shared cache
  const fetchMetadataWithCache = useCallback(async (tokenURI) => {
    if (!tokenURI) {
      return {
        name: "Unknown NFT",
        description: "Sin descripción",
        image: DEFAULT_IMAGE,
        attributes: []
      };
    }

    // Use NFTCollectionCache for metadata
    const cachedMetadata = nftCollectionCache.getTokenMetadata(tokenURI);
    if (cachedMetadata) {
      return cachedMetadata;
    }

    // Fetch and cache metadata
    const metadata = await fetchTokenMetadata(tokenURI);
    nftCollectionCache.setTokenMetadata(tokenURI, metadata);
    return metadata;
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
    
    // Check if we should fetch based on cache
    if (!shouldFetchUserNFTs(address)) {
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
        setCacheStatus(null);
        
        // Double-check contract address validity
        if (!ethers.isAddress(TOKENIZATION_ADDRESS)) {
          console.error("Invalid contract address format:", TOKENIZATION_ADDRESS);
          throw new Error(`Dirección de contrato inválida: ${TOKENIZATION_ADDRESS}`);
        }

        // Try to use our enhanced fetchNFTs function first
        if (ethProvider) {
          try {
            console.log("Using enhanced fetchNFTs function with cache optimization");
            
            const fetchedNfts = await fetchNFTs(address, ethProvider, {
              contractAddress: TOKENIZATION_ADDRESS,
              limit: 100,
              withMetadata: true,
              skipLogs: true
            });
            
            const filteredNfts = fetchedNfts.filter(nft => {
              const nftContract = nft.contract?.toLowerCase();
              const ourContract = TOKENIZATION_ADDRESS.toLowerCase();
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
              console.log("Successfully loaded user NFTs from enhanced method:", uniqueNfts.length);
              
              // Cache the results using NFTCollectionCache
              nftCollectionCache.setUserNFTs(address, TOKENIZATION_ADDRESS, uniqueNfts);
              setCacheStatus('fresh data');
              
              setNfts(uniqueNfts);
              setLoading(false);
              return;
            }
          } catch (enhancedError) {
            console.warn("Enhanced NFT fetch failed, falling back to contract:", enhancedError);
          }
        }

        // Fallback to direct contract method with optimization
        console.log("Using optimized direct contract method");
        
        if (!ethProvider) {
          throw new Error("No se encontró un proveedor de Ethereum inicializado");
        }
        
        try {
          const code = await ethProvider.getCode(TOKENIZATION_ADDRESS);
          if (code === '0x' || code === '') {
            console.error("Contract does not exist at address:", TOKENIZATION_ADDRESS);
            throw new Error(`No se encontró un contrato en la dirección: ${TOKENIZATION_ADDRESS}`);
          }
          console.log("Contract exists at address:", TOKENIZATION_ADDRESS);
        } catch (codeError) {
          console.error("Error checking contract code:", codeError);
          throw new Error("Error verificando la existencia del contrato");
        }
        
        // Verify contract address before creating contract instance
        if (!TOKENIZATION_ADDRESS || !ethers.isAddress(TOKENIZATION_ADDRESS)) {
          console.error('Invalid TOKENIZATION_ADDRESS in useUserNFTs:', TOKENIZATION_ADDRESS);
          throw new Error(`Dirección de contrato inválida: ${TOKENIZATION_ADDRESS}`);
        }
        
        if (!MarketplaceABI || !MarketplaceABI.abi) {
          console.error('MarketplaceABI is missing or invalid');
          throw new Error('ABI del contrato no disponible');
        }
        
        console.log('🔧 [useUserNFTs] Creating contract with:', {
          address: TOKENIZATION_ADDRESS,
          abiLength: MarketplaceABI.abi.length,
          providerType: ethProvider?.constructor?.name,
          providerReady: ethProvider?._isProvider,
          providerExists: !!ethProvider
        });
        
        // Additional validation before contract creation
        if (!ethProvider) {
          console.error('❌ [useUserNFTs] ethProvider is null or undefined');
          throw new Error('Provider no disponible');
        }
        
        if (!ethProvider._isProvider && !ethProvider.provider) {
          console.error('❌ [useUserNFTs] Provider is not properly initialized');
          throw new Error('Provider no está inicializado correctamente');
        }
        
        const contract = new ethers.Contract(
          TOKENIZATION_ADDRESS,
          MarketplaceABI.abi,
          ethProvider
        );
        
        console.log('✅ [useUserNFTs] Contract created successfully:', !!contract);
        console.log('✅ [useUserNFTs] Contract target:', contract.target);
        
        let tokenIds = [];
        try {
          const balance = await contract.balanceOf(address);
          console.log("User has", balance.toString(), "NFTs from our contract");
          
          if (balance && Number(balance) > 0) {
            // Use direct token access if available instead of iteration
            if (contract.tokensOfOwner) {
              try {
                const tokens = await contract.tokensOfOwner(address);
                tokenIds = tokens.map(token => token);
                console.log("Got tokens using tokensOfOwner:", tokenIds.length);
              } catch (e) {
                console.log("tokensOfOwner not available, using iteration");
                // Fallback to iteration
                for (let i = 0; i < Number(balance); i++) {
                  try {
                    const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                    if (tokenId) tokenIds.push(tokenId);
                  } catch (indexError) {
                    console.warn("Could not get token by index:", indexError);
                  }
                }
              }
            }
          }
          
          // Add creator tokens more efficiently
          try {
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
          console.error("Error checking token balance:", balanceError);
        }
        
        if (!isMounted) return;
        
        if (tokenIds.length === 0) {
          console.log("No tokens found for user");
          // Cambia userNFTCache por nftCollectionCache
          nftCollectionCache.setUserNFTs(address, TOKENIZATION_ADDRESS, []);
          setNfts([]);
          setLoading(false);
          return;
        }
        
        // Process tokens in optimized batches
        const BATCH_SIZE = 8; // Reduced batch size for better responsiveness
        const results = [];
        
        for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
          if (!isMounted) break;
          
          const batch = tokenIds.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(async (tokenId, batchIndex) => {
            try {
              const tokenIdString = tokenId.toString();
              
              const [tokenURI, tokenData, likes, owner] = await Promise.allSettled([
                contract.tokenURI(tokenId),
                contract.getListedToken(tokenId).catch(() => null),
                contract.getLikesCount(tokenId).catch(() => 0),
                contract.ownerOf(tokenId)
              ]);
              
              const metadata = await fetchMetadataWithCache(
                tokenURI.status === 'fulfilled' ? tokenURI.value : null
              );
              
              const uniqueId = `${TOKENIZATION_ADDRESS}-${tokenIdString}-${i}-${batchIndex}`;

              return {
                tokenId: tokenIdString,
                uniqueId,
                tokenURI: tokenURI.status === 'fulfilled' ? tokenURI.value : null,
                contract: TOKENIZATION_ADDRESS,
                name: metadata.name || `NFT #${tokenIdString}`,
                description: metadata.description || "Sin descripción",
                image: metadata.image ? ipfsToHttp(metadata.image) : DEFAULT_IMAGE,
                attributes: metadata.attributes || [],
                owner: owner.status === 'fulfilled' ? owner.value : address,
                creator: address,
                price: tokenData.status === 'fulfilled' && tokenData.value ? tokenData.value[3] : ethers.parseEther("0"),
                isForSale: tokenData.status === 'fulfilled' && tokenData.value ? tokenData.value[4] : false,
                likes: likes.status === 'fulfilled' ? likes.value.toString() : "0",
                category: tokenData.status === 'fulfilled' && tokenData.value ? tokenData.value[6] || "collectibles" : "collectibles"
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
              
              // Update UI progressively for better UX
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
          console.log(`Final user NFTs: ${uniqueNfts.length}`);
          
          // Cache the final results using NFTCollectionCache
          nftCollectionCache.setUserNFTs(address, TOKENIZATION_ADDRESS, uniqueNfts);
          setCacheStatus('fresh data');
          
          setNfts(uniqueNfts);
        }
      } catch (err) {
        console.error("Error fetching User NFTs:", err);
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
      }
    };

    getAndProcessNFTs();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [address, lastUpdated, ethProvider, shouldFetchUserNFTs, fetchMetadataWithCache]);

  return { nfts, loading, error, refreshNFTs, cacheStatus };
}