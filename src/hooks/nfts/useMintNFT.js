import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../../utils/blockchain/blockchainUtils';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';

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
        throw new Error('Invalid contract address. Please check your environment configuration.');
      }
      
      console.log("Using contract address:", validatedContractAddress);
      
      // Normalize the category to English first, then translate to Spanish for contract
      const normalizedCategory = categoryMap[category] || 'coleccionables';
      console.log("Category normalized:", category, "->", normalizedCategory);

      // Check if wallet is connected
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to mint NFTs');
      }

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      console.log("Connected wallet:", userAddress);

      // Create contract instance
      const contract = new ethers.Contract(
        validatedContractAddress,
        TokenizationAppABI.abi,
        signer
      );

      // Step 1: Upload image to IPFS
      console.log("Uploading image to IPFS...");
      let imageUrl;
      try {
        imageUrl = await uploadFileToIPFS(file);
        console.log("Image uploaded to IPFS:", imageUrl);
      } catch (ipfsError) {
        console.warn("IPFS upload failed, using local data URL:", ipfsError);
        imageUrl = await createLocalDataUrl(file);
      }

      // Step 2: Create metadata object
      const metadata = {
        name: name || "Untitled NFT",
        description: description || "A unique digital asset",
        image: imageUrl,
        attributes: [
          {
            trait_type: "Category",
            value: category
          },
          {
            trait_type: "Creator",
            value: userAddress
          },
          {
            trait_type: "Created",
            value: new Date().toISOString()
          }
        ]
      };

      // Step 3: Upload metadata to IPFS
      console.log("Uploading metadata to IPFS...");
      let metadataUrl;
      try {
        metadataUrl = await uploadJsonToIPFS(metadata);
        console.log("Metadata uploaded to IPFS:", metadataUrl);
      } catch (metadataError) {
        console.warn("Metadata IPFS upload failed:", metadataError);
        // Create a simple data URL for metadata as fallback
        const metadataJson = JSON.stringify(metadata);
        const blob = new Blob([metadataJson], { type: 'application/json' });
        metadataUrl = URL.createObjectURL(blob);
      }

      // Step 4: Estimate gas for the transaction
      console.log("Estimating gas for minting...");
      const royaltyBasisPoints = Math.floor((royalty || 250));
      
      try {
        const gasEstimate = await contract.createNFT.estimateGas(
          metadataUrl,
          normalizedCategory,
          royaltyBasisPoints
        );
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (estimateError) {
        console.warn("Gas estimation failed:", estimateError);
      }

      // Step 5: Execute the minting transaction
      console.log("Executing minting transaction...");
      const transaction = await contract.createNFT(
        metadataUrl,
        normalizedCategory,
        royaltyBasisPoints,
        {
          gasLimit: 500000 // Set a reasonable gas limit
        }
      );

      console.log("Transaction submitted:", transaction.hash);
      setTxHash(transaction.hash);

      // Step 6: Wait for transaction confirmation
      console.log("Waiting for transaction confirmation...");
      const receipt = await transaction.wait();
      
      if (receipt.status === 1) {
        console.log("Transaction confirmed:", receipt);
        
        // Extract token ID from transaction receipt
        let tokenId = null;
        if (receipt.logs && receipt.logs.length > 0) {
          try {
            const tokenMintedEvent = receipt.logs.find(log => 
              log.topics[0] === ethers.id("TokenMinted(uint256,address,string,string)")
            );
            if (tokenMintedEvent) {
              tokenId = parseInt(tokenMintedEvent.topics[1], 16);
            }
          } catch (eventError) {
            console.warn("Could not extract token ID from event:", eventError);
          }
        }

        setSuccess(true);
        
        return {
          success: true,
          txHash: transaction.hash,
          tokenId: tokenId,
          imageUrl: imageUrl,
          metadataUrl: metadataUrl,
          contractAddress: validatedContractAddress
        };
      } else {
        throw new Error('Transaction failed on blockchain');
      }

    } catch (err) {
      console.error('Error in mintNFT:', err);
      
      let errorMessage = 'An unexpected error occurred while minting your NFT.';
      
      if (err.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected. Please try again and confirm the transaction in your wallet.';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete the transaction. Please add more MATIC to your wallet.';
      } else if (err.message?.includes('Invalid contract address')) {
        errorMessage = 'Contract configuration error. Please contact support.';
      } else if (err.message?.includes('IPFS')) {
        errorMessage = 'Failed to upload content. Please check your internet connection and try again.';
      } else if (err.message?.includes('MetaMask')) {
        errorMessage = 'Please install and connect MetaMask to mint NFTs.';
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
      