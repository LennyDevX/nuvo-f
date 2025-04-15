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
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    setCurrentSrc(src); // Reset to original source when src changes
  }, [src]);

  // No intentamos convertir a WebP automáticamente para evitar problemas
  // Esta era una fuente común de errores

  const handleError = (e) => {
    console.error("Error loading image:", src);
    setError(true);
    // No intentamos fallback automático ya que puede causar bucles
  };

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
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-500/10 text-white text-xs">
          ⚠️ Error
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        loading={loadingStrategy}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${error ? 'hidden' : ''}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain', ...props.style }}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
