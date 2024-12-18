import React from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaImages, FaBox, FaPalette } from 'react-icons/fa';
import AirdropTypeOption from './AirdropTypeOption';

const AirdropTypeSelector = ({ formData, handleChange, getAirdropTypeStatus, error, airdropTypes }) => {
  return (
    <div className="space-y-4">
      <label className="block text-gray-300 mb-2">Select Airdrop Type</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {airdropTypes.map((type) => (
          <AirdropTypeOption 
            key={type.id}
            type={type}
            formData={formData}
            handleChange={handleChange}
            getAirdropTypeStatus={getAirdropTypeStatus}
          />
        ))}
      </div>
      {error && error.includes('airdrop type') && (
        <motion.p 
          className="text-red-400 text-sm mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default AirdropTypeSelector;