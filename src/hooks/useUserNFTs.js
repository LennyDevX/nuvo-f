import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../Abi/TokenizationApp.json';

// Definir una constante para la dirección del contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x71f3d55856e4058ed06ee057d79ada615f65cdf5";

// Use LogoNuvos.webp as the placeholder image
const DEFAULT_IMAGE = "/LogoNuvos.webp";

export default function useUserNFTs(address) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    const fetchUserNFTs = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching NFTs for address:", address);
        console.log("Using contract address:", CONTRACT_ADDRESS);
        
        // Conectar al provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log("Provider connected");
        
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TokenizationAppABI.abi,
          provider
        );
        console.log("Contract initialized");

        // Obtener todos los tokens creados por el usuario
        console.log("Calling getTokensByCreator...");
        const tokenIds = await contract.getTokensByCreator(address);
        console.log("Got tokens:", tokenIds);

        // Obtener detalles de cada token
        const nftPromises = tokenIds.map(async (tokenId) => {
          try {
            // Convertir el BigInt a string para mejor manipulación
            const tokenIdString = tokenId.toString();
            console.log(`Processing token ID: ${tokenIdString}`);

            // Obtener URI del token
            const tokenURI = await contract.tokenURI(tokenId);
            console.log(`Token URI for ${tokenIdString}:`, tokenURI);
            
            // Añadir log específico para el tokenId 1
            if (tokenIdString === "1") {
              console.log("SPECIAL NFT #1 - Full tokenURI details:", {
                uri: tokenURI,
                length: tokenURI?.length,
                substring: tokenURI?.substring(0, 50)
              });
            }

            // Obtener datos del token listado
            const tokenData = await contract.getListedToken(tokenId);
            console.log(`Token data for ${tokenIdString}:`, tokenData);
            
            // Obtener el número de likes
            const likes = await contract.getLikesCount(tokenId);
            console.log(`Likes for ${tokenIdString}:`, likes.toString());

            // Obtener el propietario del token
            const owner = await contract.ownerOf(tokenId);
            console.log(`Owner for ${tokenIdString}:`, owner);

            // Procesamos el tokenURI para obtener los metadatos
            let metadata = {
              name: `NFT #${tokenIdString}`,
              description: "Sin descripción",
              image: DEFAULT_IMAGE,
              attributes: []
            };

            try {
              // Manejar tokenURI - podría ser URL o dataURI
              if (tokenURI) {
                if (tokenURI.startsWith('data:application/json;base64,')) {
                  // Decodificar data URI base64
                  const base64Data = tokenURI.split(',')[1];
                  const jsonString = atob(base64Data);
                  metadata = JSON.parse(jsonString);
                } else if (tokenURI.startsWith('data:,' )) {
                  // Formato simple data URI (no base64) - Este es probablemente el caso para el tokenId 1
                  const dataJson = decodeURIComponent(tokenURI.substring(6));
                  console.log(`Decoded data URI for ${tokenIdString}:`, dataJson);
                  
                  try {
                    // Intentar analizar como JSON
                    const parsedData = JSON.parse(dataJson);
                    
                    // Imprimir los datos parseados para depuración, especialmente para tokenId 1
                    if (tokenIdString === "1") {
                      console.log(`TokenID 1 parsed data:`, parsedData);
                      // Verificar explícitamente si hay una propiedad de imagen
                      console.log(`TokenID 1 has image property:`, !!parsedData.image);
                    }
                    
                    // Fusionar con los metadatos predeterminados pero preservar las propiedades especiales
                    metadata = {
                      ...metadata,  // valores predeterminados
                      ...parsedData // valores del token URI
                    };
                    
                    // Si estamos procesando el token #1 y detectamos un formato específico, podríamos aplicar lógica personalizada
                    if (tokenIdString === "1" && !metadata.image && parsedData.image_url) {
                      metadata.image = parsedData.image_url;
                    }
                    
                    console.log(`Successfully parsed data for token ${tokenIdString}:`, metadata);
                  } catch (e) {
                    console.error(`Error parsing data URI JSON for ${tokenIdString}:`, e);
                    
                    // Para el tokenId 1, intentar un último enfoque si el análisis JSON falla
                    if (tokenIdString === "1") {
                      console.log("Attempting alternative parsing for token #1");
                      // Aquí podrías tener lógica alternativa para extraer datos
                      
                      // Si sabemos que el tokenId 1 tiene una imagen específica, podríamos asignarla directamente
                      // metadata.image = "https://ruta-conocida-del-nft-1.jpg";
                    }
                  }
                } else if (tokenURI.startsWith('ipfs://')) {
                  // Convertir IPFS URI a HTTP gateway
                  const ipfsGateway = 'https://ipfs.io/ipfs/';
                  const ipfsHash = tokenURI.replace('ipfs://', '');
                  const url = `${ipfsGateway}${ipfsHash}`;
                  const response = await fetch(url);
                  metadata = await response.json();
                } else if (tokenURI.startsWith('http')) {
                  // URL HTTP estándar
                  const response = await fetch(tokenURI);
                  metadata = await response.json();
                }

                // También corregir la URL de la imagen si es IPFS
                if (metadata.image && metadata.image.startsWith('ipfs://')) {
                  const ipfsGateway = 'https://ipfs.io/ipfs/';
                  const ipfsHash = metadata.image.replace('ipfs://', '');
                  metadata.image = `${ipfsGateway}${ipfsHash}`;
                }

                console.log(`Final processed metadata for ${tokenIdString}:`, metadata);
                
                // Verificación adicional para asegurarnos de que la imagen sea válida
                if (metadata.image) {
                  console.log(`Image URL for token ${tokenIdString}:`, metadata.image);
                } else {
                  console.warn(`No image found for token ${tokenIdString}, using placeholder`);
                }
              }
            } catch (metadataError) {
              console.error(`Error fetching metadata for token ${tokenIdString}:`, metadataError);
              // Mantenemos los metadatos predeterminados en caso de error
            }

            // Construir el objeto NFT con toda la información
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
            // Devolvemos un objeto mínimo en caso de error
            return {
              tokenId: tokenId.toString(),
              error: true,
              errorMessage: err.message
            };
          }
        });

        const nftResults = await Promise.all(nftPromises);
        console.log("Processed NFT results:", nftResults);
        setNfts(nftResults);
      } catch (err) {
        console.error("Error fetching user NFTs:", err);
        setError(err.message || "Error al obtener tus NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchUserNFTs();
  }, [address]);

  return { nfts, loading, error };
}