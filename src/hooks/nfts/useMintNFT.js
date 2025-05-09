import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SKe;
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

// Mapa de traducción de categorías (inglés → español)
const categoryMap = {
  'collectible': 'coleccionables',
  'artwork': 'arte',
  'photography': 'fotografia',
  'music': 'musica',
  'video': 'video',
  'item': 'coleccionables',
  'document': 'coleccionables'
};

export default function useMintNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  
  // Usar una referencia para la instancia de axios para evitar recrearla
  const axiosInstanceRef = useRef(axios.create({
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
  }));

  // 1. Subir imagen a Pinata (optimizado y con useCallback)
  const uploadImageToIPFS = useCallback(async (file) => {
    try {
      // Verificar que file es un objeto File/Blob válido
      if (!file || !(file instanceof Blob)) {
        throw new Error("File is not a valid Blob or File object");
      }

      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      const data = new FormData();
      data.append('file', file);
      
      // Usar la instancia cacheada de axios con timeout y opciones de retry
      const res = await axiosInstanceRef.current.post(url, data, {
        maxContentLength: Infinity,
        timeout: 30000, // 30s timeout
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      
      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error(`Error al subir imagen: ${error.message || 'Error desconocido'}`);
    }
  }, []);

  // 2. Subir metadatos a Pinata (optimizado y con useCallback)
  const uploadMetadataToIPFS = useCallback(async (metadata) => {
    try {
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      
      // Usar la instancia cacheada de axios
      const res = await axiosInstanceRef.current.post(url, metadata, {
        timeout: 15000, // 15s timeout
      });
      
      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw new Error(`Error al subir metadatos: ${error.message || 'Error desconocido'}`);
    }
  }, []);

  // 3. Mintear NFT en el contrato (optimizado con useCallback)
  const mintNFT = useCallback(async ({ file, name, description, category, royalty }) => {
    // Crear un AbortController para manejar cancelaciones
    const abortController = new AbortController();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);
    
    try {
      console.log("Starting NFT minting process");
      console.log("Input category:", category);
      
      // Traducir la categoría al español si existe en el mapa
      const translatedCategory = categoryMap[category.toLowerCase()] || 'coleccionables';
      console.log("Translated category:", translatedCategory);
      
      // Subir imagen
      console.log("Uploading image file:", file);
      const imageUrl = await uploadImageToIPFS(file);
      console.log("Image uploaded, URL:", imageUrl);
      
      // Crear metadatos
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: [
          { trait_type: 'Category', value: category }
        ]
      };
      
      console.log("Creating metadata:", metadata);
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      console.log("Metadata uploaded, URL:", metadataUrl);
      
      // Conectar a wallet
      if (!window.ethereum) throw new Error('Wallet not found');
      console.log("Connecting to wallet");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, signer);
      
      // Convertir el royalty a un formato adecuado para el contrato
      // El error está aquí - necesitamos asegurarnos de que royalty sea un número o una cadena antes de usarlo
      const royaltyValue = typeof royalty === 'bigint' ? royalty : 
                          typeof royalty === 'string' ? royalty :
                          typeof royalty === 'number' ? royalty.toString() : 
                          '0';
                          
      console.log("Calling contract.createNFT with:", {
        metadataUrl,
        category: translatedCategory,
        royalty: royaltyValue
      });
      
      // Estimar gas para la transacción
      let gasEstimate;
      try {
        gasEstimate = await contract.createNFT.estimateGas(
          metadataUrl, 
          translatedCategory, 
          royaltyValue
        );
      } catch (gasError) {
        console.warn("Error estimating gas:", gasError);
        // Continuar sin la estimación de gas
      }
      
      // Si tenemos una estimación, añadir un 20% extra
      const txOptions = {};
      if (gasEstimate) {
        txOptions.gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));
      }
      
      // Llamar a createNFT con la categoría traducida
      const tx = await contract.createNFT(
        metadataUrl, 
        translatedCategory, 
        royaltyValue,
        txOptions
      );
      
      setTxHash(tx.hash);
      console.log("Transaction sent, hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setSuccess(true);
      
      // Obtener el tokenId del evento emitido
      const tokenMintedEvent = receipt.logs
        .filter(log => log.topics[0] === ethers.id("TokenMinted(uint256,address,string,string)"))
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            console.warn("Error parsing log:", e);
            return null;
          }
        })
        .filter(Boolean)[0];
      
      let tokenId = null;
      if (tokenMintedEvent && tokenMintedEvent.args && tokenMintedEvent.args[0]) {
        tokenId = tokenMintedEvent.args[0].toString();
        console.log("New token ID:", tokenId);
      } else {
        console.warn("Could not extract token ID from event");
      }
      
      return { 
        imageUrl, 
        metadataUrl, 
        txHash: tx.hash,
        tokenId: tokenId
      };
    } catch (err) {
      console.error("Error in mintNFT:", err);
      const errorMessage = err.message || 'Error minting NFT';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [uploadImageToIPFS, uploadMetadataToIPFS]);

  return { mintNFT, loading, error, success, txHash };
}
