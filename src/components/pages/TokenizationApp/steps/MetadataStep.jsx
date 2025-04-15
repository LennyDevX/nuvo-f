import React from 'react';
import { motion } from 'framer-motion';
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
      <h2 className="text-2xl font-bold text-white">Asset Details</h2>
      <p className="text-gray-300">Provide information about your physical asset</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square bg-black/20 rounded-xl overflow-hidden">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={metadata.name}
              onChange={handleMetadataChange}
              required
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Vintage Watch Collection"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Limited edition vintage watch from 1970s in excellent condition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={metadata.category}
              onChange={handleMetadataChange}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              <option value="collectible">Collectible</option>
              <option value="artwork">Artwork</option>
              <option value="item">Consumer Item</option>
              <option value="document">Document</option>
              <option value="realestate">Real Estate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Physical Location (optional)
            </label>
            <input
              type="text"
              name="physicalLocation"
              value={metadata.physicalLocation}
              onChange={handleMetadataChange}
              className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Private collection, New York"
            />
          </div>
          
          <div className="pt-4 flex gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium"
              onClick={() => {
                setCurrentStep('capture');
                setImage(null);
              }}
            >
              Back
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex-1"
            >
              Continue
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default MetadataStep;
