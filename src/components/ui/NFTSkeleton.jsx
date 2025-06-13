import React from 'react';
import { motion } from 'framer-motion';

const NFTSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="nuvos-card backdrop-blur-md overflow-hidden"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
            
            {/* Placeholder badges */}
            <div className="absolute top-2 right-2 w-12 h-6 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="absolute top-2 left-2 w-8 h-6 bg-gray-700 rounded-full animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="p-3 md:p-4 space-y-3">
            {/* Title */}
            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
            
            {/* Price and ID */}
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <div className="flex-1 h-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NFTSkeleton;
