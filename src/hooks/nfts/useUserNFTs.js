import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';
import { fetchNFTs, fetchTokenMetadata, ipfsToHttp } from '../../utils/blockchain/blockchainUtils';
import useProvider from '../blockchain/useProvider';

// Use the contract address from .env directly
const CONTRACT_ADDRESS = "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

// Usar LogoNuvos.webp como la imagen de placeholder
const DEFAULT_IMAGE = "/LogoNuvos.webp";

export default function useUserNFTs(address) {
  // Rename provider to avoid shadowing
  const { provider: ethProvider } = useProvider();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);

  // Función para refrescar los NFTs
  const refreshNFTs = useCallback(() => {
    setLastUpdated(Date.now());
  }, []);

  // Efecto principal optimizado - using enhanced fetchNFTs
  useEffect(() => {
    if (!address) return;
    
    const abortController = new AbortController();
    let isMounted = true;
    
    console.log("Fetching NFTs for address:", address);
    console.log("Using contract address:", CONTRACT_ADDRESS);

    const getAndProcessNFTs = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      setNfts([]); // Clear any existing NFTs to avoid duplicates
      
      try {
        // Try to use our enhanced fetchNFTs function first
        if (ethProvider) {
          try {
            console.log("Using enhanced fetchNFTs function with specific contract filtering");
            // Explicitly specify contract address to filter results
            const fetchedNfts = await fetchNFTs(address, ethProvider, {
              contractAddress: CONTRACT_ADDRESS,
              limit: 100,
              withMetadata: true
            });
            
            // Filter NFTs by contract to ensure we only get the ones from our Tokenization contract
            const filteredNfts = fetchedNfts.filter(nft => {
              // Convert addresses to lowercase for case-insensitive comparison
              const nftContract = nft.contract?.toLowerCase();
              const ourContract = CONTRACT_ADDRESS.toLowerCase();
              
              // Log for debugging
              if (nftContract) {
                console.log(`Comparing NFT contract: ${nftContract} with our contract: ${ourContract}`);
              }
              
              return nftContract === ourContract;
            });
            
            console.log(`Filtered NFTs from ${fetchedNfts.length} down to ${filteredNfts.length} for our contract`);
            
            // Make sure each NFT has a unique identifier to avoid duplicate key warnings
            const uniqueNfts = filteredNfts.map((nft, index) => {
              // Create a unique ID using contract address and token ID if available
              const uniqueId = `${nft.contract || CONTRACT_ADDRESS}-${nft.tokenId || `unknown-${index}`}`;
              return {
                ...nft,
                uniqueId,
                // Ensure every NFT has a tokenId
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
          } catch (enhancedError) {
            console.warn("Enhanced NFT fetch failed, falling back to contract:", enhancedError);
          }
        }
        
        // Fallback to direct contract method
        console.log("Using direct contract method to fetch NFTs");
        
        // Connect to provider without shadowing
        if (!window.ethereum) {
          throw new Error("No se encontró una wallet de Ethereum");
        }
        
        // Use browserProvider to avoid shadowing
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TokenizationAppABI.abi,
          browserProvider
        );
        
        // First check direct balance with the contract
        let tokenIds = [];
        try {
          // Check user's balance of NFTs from our contract
          const balance = await contract.balanceOf(address);
          console.log("User has", balance.toString(), "NFTs from our contract");
          
          if (balance && Number(balance) > 0) {
            // Get each tokenId the user owns
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
          
          // Try to also get tokens created by this user
          try {
            console.log("Checking for tokens created by user");
            if (contract.getTokensByCreator) {
              const createdTokens = await contract.getTokensByCreator(address);
              if (createdTokens && createdTokens.length) {
                // Merge with existing tokenIds, ensuring no duplicates
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
          // No tokens found
        }
        
        if (!isMounted) return;
        
        if (tokenIds.length === 0) {
          console.log("No tokens found from our contract for address:", address);
          setNfts([]);
          setLoading(false);
          return;
        }
        
        // Process tokens in batches with enhanced fetchTokenMetadata
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
              
              // Use enhanced fetchTokenMetadata
              const metadata = await fetchTokenMetadata(tokenURI);
              
              // Create a unique identifier for this NFT
              const uniqueId = `${CONTRACT_ADDRESS}-${tokenIdString}-${i}-${batchIndex}`;

              return {
                tokenId: tokenIdString,
                uniqueId, // Add a unique ID to avoid key warnings
                tokenURI,
                contract: CONTRACT_ADDRESS, // Explicitly set the contract address
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
              // Return null for failed tokens, and filter them out later
              return null;
            }
          });
          
          try {
            const batchResults = await Promise.all(batchPromises);
            // Filter out null results from failed tokens
            const validResults = batchResults.filter(Boolean);
            
            if (validResults.length > 0) {
              results.push(...validResults);
              
              // Incremental update for better UX
              if (isMounted) {
                setNfts(prev => {
                  // Use a Map to ensure uniqueness by tokenId
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
        
        // Final update with all unique NFTs
        if (isMounted) {
          // Use a Map to ensure uniqueness
          const uniqueNfts = Array.from(new Map(results.map(nft => [nft.uniqueId, nft])).values());
          console.log(`Final NFTs from contract: ${uniqueNfts.length}`);
          setNfts(uniqueNfts);
        }
      } catch (err) {
        console.error("Error fetching Tokenization NFTs:", err);
        if (isMounted) {
          let userFriendlyError = "Error al obtener tus NFTs";
          
          if (err.message.includes("BAD_DATA")) {
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
        }
      }
    };

    getAndProcessNFTs();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [address, lastUpdated, ethProvider]);

  return { nfts, loading, error, refreshNFTs };
}