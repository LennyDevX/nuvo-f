import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';
import { uploadFileToIPFS, uploadJsonToIPFS, ipfsToHttp, mapCategoryToSpanish, normalizeCategory } from '../../utils/blockchain/blockchainUtils';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

// Move category map outside component to prevent recreation on each render
const categoryMap = {
  'collectible': 'coleccionables',
  'artwork': 'arte',
  'photography': 'fotografia',
  'music': 'musica',
  'video': 'video',
  'item': 'collectible',
  'document': 'collectible'
};

// Local fallback for when IPFS upload fails - moved outside to avoid recreation
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

  // Memoize contract address validation to prevent rechecking on every render
  const validatedContractAddress = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;
    return ethers.isAddress(CONTRACT_ADDRESS) ? CONTRACT_ADDRESS : null;
  }, []);

  // Mint NFT using enhanced IPFS functions from blockchainUtils
  const mintNFT = useCallback(async ({ file, name, description, category, royalty }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      console.log("Starting NFT minting process");
      
      // Use memoized contract address
      if (!validatedContractAddress) {
        throw new Error("Contract address is invalid or not configured");
      }
      
      console.log("Using contract address:", validatedContractAddress);
      
      // Normalize the category to English first, then translate to Spanish for contract
      const normalizedCategory = normalizeCategory(category);
      const translatedCategory = mapCategoryToSpanish(normalizedCategory);
      console.log("Category flow:", category, "->", normalizedCategory, "->", translatedCategory);
      
      let imageUri;
      let metadataUri;
      let useLocalFallback = false;

      // Try uploading to IPFS via Pinata
      try {
        // Subir imagen using our enhanced IPFS utility
        console.log("Uploading image file:", file.name, "size:", file.size, "type:", file.type);
        imageUri = await uploadFileToIPFS(file);
        console.log("Image uploaded, URI:", imageUri);
        
        // Crear metadatos - store the normalized English category in metadata
        const metadata = {
          name,
          description,
          image: imageUri,
          attributes: [
            { trait_type: 'Category', value: normalizedCategory } // Store English category in metadata
          ]
        };
        
        console.log("Creating metadata with normalized category:", normalizedCategory);
        metadataUri = await uploadJsonToIPFS(metadata);
        console.log("Metadata uploaded, URI:", metadataUri);
      } catch (ipfsError) {
        // Show the actual error message from Pinata if available
        let msg = ipfsError?.message || ipfsError?.toString() || '';
        if (
          msg.includes('Pinata authentication failed') ||
          msg.includes('401') ||
          msg.includes('403')
        ) {
          setError(
            "No se pudo subir el archivo a IPFS. Tus credenciales de Pinata son inválidas o faltan. Por favor revisa tu configuración de API Key/Secret o JWT."
          );
        } else {
          setError(msg || "No se pudo subir el archivo a IPFS. Verifica tu conexión o tus credenciales de Pinata.");
        }
        throw new Error(msg || "No se pudo subir el archivo a IPFS. Verifica tu conexión o tus credenciales de Pinata.");
      }

      // Si por alguna razón no hay metadataUri, no mintees
      if (!metadataUri || !imageUri) {
        setError("No se pudo obtener la URI de IPFS para la metadata o la imagen.");
        throw new Error("No se pudo obtener la URI de IPFS para la metadata o la imagen.");
      }

      // Conectar a wallet
      if (!window.ethereum) throw new Error('Wallet not found');
      console.log("Connecting to wallet");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      console.log("Creating contract instance with address:", validatedContractAddress);
      const contract = new ethers.Contract(validatedContractAddress, TokenizationAppABI.abi, signer);
      
      // Convertir el royalty a uint96 (BigInt)
      let royaltyValue = 0n;
      try {
        if (typeof royalty === 'bigint') {
          royaltyValue = royalty;
        } else if (typeof royalty === 'string') {
          royaltyValue = BigInt(royalty);
        } else if (typeof royalty === 'number') {
          royaltyValue = BigInt(royalty);
        } else {
          royaltyValue = 0n;
        }
      } catch (e) {
        royaltyValue = 0n;
      }
      
      console.log("Calling contract.createNFT with:", {
        metadataUri,
        category: translatedCategory, // Spanish for contract
        royalty: royaltyValue
      });
      
      // Use a fixed gas limit to avoid estimation issues
      const txOptions = {
        gasLimit: BigInt(3000000) // Use a safe high value
      };
      
      console.log("Using fixed gas limit:", txOptions.gasLimit.toString());
      
      // Llamar a createNFT con la categoría traducida y royalty como uint96
      const tx = await contract.createNFT(
        metadataUri, 
        translatedCategory, 
        royaltyValue,
        {
          gasLimit: BigInt(3000000)
        }
      );
      
      setTxHash(tx.hash);
      console.log("Transaction sent, hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setSuccess(true);
      
      // Extraer tokenId del evento TokenMinted
      let tokenId = null;
      try {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "TokenMinted") {
              // El tokenId es el primer argumento (uint256 indexed tokenId)
              tokenId = parsedLog.args.tokenId?.toString() || parsedLog.args[0]?.toString();
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
      } else if (
        err.message &&
        (err.message.includes('Pinata authentication failed') ||
         err.message.includes('401') ||
         err.message.includes('403'))
      ) {
        errorMessage = "No se pudo subir el archivo a IPFS. Tus credenciales de Pinata son inválidas o faltan. Por favor revisa tu configuración de API Key/Secret o JWT.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [validatedContractAddress]); // Add validatedContractAddress as dependency

  return { mintNFT, loading, error, success, txHash };
}
