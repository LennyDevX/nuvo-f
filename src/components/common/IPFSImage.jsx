import { useState, useEffect } from 'react';
import { ipfsToHttp, fetchFromIPFSWithFallback } from '../../utils/blockchain/blockchainUtils';

const DEFAULT_PLACEHOLDER = '/NFT-placeholder.webp';

/**
 * Component that loads images from IPFS with fallbacks
 */
function IPFSImage({ src, alt, className, style }) {
  const [imageSrc, setImageSrc] = useState(DEFAULT_PLACEHOLDER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (!src) {
      setImageSrc(DEFAULT_PLACEHOLDER);
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    setLoading(true);
    setError(false);
    
    const loadImage = async () => {
      try {
        // If it's already an HTTP URL, try it directly first
        if (src.startsWith('http')) {
          try {
            const response = await fetch(src, { method: 'HEAD' });
            if (response.ok) {
              if (isMounted) {
                setImageSrc(src);
                setLoading(false);
              }
              return;
            }
          } catch (e) {
            console.warn('Direct fetch failed, trying IPFS gateways:', e);
          }
          
          // Try to extract IPFS path if it's a gateway URL
          const ipfsPath = src.match(/\/ipfs\/(Qm[1-9A-Za-z]{44}|bafy[A-Za-z0-9]+)(\/.*)?/);
          if (ipfsPath) {
            const cid = ipfsPath[1];
            const response = await fetchFromIPFSWithFallback(cid + (ipfsPath[2] || ''));
            if (isMounted) {
              setImageSrc(URL.createObjectURL(await response.blob()));
              setLoading(false);
            }
            return;
          }
        }
        
        // If it's an IPFS URI, use our gateway rotation
        if (src.startsWith('ipfs://')) {
          const response = await fetchFromIPFSWithFallback(src);
          if (isMounted) {
            setImageSrc(URL.createObjectURL(await response.blob()));
            setLoading(false);
          }
          return;
        }
        
        // Otherwise just use the src as is
        if (isMounted) {
          setImageSrc(src);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error loading image:', e);
        if (isMounted) {
          setError(true);
          setImageSrc(DEFAULT_PLACEHOLDER);
          setLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [src]);
  
  return (
    <img
      src={imageSrc}
      alt={alt || 'IPFS Image'}
      className={`${className || ''} ${loading ? 'opacity-50' : ''} ${error ? 'border-red-500' : ''}`}
      style={{
        ...style,
        transition: 'opacity 0.2s',
      }}
      onError={() => {
        setError(true);
        setImageSrc(DEFAULT_PLACEHOLDER);
      }}
    />
  );
}

export default IPFSImage;
