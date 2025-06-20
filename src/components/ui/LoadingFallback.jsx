import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingFallback = ({ height = "300px", message = "", variant = "gradient", size = "default" }) => {
  return (
    <div 
      className="flex justify-center items-center"
      style={{ height }}
    >
      <LoadingSpinner 
        size={size}
        variant={variant}
        text={message || "Loading..."}
        showDots={true}
        className="text-purple-400"
      />
    </div>
  );
};

export default LoadingFallback;
