import React from 'react';

const LoadingFallback = ({ height = "300px", message = "" }) => {
  return (
    <div 
      className="flex justify-center items-center"
      style={{ height }}
    >
      {/* Static loading indicator with no animations for better performance */}
      <div className="text-purple-400 text-center">
        <div className="inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingFallback;
