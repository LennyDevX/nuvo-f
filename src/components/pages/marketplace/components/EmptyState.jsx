import React from 'react';
import { FiPackage, FiFilter } from 'react-icons/fi';

const EmptyState = ({ message, showFilters = false }) => {
  return (
    <div className="nuvos-card bg-background-dark/90 text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-primary/10 rounded-full mb-6">
        {showFilters ? (
          <FiFilter className="w-10 h-10 text-purple-400" />
        ) : (
          <FiPackage className="w-10 h-10 text-purple-400" />
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">
        {message}
      </h3>
      <p className="text-gray-400 max-w-md mx-auto">
        {showFilters 
          ? "Try adjusting your search filters or browse all categories."
          : "Be the first to mint and list an NFT on our marketplace!"
        }
      </p>
    </div>
  );
};

export default EmptyState;
