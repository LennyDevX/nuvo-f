import React, { useState, useCallback, useEffect } from 'react';
import { getCSPCompliantImageURL } from '../../utils/blockchain/blockchainUtils';

const IPFSImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholderSrc = '/LogoNuvos.webp',
  onLoad,
  onError,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Check for problematic URLs immediately
    if (src && (
      src.includes('nuvos.app/nft-placeholder.png') ||
      src.includes('/nft-placeholder.png')
    )) {
      console.warn('IPFSImage: Detected problematic URL, using placeholder:', src);
      return placeholderSrc;
    }
    return getCSPCompliantImageURL(src) || placeholderSrc;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = useCallback((e) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    console.warn('IPFSImage: Image failed to load:', imgSrc, 'trying fallback');
    setIsLoading(false);
    
    if (imgSrc !== placeholderSrc && retryCount < 2) {
      setHasError(true);
      setRetryCount(prev => prev + 1);
      
      // Try alternative IPFS gateways
      if (retryCount === 0 && imgSrc.includes('ipfs.io')) {
        const newSrc = imgSrc.replace('ipfs.io/ipfs/', 'cloudflare-ipfs.com/ipfs/');
        console.log('IPFSImage: Retrying with cloudflare gateway:', newSrc);
        setImgSrc(newSrc);
        return;
      } else if (retryCount === 1 && imgSrc.includes('cloudflare-ipfs.com')) {
        const newSrc = imgSrc.replace('cloudflare-ipfs.com/ipfs/', 'dweb.link/ipfs/');
        console.log('IPFSImage: Retrying with dweb gateway:', newSrc);
        setImgSrc(newSrc);
        return;
      }
    }
    
    // Final fallback to placeholder
    if (imgSrc !== placeholderSrc) {
      console.log('IPFSImage: Using final fallback placeholder');
      setImgSrc(placeholderSrc);
    }
    
    onError?.(e);
  }, [imgSrc, placeholderSrc, onError, retryCount]);

  // Update src when prop changes
  useEffect(() => {
    // Check for problematic URLs immediately
    if (src && (
      src.includes('nuvos.app/nft-placeholder.png') ||
      src.includes('/nft-placeholder.png')
    )) {
      console.warn('IPFSImage: Detected problematic URL on update, using placeholder:', src);
      setImgSrc(placeholderSrc);
      setIsLoading(false);
      setHasError(false);
      setRetryCount(0);
      return;
    }
    
    const newSrc = getCSPCompliantImageURL(src) || placeholderSrc;
    if (newSrc !== imgSrc) {
      setImgSrc(newSrc);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, imgSrc, placeholderSrc]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        } ${className}`}
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
        </div>
      )}
      
      {hasError && !isLoading && retryCount > 0 && (
        <div className="absolute top-1 right-1 bg-orange-500/80 text-white text-xs px-1 py-0.5 rounded">
          ⚠
        </div>
      )}
    </div>
  );
};

export default IPFSImage;
