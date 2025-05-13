import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';
import { uploadFileToIPFS, uploadJsonToIPFS, ipfsToHttp } from '../../utils/blockchain/blockchainUtils';

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

// Local fallback for when IPFS upload fails
const createLocalDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

export default function useMintNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Mint NFT using enhanced IPFS functions from blockchainUtils
  const mintNFT = useCallback(async ({ file, name, description, category, royalty }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);
    
    try {
      console.log("Starting NFT minting process");
      
      // Check contract address
      if (!CONTRACT_ADDRESS) {
        throw new Error("Contract address not configured in environment variables");
      }
      
      console.log("Using contract address:", CONTRACT_ADDRESS);
      
      // Validate contract address format
      if (!ethers.isAddress(CONTRACT_ADDRESS)) {
        console.error(`Invalid contract address format: ${CONTRACT_ADDRESS}`);
        throw new Error("Contract address is invalid - check environment configuration");
      }
      
      // Traducir la categoría al español si existe en el mapa
      const translatedCategory = categoryMap[category.toLowerCase()] || 'coleccionables';
      console.log("Translated category:", translatedCategory);
      
      let imageUri;
      let metadataUri;
      let useLocalFallback = false;
      
      // Try uploading to IPFS via Pinata
      try {
        // Subir imagen using our enhanced IPFS utility
        console.log("Uploading image file:", file.name, "size:", file.size, "type:", file.type);
        imageUri = await uploadFileToIPFS(file);
        console.log("Image uploaded, URI:", imageUri);
        
        // Crear metadatos
        const metadata = {
          name,
          description,
          image: imageUri,
          attributes: [
            { trait_type: 'Category', value: category }
          ]
        };
        
        console.log("Creating metadata");
        metadataUri = await uploadJsonToIPFS(metadata);
        console.log("Metadata uploaded, URI:", metadataUri);
      } catch (ipfsError) {
        console.warn("IPFS upload failed, using local fallback:", ipfsError);
        useLocalFallback = true;
        
        // Create data URL as fallback
        imageUri = await createLocalDataUrl(file);
        console.log("Created local image URL");
        
        // Create metadata with data URL
        const metadata = {
          name,
          description,
          image: imageUri,
          attributes: [
            { trait_type: 'Category', value: category }
          ]
        };
        
        // Encode metadata as base64
        const metadataString = JSON.stringify(metadata);
        metadataUri = `data:application/json;base64,${btoa(metadataString)}`;
        console.log("Created local metadata");
      }
      
      // Conectar a wallet
      if (!window.ethereum) throw new Error('Wallet not found');
      console.log("Connecting to wallet");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      console.log("Creating contract instance with address:", CONTRACT_ADDRESS);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, signer);
      
      // Convertir el royalty a un formato adecuado para el contrato
      // Use simple numeric value for royalty
      let royaltyValue = 0;
      try {
        royaltyValue = 
          typeof royalty === 'bigint' ? royalty :
          typeof royalty === 'string' ? parseInt(royalty, 10) :
          typeof royalty === 'number' ? royalty : 
          0;
      } catch (e) {
        console.warn("Error parsing royalty, using 0:", e);
        royaltyValue = 0;
      }
      
      console.log("Calling contract.createNFT with:", {
        metadataUri,
        category: translatedCategory,
        royalty: royaltyValue
      });
      
      // Use a fixed gas limit to avoid estimation issues
      const txOptions = {
        gasLimit: BigInt(3000000) // Use a safe high value
      };
      
      console.log("Using fixed gas limit:", txOptions.gasLimit.toString());
      
      // Llamar a createNFT con la categoría traducida
      const tx = await contract.createNFT(
        metadataUri, 
        translatedCategory, 
        royaltyValue,
        txOptions
      );
      
      setTxHash(tx.hash);
      console.log("Transaction sent, hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setSuccess(true);
      
      // Extract token ID with improved error handling
      let tokenId = null;
      try {
        // First look for TokenMinted event
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "TokenMinted") {
              tokenId = parsedLog.args[0].toString();
              console.log("Found TokenMinted event with token ID:", tokenId);
              break;
            }
          } catch (e) {
            // Continue to next log if this one fails to parse
          }
        }

        // If TokenMinted event not found, look for Transfer event (ERC721 standard)
        if (!tokenId) {
          const transferEventTopic = ethers.id("Transfer(address,address,uint256)");
          for (const log of receipt.logs) {
            if (log.topics[0] === transferEventTopic) {
              // The last topic in a Transfer event is the token ID
              tokenId = parseInt(log.topics[3], 16).toString();
              console.log("Found Transfer event with token ID:", tokenId);
              break;
            }
          }
        }
      } catch (eventError) {
        console.error("Error extracting token ID from events:", eventError);
      }
      
      if (!tokenId) {
        console.warn("Could not extract token ID from events, trying generic approach");
        // Generic approach - try to get the last NFT minted
        try {
          const balance = await contract.balanceOf(await signer.getAddress());
          if (balance > 0) {
            const lastTokenIndex = balance - BigInt(1);
            tokenId = await contract.tokenOfOwnerByIndex(await signer.getAddress(), lastTokenIndex);
            tokenId = tokenId.toString();
            console.log("Found token ID using balanceOf/tokenOfOwnerByIndex:", tokenId);
          }
        } catch (e) {
          console.error("Error with generic token ID approach:", e);
        }
      }
      
      // Even if we couldn't get the token ID, we'll return what we have
      // Determine the best image URL to return
      const imageUrl = useLocalFallback ? imageUri : ipfsToHttp(imageUri);
      
      return { 
        imageUrl,
        metadataUrl: useLocalFallback ? metadataUri : ipfsToHttp(metadataUri), 
        txHash: tx.hash,
        tokenId: tokenId || "Unknown"
      };
    } catch (err) {
      console.error("Error in mintNFT:", err);
      
      // Provide a more user-friendly error message
      let errorMessage = 'Error minting NFT';
      
      if (err.message && err.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by the user';
      } else if (err.message && err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas * price + value';
      } else if (err.code === 'CALL_EXCEPTION') {
        errorMessage = 'Smart contract error - the transaction was rejected';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mintNFT, loading, error, success, txHash };
}
