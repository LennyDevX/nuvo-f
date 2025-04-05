import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loadingStrategy = 'lazy',
  placeholderColor = 'rgba(139, 92, 246, 0.1)',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  // Determine if modern format is available
  const imgSrc = src.endsWith('.jpg') || src.endsWith('.png') 
    ? src.substring(0, src.lastIndexOf('.')) + '.webp'
    : src;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        backgroundColor: placeholderColor,
        width: width || 'auto',
        height: height || 'auto'
      }}
    >
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" 
             style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        loading={loadingStrategy}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          // Fallback to original format if WebP fails
          if (imgSrc !== src) {
            e.currentTarget.src = src;
          } else {
            setError(true);
          }
        }}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
