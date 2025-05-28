import React, { useState, useEffect, useCallback, useRef } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loadingStrategy = 'lazy',
  placeholderColor = 'rgba(139, 92, 246, 0.1)',
  priority = false,
  sizes,
  quality = 75,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef(null);
  const timeoutRef = useRef(null);
  const observerRef = useRef(null);

  // Debounced src update to prevent rapid re-renders
  const debouncedSrcUpdate = useCallback((newSrc) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setCurrentSrc(newSrc);
      setIsLoaded(false);
      setError(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (src) {
      debouncedSrcUpdate(src);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, debouncedSrcUpdate]);

  // Intersection Observer for better lazy loading control
  useEffect(() => {
    if (!priority && loadingStrategy === 'lazy' && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.loading = 'eager';
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { 
          rootMargin: '50px',
          threshold: 0.1 
        }
      );
      
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, loadingStrategy]);

  // Preload critical images
  useEffect(() => {
    if (priority && currentSrc) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = currentSrc;
      if (sizes) link.imageSizes = sizes;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, currentSrc, sizes]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback((e) => {
    console.error("Error loading image:", currentSrc);
    setError(true);
  }, [currentSrc]);

  // Generate optimized src with quality parameter
  const getOptimizedSrc = useCallback((originalSrc) => {
    if (!originalSrc) return '';
    
    // If it's a URL with query params, append quality
    const url = new URL(originalSrc, window.location.origin);
    if (!url.searchParams.has('q') && !url.searchParams.has('quality')) {
      url.searchParams.set('q', quality.toString());
    }
    
    return url.toString();
  }, [quality]);

  const optimizedSrc = getOptimizedSrc(currentSrc);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        backgroundColor: placeholderColor, // asegúrate que sea 'transparent'
        width: width || 'auto',
        height: height || 'auto'
      }}
    >
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'transparent', // <-- fuerza fondo transparente
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear'
          }}
        />
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs" style={{background: 'transparent'}}>
          ⚠️ Error
        </div>
      )}
      
      {optimizedSrc && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : loadingStrategy}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${error ? 'hidden' : ''}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            background: 'transparent', // <-- fuerza fondo transparente en la imagen
            ...props.style 
          }}
          {...props}
        />
      )}
    </div>
  );
};

// Enhanced memoization with custom comparison
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.priority === nextProps.priority &&
    prevProps.quality === nextProps.quality
  );
};

export default React.memo(OptimizedImage, areEqual);
