import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCSPCompliantImageURL } from '../../utils/blockchain/blockchainUtils';
import { imageCache } from '../../utils/blockchain/imageCache';
import LoadingSpinner from './LoadingSpinner';

const DEFAULT_PLACEHOLDER = '/LogoNuvos.webp';

/**
 * Component for handling IPFS images with proper loading states and CSP-compliant gateway fallbacks
 */
const IPFSImage = ({
  src,
  alt = 'NFT Image',
  placeholderSrc = DEFAULT_PLACEHOLDER,
  className = '',
  style = {},
  onLoad = null,
  onError = null,
  loading = "lazy",
  ...rest
}) => {
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    currentSrc: placeholderSrc,
    gatewayIndex: 0
  });
  
  const imgRef = useRef(null);
  const mountedRef = useRef(true);
  const loadAttemptRef = useRef(0);
  
  // Memoize the gateways list to prevent recreating on every render
  const gateways = useMemo(() => [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://nftstorage.link/ipfs/'
  ], []);

  // Memoize the processed URL to prevent recalculation
  const processedUrl = useMemo(() => {
    if (!src) return placeholderSrc;
    
    const cacheKey = `${src}-${imageState.gatewayIndex}`;
    const cached = imageCache.get(cacheKey);
    if (cached) return cached;
    
    let url;
    
    if (imageState.gatewayIndex === 0) {
      url = getCSPCompliantImageURL(src);
    } else {
      const gatewayIndex = imageState.gatewayIndex - 1;
      if (gatewayIndex < gateways.length) {
        if (src.startsWith('ipfs://')) {
          const hash = src.substring(7);
          url = gateways[gatewayIndex] + hash;
        } else if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[A-Za-z0-9]+)$/.test(src)) {
          url = gateways[gatewayIndex] + src;
        } else {
          const ipfsMatch = src.match(/\/ipfs\/(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[A-Za-z0-9]+)(\/.*)?/);
          if (ipfsMatch) {
            const cid = ipfsMatch[1];
            const subpath = ipfsMatch[2] || '';
            url = gateways[gatewayIndex] + cid + subpath;
          } else {
            url = getCSPCompliantImageURL(src);
          }
        }
      } else {
        url = placeholderSrc;
      }
    }
    
    if (url && url !== placeholderSrc) {
      imageCache.set(cacheKey, url);
    }
    
    return url;
  }, [src, imageState.gatewayIndex, gateways, placeholderSrc]);

  // Handle image load success
  const handleImageLoad = () => {
    if (!mountedRef.current) return;
    
    setImageState(prev => ({
      ...prev,
      loading: false,
      error: false,
      currentSrc: processedUrl
    }));
    
    if (onLoad) onLoad();
  };

  // Handle image load error
  const handleImageError = () => {
    if (!mountedRef.current) return;
    
    const nextGatewayIndex = imageState.gatewayIndex + 1;
    const maxAttempts = gateways.length + 1;
    
    if (nextGatewayIndex >= maxAttempts) {
      // All gateways exhausted, show placeholder
      setImageState(prev => ({
        ...prev,
        loading: false,
        error: true,
        currentSrc: placeholderSrc,
        gatewayIndex: nextGatewayIndex
      }));
      
      if (onError) onError();
    } else {
      // Try next gateway
      setImageState(prev => ({
        ...prev,
        gatewayIndex: nextGatewayIndex,
        loading: true,
        error: false
      }));
    }
  };

  // Main effect - only run when src changes
  useEffect(() => {
    mountedRef.current = true;
    loadAttemptRef.current += 1;
    const currentAttempt = loadAttemptRef.current;
    
    // Reset state when src changes
    setImageState({
      loading: true,
      error: false,
      currentSrc: processedUrl,
      gatewayIndex: 0
    });
    
    return () => {
      mountedRef.current = false;
      // Cancel this attempt if component unmounts
      if (loadAttemptRef.current === currentAttempt) {
        loadAttemptRef.current += 1;
      }
    };
  }, [src]); // Only depend on src

  // Update currentSrc when processedUrl changes
  useEffect(() => {
    if (!mountedRef.current) return;
    
    setImageState(prev => ({
      ...prev,
      currentSrc: processedUrl
    }));
  }, [processedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={style}>
      {imageState.loading && !imageState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <LoadingSpinner 
            size="small" 
            variant="ripple" 
            className="text-purple-400"
          />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageState.currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className="w-full h-full object-cover"
        style={{ 
          opacity: imageState.loading ? 0 : 1, 
          transition: 'opacity 0.3s ease-in-out' 
        }}
        {...rest}
      />
    </div>
  );
};

export default React.memo(IPFSImage, (prevProps, nextProps) => {
  // Only re-render if src or alt changes
  return prevProps.src === nextProps.src && prevProps.alt === nextProps.alt;
});