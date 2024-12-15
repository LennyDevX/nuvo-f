import React from 'react';
import { motion } from 'framer-motion';

const FormHeader = () => {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Join Our <span className='text-gradient bg-gradient-to-r from-purple-400 to-pink-500'>Airdrop Program</span>
      </h1>
      <p className="text-gray-300 text-lg">
        Subscribe to receive tokens, NFTs, and other digital assets directly to your Polygon wallet.
      </p>
    </motion.div>
  );
};

export default FormHeader;