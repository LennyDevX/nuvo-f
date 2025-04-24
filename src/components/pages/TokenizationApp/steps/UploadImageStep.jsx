import React from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';

const UploadImageStep = () => {
  const {
    setCurrentStep,
    setImage,
    setImageFile,
    fileInputRef
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
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white">Sube tu Imagen</h2>
      <p className="text-gray-300">Selecciona una imagen para tu NFT</p>
      
      <div className="bg-black/20 rounded-xl overflow-hidden p-10 border border-purple-500/30 border-dashed">
        <div className="flex flex-col items-center justify-center text-center">
          <FaImage className="text-purple-400 text-5xl mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Arrastra y suelta tu archivo aquí</h3>
          <p className="text-gray-400 text-sm mb-4">O haz clic para seleccionar un archivo</p>
          <p className="text-gray-500 text-xs mb-6">PNG, JPG, GIF o WEBP (Max. 10MB)</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload /> Seleccionar Archivo
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
      
      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
        <p className="text-sm text-purple-300">
          Tu imagen será almacenada permanentemente en IPFS y vinculada a tu NFT en la blockchain.
        </p>
      </div>
    </motion.div>
  );
};

export default UploadImageStep;