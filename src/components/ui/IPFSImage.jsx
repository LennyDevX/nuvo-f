import React, { useState, useEffect } from 'react';
import { getCSPCompliantImageURL } from '../../utils/blockchain/blockchainUtils';

const DEFAULT_PLACEHOLDER = '/NFT-placeholder.webp';

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
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  
  // Enhanced list of CSP-compliant gateways with better ordering
  const gateways = [
    null, // First try the provided URL with CSP compliance
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://nftstorage.link/ipfs/',
    'https://w3s.link/ipfs/' // Additional gateway
  ];
  
  // Try the next gateway when an image fails to load
  const tryNextGateway = () => {
    console.log(`Image failed to load, trying next gateway. Current index: ${fallbackIndex}`);
    if (fallbackIndex < gateways.length - 1) {
      setFallbackIndex(prevIndex => prevIndex + 1);
    } else {
      // If all gateways fail, use the placeholder
      console.warn('All gateways failed for image:', src);
      setError(true);
      setLoading(false);
      if (onError) onError();
    }
  };
  
  // Process the image URL when src or fallback index changes
  useEffect(() => {
    if (!src) {
      console.log('No src provided, using placeholder');
      setImageSrc(placeholderSrc);
      setLoading(false);
      setError(true);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    let newSrc;
    
    console.log(`Processing image URL: ${src}, fallback index: ${fallbackIndex}`);
    
    if (fallbackIndex === 0) {
      // Use our CSP-compliant function first
      newSrc = getCSPCompliantImageURL(src);
      console.log(`Using CSP compliant URL: ${newSrc}`);
    } else if (src.startsWith('ipfs://')) {
      // If that fails, try the next gateway
      const ipfsHash = src.substring(7);
      newSrc = gateways[fallbackIndex] + ipfsHash;
      console.log(`Using IPFS gateway ${fallbackIndex}: ${newSrc}`);
    } else if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[A-Za-z0-9]+)$/.test(src)) {
      // For raw CIDs
      newSrc = gateways[fallbackIndex] + src;
      console.log(`Using gateway for raw CID: ${newSrc}`);
    } else {
      // For URLs, try to extract IPFS path if possible
      const ipfsPathMatch = src.match(/\/ipfs\/(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[A-Za-z0-9]+)(\/.*)?/);
      if (ipfsPathMatch && fallbackIndex > 0) {
        const cid = ipfsPathMatch[1];
        const subpath = ipfsPathMatch[2] || '';
        newSrc = gateways[fallbackIndex] + cid + subpath;
        console.log(`Extracted IPFS path, using gateway: ${newSrc}`);
      } else {
        // Not an IPFS URL or first attempt, use as-is but apply CSP compliance
        newSrc = getCSPCompliantImageURL(src);
        console.log(`Using original URL with CSP compliance: ${newSrc}`);
      }
    }
    
    setImageSrc(newSrc);
  }, [src, fallbackIndex, placeholderSrc]);
  
  return (
    <div className={`relative ${className}`} style={style}>
      {/* Main image */}
      <img 
        src={error ? placeholderSrc : imageSrc}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onLoad={() => {
          console.log(`Image loaded successfully: ${imageSrc}`);
          setLoading(false);
          if (onLoad) onLoad();
        }}
        onError={(e) => {
          console.warn(`Image failed to load: ${imageSrc}`);
          tryNextGateway();
        }}
        {...rest}
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default IPFSImage;
