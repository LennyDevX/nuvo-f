import { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import TokenizationAppABI from '../Abi/TokenizationApp.json';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
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

  // 1. Subir imagen a Pinata
  const uploadImageToIPFS = async (file) => {
    try {
      // Verificar que file es un objeto File/Blob válido
      if (!file || !(file instanceof Blob)) {
        throw new Error("File is not a valid Blob or File object");
      }

      console.log("Uploading file to IPFS:", file);
      
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
      const data = new FormData();
      data.append('file', file);
      
      const res = await axios.post(url, data, {
        maxContentLength: 'Infinity',
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      });
      
      console.log("IPFS upload response:", res.data);
      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  };

  // 2. Subir metadatos a Pinata
  const uploadMetadataToIPFS = async (metadata) => {
    try {
      console.log("Uploading metadata to IPFS:", metadata);
      
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      const res = await axios.post(url, metadata, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      });
      
      console.log("Metadata upload response:", res.data);
      return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw error;
    }
  };

  // 3. Mintear NFT en el contrato
  const mintNFT = async ({ file, name, description, category, royalty }) => {
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
      
      console.log("Calling contract.createNFT with:", {
        metadataUrl,
        category: translatedCategory,
        royalty
      });
      
      // Llamar a createNFT con la categoría traducida
      const tx = await contract.createNFT(metadataUrl, translatedCategory, royalty);
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
            return null;
          }
        })
        .filter(Boolean)[0];
      
      const tokenId = tokenMintedEvent ? tokenMintedEvent.args[0] : null;
      console.log("New token ID:", tokenId);
      
      return { 
        imageUrl, 
        metadataUrl, 
        txHash: tx.hash,
        tokenId: tokenId ? tokenId.toString() : null
      };
    } catch (err) {
      console.error("Error in mintNFT:", err);
      const errorMessage = err.message || 'Error minting NFT';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { mintNFT, loading, error, success, txHash };
}
