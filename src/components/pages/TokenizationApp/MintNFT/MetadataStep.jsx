import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';

const MetadataStep = () => {
  const {
    image,
    metadata,
    setMetadata,
    setCurrentStep,
    setImage
  } = useTokenization();

  // Metadata form handling
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitMetadata = (e) => {
    e.preventDefault();
    setCurrentStep('preview');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-nuvo-gradient-text bg-clip-text text-transparent mb-2">Asset Details</h2>
        <p className="text-sm sm:text-base text-gray-300">Provide information about your digital asset</p>
      </div>
      
      {/* Mobile-first layout: form first on mobile, then image below */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Form section - first on mobile for better accessibility */}
        <form onSubmit={handleSubmitMetadata} className="space-y-3 sm:space-y-4 order-1 lg:order-2">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1 sm:mb-2">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={metadata.name}
              onChange={handleMetadataChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all text-sm sm:text-base"
              placeholder="Unique Digital Collectible"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              required
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all text-sm sm:text-base resize-none"
              placeholder="Describe your asset in detail - what makes it special?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1 sm:mb-2">
              Category
            </label>
            <select
              name="category"
              value={metadata.category}
              onChange={handleMetadataChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all text-sm sm:text-base"
            >
              <option value="collectible">Collectible</option>
              <option value="artwork">Artwork</option>
              <option value="photography">Photography</option>
              <option value="music">Music</option>
              <option value="video">Video</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1 sm:mb-2">
              Physical Location (optional)
            </label>
            <input
              type="text"
              name="physicalLocation"
              value={metadata.physicalLocation}
              onChange={handleMetadataChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all text-sm sm:text-base"
              placeholder="Private collection, New York"
            />
          </div>
          
          {/* Info box más sutil */}
          <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <p className="text-xs sm:text-sm text-blue-300 flex items-start">
              <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>Adding detailed information increases your asset's value and authenticity.</span>
            </p>
          </div>
          
          {/* Responsive buttons */}
          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center justify-center gap-2 touch-manipulation"
              onClick={() => {
                setCurrentStep('upload');
                setImage(null);
              }}
            >
              <FaArrowLeft /> Back
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg touch-manipulation"
            >
              Continue <FaArrowRight />
            </motion.button>
          </div>
        </form>
        
        {/* Image preview - moved below form on mobile, ajustar contenedor */}
        <div className="w-full max-w-xs mx-auto lg:max-w-none lg:mx-0 order-2 lg:order-1">
          <div className="aspect-square bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-lg">
            {image && (
              <img 
                src={image} 
                alt="Asset" 
                className="w-full h-full object-contain p-2"
                style={{ maxHeight: '100%' }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetadataStep;
