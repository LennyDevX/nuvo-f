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
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold bg-nuvo-gradient-text bg-clip-text text-transparent  text-center">Asset Details</h2>
      <p className="text-gray-300 text-center">Provide information about your digital asset</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square bg-black/30 rounded-xl overflow-hidden border border-purple-500/30 shadow-lg">
          {image && (
            <img 
              src={image} 
              alt="Asset" 
              className="w-full h-full object-contain"
            />
          )}
        </div>
        
        <form onSubmit={handleSubmitMetadata} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={metadata.name}
              onChange={handleMetadataChange}
              required
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
              placeholder="Unique Digital Collectible"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
              placeholder="Describe your asset in detail - what makes it special?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={metadata.category}
              onChange={handleMetadataChange}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
            >
              <option value="collectible">Collectible</option>
              <option value="artwork">Artwork</option>
              <option value="item">Consumer Item</option>
              <option value="document">Document</option>
              <option value="realestate">Real Estate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Physical Location (optional)
            </label>
            <input
              type="text"
              name="physicalLocation"
              value={metadata.physicalLocation}
              onChange={handleMetadataChange}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all"
              placeholder="Private collection, New York"
            />
          </div>
          
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20 mt-2">
            <p className="text-sm text-blue-300 flex items-start">
              <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>Adding detailed information increases your asset's value and authenticity.</span>
            </p>
          </div>
          
          <div className="pt-4 flex gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center gap-2"
              onClick={() => {
                setCurrentStep('upload');
                setImage(null);
              }}
            >
              <FaArrowLeft /> Back
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex-1 flex items-center justify-center gap-2 shadow-lg"
            >
              Continue <FaArrowRight />
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default MetadataStep;
