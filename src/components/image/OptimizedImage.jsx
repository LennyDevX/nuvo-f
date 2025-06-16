import React, { useState, useEffect, useCallback, useRef } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loadingStrategy = 'lazy',
  placeholderColor = 'transparent',
  priority = false,
  sizes,
  quality = 75,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const [shouldPreload, setShouldPreload] = useState(false);
  const imgRef = useRef(null);
  const timeoutRef = useRef(null);
  const observerRef = useRef(null);
  const preloadLinkRef = useRef(null);

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
              setShouldPreload(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { 
          rootMargin: '100px',
          threshold: 0.1 
        }
      );
      
      observerRef.current.observe(imgRef.current);
    } else if (priority) {
      // For priority images, preload immediately
      setShouldPreload(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, loadingStrategy]);

  // Optimized preload logic - only when actually needed
  useEffect(() => {
    if (shouldPreload && currentSrc && priority) {
      // Only preload if it's a priority image and we haven't already preloaded
      if (!preloadLinkRef.current) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getOptimizedSrc(currentSrc);
        if (sizes) link.imageSizes = sizes;
        
        // Add to head
        document.head.appendChild(link);
        preloadLinkRef.current = link;
        
        // Remove preload link after image loads or after timeout
        const cleanup = () => {
          if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
            document.head.removeChild(preloadLinkRef.current);
            preloadLinkRef.current = null;
          }
        };
        
        // Cleanup after 10 seconds or when component unmounts
        const timeoutId = setTimeout(cleanup, 10000);
        
        return () => {
          clearTimeout(timeoutId);
          cleanup();
        };
      }
    }
  }, [shouldPreload, currentSrc, priority, sizes]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    
    // Remove preload link once image is loaded
    if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
      document.head.removeChild(preloadLinkRef.current);
      preloadLinkRef.current = null;
    }
  }, []);

  const handleError = useCallback((e) => {
    console.error("Error loading image:", currentSrc);
    setError(true);
    
    // Remove preload link on error
    if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
      document.head.removeChild(preloadLinkRef.current);
      preloadLinkRef.current = null;
    }
  }, [currentSrc]);

  // Generate optimized src with quality parameter
  const getOptimizedSrc = useCallback((originalSrc) => {
    if (!originalSrc) return '';
    
    // Don't modify external URLs or data URLs
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }
    
    // For local images, add quality parameter if not present
    try {
      const url = new URL(originalSrc, window.location.origin);
      if (!url.searchParams.has('q') && !url.searchParams.has('quality')) {
        url.searchParams.set('q', quality.toString());
      }
      return url.toString();
    } catch {
      // Fallback for relative paths
      return originalSrc;
    }
  }, [quality]);

  const optimizedSrc = getOptimizedSrc(currentSrc);

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
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'transparent',
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
          loading={priority ? 'eager' : (shouldPreload ? 'eager' : 'lazy')}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${error ? 'hidden' : ''}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            background: 'transparent',
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
    prevProps.quality === nextProps.quality &&
    prevProps.loadingStrategy === nextProps.loadingStrategy
  );
};

export default React.memo(OptimizedImage, areEqual);
