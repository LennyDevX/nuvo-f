import React, { createContext, useState, useContext, useRef } from 'react';
import { uploadFileToIPFS, uploadJsonToIPFS } from '../utils/blockchain/blockchainUtils';

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
      // Use our enhanced IPFS upload utility
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
      // Use our enhanced IPFS upload utility
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

  return (
    <TokenizationContext.Provider
      value={{
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
        handleMetadataUpload
      }}
    >
      {children}
    </TokenizationContext.Provider>
  );
};

export const useTokenization = () => useContext(TokenizationContext);

export default TokenizationContext;
