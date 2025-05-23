import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../utils/blockchain/blockchainUtils';
import useUserNFTs from '../hooks/nfts/useUserNFTs';
import useMintNFT from '../hooks/nfts/useMintNFT';

const TokenizationContext = createContext();

export const TokenizationProvider = ({ children }) => {
  // State management
  const [currentStep, setCurrentStep] = useState('upload'); // Cambiar de 'capture' a 'upload'
  const [image, setImage] = useState(null); // URL para visualización
  const [imageFile, setImageFile] = useState(null); // Objeto File/Blob para subir a Pinata
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    attributes: [{ trait_type: 'Physical Condition', value: 'Excellent' }],
    category: 'collectible',
    physicalLocation: '',
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
    refreshNFTs 
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
      attributes: [{ trait_type: 'Physical Condition', value: 'Excellent' }],
      category: 'collectible',
      physicalLocation: '',
    });
    setMintedNFT(null);
    setMintingError(null);
    setIpfsImageUri(null);
    setIpfsMetadataUri(null);
  };
  
  // Function to upload image to IPFS
  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const imageUri = await uploadFileToIPFS(file);
      setIpfsImageUri(imageUri);
      return imageUri;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Function to upload metadata to IPFS
  const handleMetadataUpload = async (metadataObj) => {
    setIsUploading(true);
    try {
      const metadataUri = await uploadJsonToIPFS(metadataObj);
      setIpfsMetadataUri(metadataUri);
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
    return await mintNFTHook(nftData);
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
        mintNFT,
        mintLoading,
        mintError,
        mintTxHash,
        updateUserAccount,
        userAccount
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
    // Return default empty values to prevent destructuring errors
    return {
      nfts: [],
      nftsLoading: false,
      nftsError: null,
      refreshNFTs: () => console.warn("TokenizationProvider not available"),
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
