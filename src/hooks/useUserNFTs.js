import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../Abi/TokenizationApp.json';

// Definir una constante para la dirección del contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x71f3d55856e4058ed06ee057d79ada615f65cdf5";

// Usar LogoNuvos.webp como la imagen de placeholder
const DEFAULT_IMAGE = "/LogoNuvos.webp";

// Crear un cache simple para metadatos
const metadataCache = new Map();

export default function useUserNFTs(address) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(0);

  // Función optimizada para obtener metadatos con cache
  const fetchMetadata = useCallback(async (tokenURI, tokenId) => {
    const cacheKey = `${tokenURI}-${tokenId}`;
    
    // Comprobar si hay datos en caché
    if (metadataCache.has(cacheKey)) {
      return metadataCache.get(cacheKey);
    }
    
    // Metadatos predeterminados
    let metadata = {
      name: `NFT #${tokenId}`,
      description: "Sin descripción",
      image: DEFAULT_IMAGE,
      attributes: []
    };

    try {
      if (!tokenURI) return metadata;
      
      if (tokenURI.startsWith('data:application/json;base64,')) {
        // Decodificar data URI base64
        const base64Data = tokenURI.split(',')[1];
        const jsonString = atob(base64Data);
        metadata = { ...metadata, ...JSON.parse(jsonString) };
      } else if (tokenURI.startsWith('data:,' )) {
        // Formato simple data URI (no base64)
        const dataJson = decodeURIComponent(tokenURI.substring(6));
        try {
          const parsedData = JSON.parse(dataJson);
          metadata = { ...metadata, ...parsedData };
          
          // Manejar casos especiales
          if (!metadata.image && parsedData.image_url) {
            metadata.image = parsedData.image_url;
          }
        } catch (e) {
          console.error(`Error parsing data URI JSON for ${tokenId}:`, e);
        }
      } else if (tokenURI.startsWith('ipfs://')) {
        // Convertir IPFS URI a HTTP gateway
        const ipfsGateway = 'https://ipfs.io/ipfs/';
        const ipfsHash = tokenURI.replace('ipfs://', '');
        const url = `${ipfsGateway}${ipfsHash}`;
        
        // Usar AbortController para establecer un timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(url, { 
            signal: controller.signal,
            cache: 'force-cache' 
          });
          const data = await response.json();
          metadata = { ...metadata, ...data };
          clearTimeout(timeoutId);
        } catch (err) {
          clearTimeout(timeoutId);
          console.warn(`Timeout or error fetching IPFS metadata for ${tokenId}`);
        }
      } else if (tokenURI.startsWith('http')) {
        // URL HTTP estándar con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(tokenURI, { 
            signal: controller.signal,
            cache: 'force-cache'
          });
          const data = await response.json();
          metadata = { ...metadata, ...data };
          clearTimeout(timeoutId);
        } catch (err) {
          clearTimeout(timeoutId);
          console.warn(`Timeout or error fetching HTTP metadata for ${tokenId}`);
        }
      }

      // Corregir la URL de la imagen si es IPFS
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        const ipfsGateway = 'https://ipfs.io/ipfs/';
        const ipfsHash = metadata.image.replace('ipfs://', '');
        metadata.image = `${ipfsGateway}${ipfsHash}`;
      }
      
      // Guardar en caché
      metadataCache.set(cacheKey, metadata);
      return metadata;
    } catch (error) {
      console.error(`Error processing metadata for ${tokenId}:`, error);
      return metadata;
    }
  }, []);

  // Función para refrescar los NFTs
  const refreshNFTs = useCallback(() => {
    setLastUpdated(Date.now());
  }, []);

  // Función optimizada para procesar un token individual
  const processToken = useCallback(async (tokenId, contract, address) => {
    try {
      const tokenIdString = tokenId.toString();
      
      // Usar Promise.all para paralelizar solicitudes
      const [tokenURI, tokenData, likes, owner] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.getListedToken(tokenId),
        contract.getLikesCount(tokenId),
        contract.ownerOf(tokenId)
      ]);
      
      // Obtener metadatos con caché
      const metadata = await fetchMetadata(tokenURI, tokenIdString);

      // Construir el objeto NFT
      return {
        tokenId: tokenIdString,
        tokenURI,
        name: metadata.name || `NFT #${tokenIdString}`,
        description: metadata.description || "Sin descripción",
        image: metadata.image || DEFAULT_IMAGE,
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
      return {
        tokenId: tokenId.toString(),
        error: true,
        errorMessage: err.message,
        image: DEFAULT_IMAGE,
        name: `NFT #${tokenId.toString()}`
      };
    }
  }, [fetchMetadata]);

  // Efecto principal optimizado
  useEffect(() => {
    if (!address) return;
    
    const abortController = new AbortController();
    let isMounted = true;

    const fetchUserNFTs = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      setNfts([]); // Reset NFTs before fetching

      try {
        // Conectar al provider con timeout
        if (!window.ethereum) {
          throw new Error("No se encontró una wallet de Ethereum");
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TokenizationAppABI.abi,
          provider
        );

        // Obtener tokens del creador con mejor manejo de errores
        let tokenIds = [];
        try {
          console.log("Calling getTokensByCreator for address:", address);
          const rawResult = await contract.getTokensByCreator(address);
          console.log("Raw result from getTokensByCreator:", rawResult);
          
          // Check if result is valid
          if (rawResult) {
            // Ensure it's an array
            tokenIds = Array.isArray(rawResult) ? rawResult : [];
            console.log("Processed token IDs:", tokenIds);
          } else {
            console.warn("getTokensByCreator returned empty or invalid result");
          }
        } catch (tokenError) {
          console.error("Error getting tokens by creator:", tokenError);
          
          // Try fallback method if available
          try {
            // Some contracts might have alternative methods to get tokens
            // Example: If a balanceOf function exists
            const balance = await contract.balanceOf(address);
            console.log("User token balance:", balance.toString());
            
            // If user has tokens, we can try to get them one by one
            if (balance && Number(balance) > 0) {
              const tempTokenIds = [];
              for (let i = 0; i < Number(balance); i++) {
                try {
                  // Example: Using tokenOfOwnerByIndex if it exists
                  const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                  if (tokenId) tempTokenIds.push(tokenId);
                } catch (indexError) {
                  console.warn("Could not get token by index:", indexError);
                  break;
                }
              }
              tokenIds = tempTokenIds;
            }
          } catch (fallbackError) {
            console.warn("Fallback method also failed:", fallbackError);
            // Continue with empty tokenIds array
          }
        }
        
        if (!isMounted) return;
        
        if (tokenIds.length === 0) {
          console.log("No tokens found for address:", address);
          setNfts([]);
          setLoading(false);
          return;
        }
        
        // Procesar tokens en lotes para no sobrecargar la red
        const BATCH_SIZE = 5;
        const results = [];
        
        for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
          if (!isMounted) break;
          
          const batch = tokenIds.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(tokenId => 
            processToken(tokenId, contract, address)
          );
          
          try {
            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter(result => !result.error);
            results.push(...validResults);
            
            // Actualización incremental para mejorar UX
            if (isMounted) {
              setNfts(prev => [...prev, ...validResults]);
            }
          } catch (batchError) {
            console.error("Error processing batch:", batchError);
            // Continue with the next batch
          }
        }
        
        // Actualización final completa
        if (isMounted) {
          setNfts(results);
        }
      } catch (err) {
        console.error("Error fetching user NFTs:", err);
        if (isMounted) {
          // Mejorar mensajes de error específicos para una mejor experiencia de usuario
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

    fetchUserNFTs();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [address, lastUpdated, processToken]);

  return { nfts, loading, error, refreshNFTs };
}