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
  
  // List of CSP-compliant gateways to try in order
  const gateways = [
    null, // First try the provided URL with CSP compliance
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];
  
  // Try the next gateway when an image fails to load
  const tryNextGateway = () => {
    if (fallbackIndex < gateways.length - 1) {
      setFallbackIndex(prevIndex => prevIndex + 1);
    } else {
      // If all gateways fail, use the placeholder
      setError(true);
      setLoading(false);
      if (onError) onError();
    }
  };
  
  // Process the image URL when src or fallback index changes
  useEffect(() => {
    if (!src) {
      setImageSrc(placeholderSrc);
      setLoading(false);
      setError(true);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    let newSrc;
    if (fallbackIndex === 0) {
      // Use our CSP-compliant function first
      newSrc = getCSPCompliantImageURL(src);
    } else if (src.startsWith('ipfs://')) {
      // If that fails, try the next gateway
      newSrc = gateways[fallbackIndex] + src.substring(7);
    } else if (/^Qm[1-9A-Za-z]{44}/.test(src) || /^bafy/.test(src)) {
      // For raw CIDs
      newSrc = gateways[fallbackIndex] + src;
    } else {
      // For URLs, try to extract IPFS path if possible
      const ipfsPathMatch = src.match(/\/ipfs\/(Qm[1-9A-Za-z]{44}|bafy[A-Za-z0-9]+)(\/.*)?/);
      if (ipfsPathMatch) {
        const cid = ipfsPathMatch[1];
        const subpath = ipfsPathMatch[2] || '';
        newSrc = gateways[fallbackIndex] + cid + subpath;
      } else {
        // Not an IPFS URL
        newSrc = src;
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
          setLoading(false);
          if (onLoad) onLoad();
        }}
        onError={() => tryNextGateway()}
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
