import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import MarketplaceABI from '../../Abi/Marketplace.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS_V2;

// Utilidad para parsear tokenId de forma robusta
function parseTokenId(tokenId) {
  let parsedTokenId;
  if (typeof tokenId === 'bigint') {
    parsedTokenId = tokenId;
  } else if (typeof tokenId === 'number' && !isNaN(tokenId)) {
    parsedTokenId = BigInt(tokenId);
  } else if (typeof tokenId === 'string') {
    const cleanTokenId = tokenId.trim().replace(/^0x0+/, '0x').replace(/^0+/, '');
    if (/^0x[0-9a-fA-F]+$/.test(cleanTokenId)) {
      parsedTokenId = BigInt(cleanTokenId);
    } else if (/^\d+$/.test(cleanTokenId)) {
      parsedTokenId = BigInt(cleanTokenId);
    }
  }
  if (parsedTokenId === undefined || parsedTokenId === null || isNaN(Number(parsedTokenId))) {
    throw new Error('tokenId is required and must be a valid number or hex string');
  }
  return parsedTokenId;
}

export default function useListedNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // Buy a listed NFT
  const buyNFT = useCallback(async ({ tokenId, price }) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');
      if (!price) throw new Error('price is required');

      const parsedTokenId = parseTokenId(tokenId);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      const tx = await contract.buyToken(parsedTokenId, { value: ethers.parseEther(price.toString()), gasLimit: BigInt(300000) });
      setTxHash(tx.hash);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (err) {
      setError(err.message || 'Error buying NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Make an offer for a listed NFT
  const makeOffer = useCallback(async ({ tokenId, offerAmount, expiresInDays }) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');
      if (!offerAmount) throw new Error('offerAmount is required');
      if (!expiresInDays) throw new Error('expiresInDays is required');

      const parsedTokenId = parseTokenId(tokenId);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      const tx = await contract.makeOffer(parsedTokenId, expiresInDays, {
        value: ethers.parseEther(offerAmount.toString()),
        gasLimit: BigInt(300000)
      });
      setTxHash(tx.hash);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (err) {
      setError(err.message || 'Error making offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept an offer
  const acceptOffer = useCallback(async ({ offerId }) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!offerId) throw new Error('offerId is required');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      const tx = await contract.acceptOffer(offerId, { gasLimit: BigInt(300000) });
      setTxHash(tx.hash);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (err) {
      setError(err.message || 'Error accepting offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel an offer
  const cancelOffer = useCallback(async ({ offerId }) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!offerId) throw new Error('offerId is required');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      const tx = await contract.cancelOffer(offerId, { gasLimit: BigInt(200000) });
      setTxHash(tx.hash);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (err) {
      setError(err.message || 'Error cancelling offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update price of a listed NFT
  const updatePrice = useCallback(async ({ tokenId, newPrice, category }) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');
      if (!newPrice) throw new Error('newPrice is required');

      const parsedTokenId = parseTokenId(tokenId);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      const tx = await contract.updatePrice(parsedTokenId, ethers.parseEther(newPrice.toString()), {
        gasLimit: BigInt(200000)
      });
      setTxHash(tx.hash);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (err) {
      setError(err.message || 'Error updating price');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unlist NFT
  const unlistNFT = useCallback(async ({ tokenId }) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');

      const parsedTokenId = parseTokenId(tokenId);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      const tx = await contract.unlistedToken(parsedTokenId, {
        gasLimit: BigInt(200000)
      });
      setTxHash(tx.hash);
      await tx.wait();
      return { txHash: tx.hash };
    } catch (err) {
      setError(err.message || 'Error unlisting NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    buyNFT,
    makeOffer,
    acceptOffer,
    cancelOffer,
    updatePrice,
    unlistNFT,
    loading,
    error,
    txHash
  };
}
