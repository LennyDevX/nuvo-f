import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../utils/blockchain/blockchainUtils';
import { imageCache } from '../utils/blockchain/imageCache';
import useUserNFTs from '../hooks/nfts/useUserNFTs';
import useMintNFT from '../hooks/nfts/useMintNFT';
import MarketplaceABI from '../Abi/Marketplace.json';

const TokenizationContext = createContext();

// Marketplace contract configuration
const MARKETPLACE_CONFIG = {
  address: import.meta.env.VITE_TOKENIZATION_ADDRESS_V2,
  abi: MarketplaceABI.abi,
  fallbackAddress: "0xe8f1A205ACf4dBbb08d6d8856ae76212B9AE7582"
};

export const TokenizationProvider = ({ children }) => {
  // State management
  const [currentStep, setCurrentStep] = useState('upload'); // Cambiar de 'capture' a 'upload'
  const [image, setImage] = useState(null); // URL para visualización
  const [imageFile, setImageFile] = useState(null); // Objeto File/Blob para subir a Pinata
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    category: 'collectible',
    physicalLocation: '',
    quantity: 1  // Agregar cantidad
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintingError, setMintingError] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [ipfsImageUri, setIpfsImageUri] = useState(null); // Add IPFS URI state
  const [ipfsMetadataUri, setIpfsMetadataUri] = useState(null); // Add IPFS URI state
  
  // Account state for NFT hooks
  const [userAccount, setUserAccount] = useState(null);
  
  // Centralize NFT hooks
  const { 
    nfts, 
    loading: nftsLoading, 
    error: nftsError, 
    refreshNFTs,
    cacheStatus 
  } = useUserNFTs(userAccount);
  
  const { 
    mintNFT: mintNFTHook, 
    loading: mintLoading, 
    error: mintError, 
    txHash: mintTxHash 
  } = useMintNFT();
  
  // Function to update user account
  const updateUserAccount = useCallback((account) => {
    setUserAccount(account);
  }, []);
  
  // Refs - Eliminamos referencias a cámara/canvas
  const fileInputRef = useRef(null);
  
  // Reset form function
  const resetForm = () => {
    setCurrentStep('upload');
    setImage(null);
    setImageFile(null);
    setMetadata({
      name: '',
      description: '',
      category: 'collectible',
      physicalLocation: '',
      quantity: 1
    });
    setMintedNFT(null);
    setMintingError(null);
    setIpfsImageUri(null);
    setIpfsMetadataUri(null);  };
  
  // Function to upload image to IPFS with caching
  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      // Check if we already have this file cached by creating a simple hash
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      const cached = imageCache.get(fileKey);
      if (cached) {
        setIpfsImageUri(cached);
        return cached;
      }
      
      const imageUri = await uploadFileToIPFS(file);
      setIpfsImageUri(imageUri);
      
      // Cache the result
      imageCache.set(fileKey, imageUri);
      
      return imageUri;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Function to upload metadata to IPFS with caching
  const handleMetadataUpload = async (metadataObj) => {
    setIsUploading(true);
    try {
      // Create a hash of the metadata for caching
      const metadataKey = `metadata-${JSON.stringify(metadataObj)}`;
      const cached = imageCache.get(metadataKey);
      if (cached) {
        setIpfsMetadataUri(cached);
        return cached;
      }
      
      const metadataUri = await uploadJsonToIPFS(metadataObj);
      setIpfsMetadataUri(metadataUri);
      
      // Cache the result
      imageCache.set(metadataKey, metadataUri);
      
      return metadataUri;
    } catch (error) {
      console.error("Failed to upload metadata:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Wrapper for mintNFT to maintain consistent interface
  const mintNFT = useCallback(async (nftData) => {
    try {
      setMintingError(null);
      setIsMinting(true);
      
      const result = await mintNFTHook(nftData);
      
      if (result && result.success) {
        setMintedNFT(result);
        return result;
      } else {
        throw new Error('Minting failed: No result returned');
      }
    } catch (error) {
      console.error('Error in TokenizationContext mintNFT:', error);
      setMintingError(error.message || 'Failed to mint NFT');
      throw error;
    } finally {
      setIsMinting(false);
    }
  }, [mintNFTHook]);

  return (
    <TokenizationContext.Provider
      value={{
        // Original tokenization states
        currentStep,
        setCurrentStep,
        image,
        setImage,
        imageFile,
        setImageFile,
        isUploading,
        setIsUploading,
        metadata,
        setMetadata,
        isMinting,
        setIsMinting,
        mintingError,
        setMintingError,
        mintedNFT,
        setMintedNFT,
        fileInputRef,
        resetForm,
        ipfsImageUri,
        ipfsMetadataUri,
        handleImageUpload,
        handleMetadataUpload,
        
        // NFT related states and functions
        nfts,
        nftsLoading,
        nftsError,
        refreshNFTs,
        cacheStatus,
        mintNFT,
        mintLoading,
        mintError,
        mintTxHash,
        updateUserAccount,
        userAccount,
        
        // Marketplace configuration for V2
        marketplaceConfig: MARKETPLACE_CONFIG
      }}
    >
      {children}
    </TokenizationContext.Provider>
  );
};

export const useTokenization = () => {
  const context = useContext(TokenizationContext);
  if (context === undefined) {
    console.error("useTokenization must be used within a TokenizationProvider");
    return {
      nfts: [],
      nftsLoading: false,
      nftsError: null,
      refreshNFTs: () => console.warn("TokenizationProvider not available"),
      cacheStatus: null,
      mintNFT: () => {
        console.warn("TokenizationProvider not available");
        return Promise.reject("TokenizationProvider not available");
      },
      mintLoading: false,
      mintError: null,
      mintTxHash: null,
      updateUserAccount: () => console.warn("TokenizationProvider not available"),
      userAccount: null,
      // Include other necessary default values
      currentStep: 'upload',
      setCurrentStep: () => {},
      image: null,
      setImage: () => {},
      imageFile: null,
      setImageFile: () => {},
      isUploading: false,
      setIsUploading: () => {},
      metadata: {},
      setMetadata: () => {},
      isMinting: false,
      setIsMinting: () => {},
      mintingError: null,
      setMintingError: () => {},
      mintedNFT: null,
      setMintedNFT: () => {},
      resetForm: () => {},
      ipfsImageUri: null,
      ipfsMetadataUri: null,
      handleImageUpload: () => Promise.reject("TokenizationProvider not available"),
      handleMetadataUpload: () => Promise.reject("TokenizationProvider not available"),
    };
  }
  return context;
};

export default TokenizationContext;
