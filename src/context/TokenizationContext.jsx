import React, { createContext, useState, useContext, useRef } from 'react';

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
  
  // Refs - Eliminamos referencias a cámara/canvas
  const fileInputRef = useRef(null);
  
  // Reset form function
  const resetForm = () => {
    setCurrentStep('upload'); // Cambiar de 'capture' a 'upload'
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
        resetForm
      }}
    >
      {children}
    </TokenizationContext.Provider>
  );
};

export const useTokenization = () => useContext(TokenizationContext);

export default TokenizationContext;
