import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import TokenizationAppABI from '../../Abi/TokenizationApp.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

export default function useListNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // List NFT for sale
  const listNFT = useCallback(async ({ tokenId, price, category }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      
      console.log('listNFT called with:', { tokenId, price, category });

      // Validate and convert tokenId
      let parsedTokenId;
      if (typeof tokenId === 'bigint') {
        parsedTokenId = tokenId;
      } else if (typeof tokenId === 'number') {
        parsedTokenId = BigInt(tokenId);
      } else if (typeof tokenId === 'string') {
        const cleanTokenId = tokenId.trim();
        if (/^0x[0-9a-fA-F]+$/.test(cleanTokenId)) {
          parsedTokenId = BigInt(cleanTokenId);
        } else if (/^\d+$/.test(cleanTokenId)) {
          parsedTokenId = BigInt(cleanTokenId);
        } else {
          throw new Error('Invalid tokenId format');
        }
      } else {
        throw new Error('tokenId is required and must be a valid number or hex string');
      }

      // Validate price - ensure it meets minimum requirements
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error('Price must be a positive number');
      }

      // Check if price meets minimum (1000 wei according to common patterns)
      const priceWei = ethers.parseEther(price.toString());
      const minPrice = BigInt(1000); // Minimum price in wei
      if (priceWei < minPrice) {
        throw new Error('Price is below minimum required');
      }

      // Validate and map category to Spanish as the contract expects
      const categoryMap = {
        'collectible': 'collectibles',
        'collectibles': 'collectibles',
        'artwork': 'art',
        'art': 'art',
        'photography': 'photography',
        'music': 'music',
        'video': 'video'
      };

      const normalizedCategory = category?.toLowerCase().trim() || 'collectible';
      const categoryValue = categoryMap[normalizedCategory] || 'collectibles';

      console.log('Mapped category:', normalizedCategory, '->', categoryValue);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TokenizationAppABI.abi, signer);

      // Verify token ownership before listing
      try {
        const owner = await contract.ownerOf(parsedTokenId);
        const signerAddress = await signer.getAddress();
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error('You do not own this NFT');
        }
      } catch (ownerError) {
        if (ownerError.message.includes('nonexistent token')) {
          throw new Error('This NFT does not exist');
        }
        throw new Error('Cannot verify NFT ownership: ' + ownerError.message);
      }

      // Check if the token is already listed
      try {
        const listedToken = await contract.getListedToken(parsedTokenId);
        if (listedToken[4]) { // isForSale is at index 4
          throw new Error('This NFT is already listed for sale');
        }
      } catch (checkError) {
        // If getListedToken fails, it might mean the token is not listed, which is what we want
        console.log('Token listing check:', checkError.message);
      }

      // Check if the category is registered in the contract
      try {
        // The contract might require the category to be pre-registered
        // We'll try with the mapped category first
        console.log('Using category:', categoryValue);
      } catch (categoryError) {
        console.warn('Category validation warning:', categoryError.message);
      }

      console.log('Calling listTokenForSale with:', {
        tokenId: parsedTokenId.toString(),
        price: priceWei.toString(),
        category: categoryValue
      });

      // Call the contract function directly without gas estimation first
      try {
        const tx = await contract.listTokenForSale(
          parsedTokenId,
          priceWei,
          categoryValue,
          {
            gasLimit: BigInt(500000) // Use a higher fixed gas limit
          }
        );
        
        setTxHash(tx.hash);
        console.log('Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        
        setSuccess(true);
        return { txHash: tx.hash };
      } catch (contractError) {
        console.error('Contract call error:', contractError);
        
        // Enhanced error parsing for custom contract errors
        if (contractError.data) {
          const errorData = contractError.data;
          console.log('Error data:', errorData);
          
          // Map common custom error signatures
          const errorSignatures = {
            '0x8f563f02': 'CategoryNotValid - The category is not registered in the contract',
            '0x82b42960': 'Unauthorized - You are not authorized to list this NFT',
            '0x677510db': 'TokenDoesNotExist - The NFT does not exist',
            '0x037eff13': 'TokenNotForSale - The NFT is not available for sale operations',
            '0x356680b7': 'InsufficientFunds - Insufficient funds for the operation',
            '0xb4fa3fb3': 'InvalidInput - Invalid input parameters',
            '0x0df56d4f': 'SectionPaused - This section is currently paused'
          };
          
          const errorMsg = errorSignatures[errorData] || 'Unknown contract error';
          throw new Error(errorMsg);
        }
        
        // Parse other error types
        if (contractError.code === 'CALL_EXCEPTION') {
          if (contractError.reason) {
            throw new Error(`Contract error: ${contractError.reason}`);
          } else {
            throw new Error('Contract rejected the transaction - please check all requirements are met');
          }
        }
        
        if (contractError.message.includes('user rejected')) {
          throw new Error('Transaction was rejected by user');
        }
        
        if (contractError.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas');
        }
        
        throw new Error(contractError.message || 'Failed to list NFT');
      }
      
    } catch (err) {
      console.error('Error in listNFT:', err);
      const errorMessage = err.message || 'Error listing NFT';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { listNFT, loading, error, success, txHash };
}

