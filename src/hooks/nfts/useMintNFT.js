import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { uploadFileToIPFS, uploadJsonToIPFS, ipfsToHttp } from '../../utils/blockchain/blockchainUtils';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';

// Contract address - usar la dirección del contrato desplegado
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

// Move category map outside component to prevent recreation on each render
const categoryMap = {
  'collectible': 'coleccionables',
  'artwork': 'arte',
  'photography': 'fotografia',
  'music': 'musica',
  'video': 'video',
  'item': 'coleccionables',
  'document': 'coleccionables'
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
    setTxHash(null);

    try {
      console.log("Starting NFT minting process");
      
      // Use memoized contract address
      if (!validatedContractAddress) {
        throw new Error("Contract address is invalid or not configured");
      }
      
      console.log("Using contract address:", validatedContractAddress);
      
      // Validate Pinata credentials using correct env variable names
      const hasApiKeys = !!(
        import.meta.env.VITE_PINATA_API_KEY && 
        import.meta.env.VITE_PINATA_SECRET_KEY
      );
      
      console.log('Pinata credentials check:', { 
        hasApiKeys,
        apiKeyLength: import.meta.env.VITE_PINATA_API_KEY?.length,
        secretLength: import.meta.env.VITE_PINATA_SECRET_KEY?.length
      });
      
      if (!hasApiKeys) {
        throw new Error('Configure Pinata: VITE_PINATA_API_KEY & VITE_PINATA_SECRET_KEY are required.');
      }
      
      // Remove the hasJwt validation that was causing errors
      // Traducir la categoría al español si existe en el mapa
      const translatedCategory = categoryMap[category.toLowerCase()] || 'coleccionables';
      console.log("Translated category:", translatedCategory);
      
      let imageUri;
      let metadataUri;

      // Try uploading to IPFS via Pinata
      try {
        // Subir imagen using our enhanced IPFS utility
        console.log("Uploading image file:", file.name, "size:", file.size, "type:", file.type);
        imageUri = await uploadFileToIPFS(file, { name: `${name}_image` });
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
        metadataUri = await uploadJsonToIPFS(metadata, { name: `${name}_metadata` });
        console.log("Metadata uploaded, URI:", metadataUri);
      } catch (ipfsError) {
        console.error("IPFS upload error:", ipfsError);
        
        // Provide more specific error messages
        let errorMessage = "No se pudo subir el archivo a IPFS.";
        
        if (ipfsError.message.includes('credentials')) {
          errorMessage = "Credenciales de Pinata inválidas. Por favor verifica tu configuración de API keys o JWT token.";
        } else if (ipfsError.message.includes('403')) {
          errorMessage = "Acceso denegado a Pinata. Verifica los permisos de tu cuenta.";
        } else if (ipfsError.message.includes('413')) {
          errorMessage = "El archivo es demasiado grande para subir a Pinata.";
        } else if (ipfsError.message.includes('network') || ipfsError.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet y vuelve a intentar.";
        } else if (ipfsError.message) {
          errorMessage = `Error de Pinata: ${ipfsError.message}`;
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Si por alguna razón no hay metadataUri, no mintees
      if (!metadataUri || !imageUri) {
        const errorMsg = "No se pudo obtener la URI de IPFS para la metadata o la imagen.";
        setError(errorMsg);
        throw new Error(errorMsg);
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
        category: translatedCategory,
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
      const imageUrl = ipfsToHttp(imageUri);
      
      return { 
        imageUrl,
        metadataUrl: ipfsToHttp(metadataUri), 
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
      } else if (err.message && err.message.includes('Pinata')) {
        errorMessage = err.message; // Use the specific Pinata error message
      } else if (err.message && err.message.includes('credenciales')) {
        errorMessage = err.message; // Use the specific credentials error message
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
  }, [validatedContractAddress]); // Add validatedContractAddress as dependency

  // List NFT for sale - CORREGIDO
  const listNFT = async (tokenId, price, category) => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      
      const contract = new ethers.Contract(
        validatedContractAddress,
        TokenizationAppABI.abi,
        signer
      );

      // Convert category to Spanish if needed (matching the mint function)
      const translatedCategory = categoryMap[category.toLowerCase()] || 'coleccionables';
      console.log("Using translated category for listing:", translatedCategory);

      // Check if user owns the NFT
      const owner = await contract.ownerOf(tokenId);
      console.log("NFT owner:", owner, "Current account:", account);
      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Check if NFT is already listed
      try {
        const listingData = await contract.getListedToken(tokenId);
        if (listingData[4]) { // isForSale
          console.log(`NFT ${tokenId} is already listed by seller: ${listingData[1]}`);
          throw new Error('NFT is already listed for sale');
        }
      } catch (listingError) {
        if (listingError.message.includes('already listed')) {
          throw listingError; // Re-throw if it's the "already listed" error
        }
        console.log("Could not check listing status, proceeding with listing");
      }

      // Validate price (minimum 0.001 ETH)
      const minPrice = ethers.parseEther("0.001");
      const priceInWei = ethers.parseEther(price.toString());
      if (priceInWei <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (priceInWei < minPrice) {
        throw new Error('Price must be at least 0.001 ETH');
      }

      console.log("Listing NFT with params:", {
        tokenId: tokenId.toString(),
        price: priceInWei.toString(),
        category: translatedCategory
      });

      // Check if contract is approved to transfer this NFT
      const approved = await contract.getApproved(tokenId);
      const isApprovedForAll = await contract.isApprovedForAll(account, validatedContractAddress);
      
      console.log("Approval status:", { approved, isApprovedForAll, contractAddress: validatedContractAddress });

      if (approved.toLowerCase() !== validatedContractAddress.toLowerCase() && !isApprovedForAll) {
        console.log("Approving contract to transfer NFT...");
        // Approve the contract to transfer this NFT
        const approveTx = await contract.approve(validatedContractAddress, tokenId, {
          gasLimit: BigInt(100000)
        });
        await approveTx.wait();
        console.log("Approval transaction completed");
      }

      // List the NFT with proper gas limit
      const tx = await contract.listTokenForSale(tokenId, priceInWei, translatedCategory, {
        gasLimit: BigInt(500000) // Increased gas limit
      });
      const receipt = await tx.wait();

      console.log(`NFT ${tokenId} successfully listed for ${ethers.formatEther(priceInWei)} MATIC by ${account}`);

      return {
        success: true,
        txHash: receipt.hash,
        tokenId: tokenId,
        price: priceInWei.toString(),
        category: translatedCategory
      };

    } catch (error) {
      console.error('Error listing NFT:', error);
      
      // Enhanced error parsing for contract errors
      let errorMessage = 'Error listing NFT';
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message.includes('already listed')) {
        errorMessage = 'NFT is already listed for sale';
      } else if (error.message.includes('not own')) {
        errorMessage = 'You do not own this NFT';
      } else if (error.data === '0x8f563f02') {
        errorMessage = 'Invalid category. The category must be registered in the contract.';
      } else if (error.data === '0x82b42960') {
        errorMessage = 'You are not authorized to list this NFT';
      } else if (error.data === '0x037eff13') {
        errorMessage = 'This NFT is not available for listing';
      } else if (error.code === 'CALL_EXCEPTION') {
        if (error.data) {
          // Try to decode the custom error
          errorMessage = `Smart contract error. The NFT cannot be listed. Please ensure the category "${category}" is valid and you own the NFT.`;
        } else {
          errorMessage = 'Smart contract error - the transaction was rejected';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Buy NFT
  const buyNFT = useCallback(async (tokenId, price) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, signer);

      // Verificar que el NFT esté listado
      const listing = await contract.getListedToken(tokenId);
      if (!listing[4]) { // isForSale
        throw new Error('Este NFT no está en venta');
      }

      const priceInWei = ethers.parseEther(price.toString());

      console.log('Buying NFT:', { tokenId, price: priceInWei.toString() });

      const tx = await contract.buyToken(tokenId, { 
        value: priceInWei,
        gasLimit: BigInt(300000) // Gas suficiente para la compra
      });
      
      setTxHash(tx.hash);
      console.log('Purchase transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Purchase confirmed:', receipt);
      
      return tx;
    } catch (err) {
      console.error('Error buying NFT:', err);
      
      let errorMessage = 'Error al comprar NFT';
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Fondos insuficientes';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Make offer
  const makeOffer = useCallback(async (tokenId, offerAmount, expiresInDays) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, signer);

      const offerAmountWei = ethers.parseEther(offerAmount.toString());

      const tx = await contract.makeOffer(tokenId, expiresInDays, {
        value: offerAmountWei,
        gasLimit: BigInt(200000)
      });
      
      setTxHash(tx.hash);
      await tx.wait();
      return tx;
    } catch (err) {
      console.error('Error making offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept offer
  const acceptOffer = useCallback(async (offerId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, signer);

      const tx = await contract.acceptOffer(offerId, {
        gasLimit: BigInt(300000)
      });
      
      setTxHash(tx.hash);
      await tx.wait();
      return tx;
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get listed token information
  const getListedToken = useCallback(async (tokenId) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, provider);

      const listing = await contract.getListedToken(tokenId);
      
      return {
        tokenId: listing[0].toString(),
        seller: listing[1],
        owner: listing[2],
        price: listing[3].toString(),
        isListed: listing[4],
        timestamp: listing[5].toString(),
        category: listing[6]
      };
    } catch (err) {
      console.error('Error getting listed token:', err);
      return null;
    }
  }, []);

  return {
    mintNFT,
    loading,
    error,
    txHash,
    listNFT,
    buyNFT,
    makeOffer,
    acceptOffer,
    getListedToken
  };
}
