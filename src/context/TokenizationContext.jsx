import React, { createContext, useState, useContext, useRef } from 'react';

const TokenizationContext = createContext();

export const TokenizationProvider = ({ children }) => {
  // State management
  const [currentStep, setCurrentStep] = useState('capture');
  const [image, setImage] = useState(null);
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
  
  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Reset form function
  const resetForm = () => {
    setCurrentStep('capture');
    setImage(null);
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
        videoRef,
        canvasRef,
        streamRef,
        resetForm
      }}
    >
      {children}
    </TokenizationContext.Provider>
  );
};

export const useTokenization = () => useContext(TokenizationContext);

export default TokenizationContext;
