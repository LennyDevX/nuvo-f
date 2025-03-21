import React from 'react';

/**
 * Reusable beta badge component that can be added to any element
 */
const BetaBadge = ({ className = "", size = "normal", pulsate = false }) => {
  // Determine size classes
  const sizeClasses = {
    small: "text-[8px] px-1 py-0.5",
    normal: "text-xs px-1.5 py-0.5",
    large: "text-sm px-2 py-1"
  };
  
  return (
    <span 
      className={`
        inline-flex items-center justify-center 
        bg-gradient-to-r from-pink-500 to-purple-600 
        text-white font-bold rounded-md
        shadow-sm 
        uppercase tracking-wider
        select-none
        ${sizeClasses[size]} 
        ${pulsate ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      Beta
    </span>
  );
};

export default BetaBadge;
