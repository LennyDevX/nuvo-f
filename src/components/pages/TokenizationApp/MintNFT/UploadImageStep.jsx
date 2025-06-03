import React from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';
import OptimizedImage from '../../../image/OptimizedImage';

const UploadImageStep = () => {
  const {
    setCurrentStep,
    setImage,
    setImageFile,
    fileInputRef,
    image // <-- asegúrate de que image esté disponible en el contexto
  } = useTokenization();
  
  // File upload handling
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Guardamos el archivo original para subir a Pinata
      setImageFile(file);
      
      // Y creamos una URL para visualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setCurrentStep('metadata');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Sube tu Imagen</h2>
        <p className="text-sm sm:text-base text-gray-300">Selecciona una imagen para tu NFT</p>
      </div>
      
      {/* Mobile: Stack content, Desktop: Keep original layout */}
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Preview section - show first on mobile if image exists, ajustar altura */}
        {image && (
          <div className="order-1 sm:order-none flex justify-center">
            <OptimizedImage
              src={image}
              alt="Preview"
              className="max-h-40 sm:max-h-56 lg:max-h-64 w-auto rounded-lg border border-purple-500/20 shadow-lg"
              style={{ 
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        {/* Upload section - moved below on mobile */}
        <div className="order-2 sm:order-none bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden p-4 sm:p-6 lg:p-8 border border-white/20 border-dashed">
          <div className="flex flex-col items-center justify-center text-center">
            <FaImage className="text-purple-400 text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3" />
            
            <h3 className="text-white text-sm sm:text-base font-medium mb-1 sm:mb-2">
              <span className="hidden sm:inline">Arrastra y suelta tu archivo aquí</span>
              <span className="sm:hidden">Selecciona tu imagen</span>
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
              <span className="hidden sm:inline">O haz clic para seleccionar un archivo</span>
              <span className="sm:hidden">Toca para elegir archivo</span>
            </p>
            <p className="text-gray-500 text-xs mb-3 sm:mb-4">PNG, JPG, GIF o WEBP (Max. 10MB)</p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 touch-manipulation"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload /> 
              <span className="text-sm sm:text-base">Seleccionar Archivo</span>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </motion.button>
          </div>
        </div>
        
        {/* Info box */}
        <div className="order-3 sm:order-none p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <p className="text-xs sm:text-sm text-purple-300">
            Tu imagen será almacenada permanentemente en IPFS y vinculada a tu NFT en la blockchain.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadImageStep;