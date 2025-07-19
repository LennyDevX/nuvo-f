import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import MarketplaceABI from '../../Abi/Marketplace.json';
import { mapCategoryToSpanish, normalizeCategory } from '../../utils/blockchain/blockchainUtils';

// Use V2 contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS_V2;

export default function useListNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const listNFT = useCallback(async ({ tokenId, price, category }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      if (!window.ethereum) {
        throw new Error('Wallet not found');
      }
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
        throw new Error('Invalid contract address');
      }

      // Parse tokenId
      let parsedTokenId;
      if (typeof tokenId === 'bigint') {
        parsedTokenId = tokenId;
      } else if (typeof tokenId === 'number') {
        parsedTokenId = BigInt(tokenId);
      } else if (typeof tokenId === 'string') {
        const clean = tokenId.trim();
        if (/^0x[0-9a-fA-F]+$/.test(clean) || /^\d+$/.test(clean)) {
          parsedTokenId = BigInt(clean);
        } else {
          throw new Error('Invalid tokenId format');
        }
      } else {
        throw new Error('tokenId must be a number, bigint or hex/string');
      }

      // Validate price
      const priceFloat = parseFloat(price);
      if (isNaN(priceFloat) || priceFloat <= 0) {
        throw new Error('Price must be a positive number');
      }
      const priceWei = ethers.parseEther(priceFloat.toString());
      const minPrice = BigInt(1000);
      if (priceWei < minPrice) {
        throw new Error('Price is below minimum required');
      }

      // Map and normalize category
      const categoryEs = mapCategoryToSpanish(category);
      const categoryEn = normalizeCategory(category);
      const categoryToSend = categoryEn;

      // Initialize provider, signer, contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);

      // --- NUEVO: Verifica si la categoría está registrada ---
      try {
        await contract.registerCategory(categoryToSend);
      } catch (catErr) {
        if (
          catErr?.message?.includes("already registered") ||
          catErr?.message?.includes("revert") ||
          catErr?.data === "0x8f563f02"
        ) {
          // Ya está registrada o revertió, continuar
        } else {
          console.warn("Error registering category:", catErr);
        }
      }
      // --- FIN NUEVO ---

      // Verify ownership
      const owner = await contract.ownerOf(parsedTokenId);
      const signerAddr = await signer.getAddress();
      if (owner.toLowerCase() !== signerAddr.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Check already listed
      try {
        const listed = await contract.getListedToken(parsedTokenId);
        if (listed.isForSale || listed[4]) {
          throw new Error('This NFT is already listed for sale');
        }
      } catch {
        // Si falla, asumimos que no está listado
      }

      // Send transaction
      const tx = await contract.listTokenForSale(
        parsedTokenId,
        priceWei,
        categoryToSend,
        { gasLimit: BigInt(500000) }
      );

      setTxHash(tx.hash);
      const receipt = await tx.wait();
      setSuccess(true);
      return { txHash: tx.hash, receipt };
    } catch (err) {
      // Mapea errores específicos del contrato si aplica
      if (err.data) {
        const sig = err.data;
        const errorSignatures = {
          '0x8f563f02': 'CategoryNotValid',
          '0x82b42960': 'Unauthorized',
          '0x677510db': 'TokenDoesNotExist',
          '0x037eff13': 'TokenNotForSale',
          '0x356680b7': 'InsufficientFunds',
          '0xb4fa3fb3': 'InvalidInput',
          '0x0df56d4f': 'SectionPaused',
        };
        const msg = errorSignatures[sig] || 'Unknown contract error';
        setError(msg);
      } else {
        setError(err.message || 'Failed to list NFT');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { listNFT, loading, error, success, txHash };
}
