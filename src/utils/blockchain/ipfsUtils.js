/**
 * Utility functions for handling IPFS URLs
 * This extends the functionality in blockchainUtils.js
 */
import { ipfsToHttp, fetchTokenMetadata } from './blockchainUtils';

/**
 * Default placeholder image to use when IPFS content cannot be loaded
 */
export const DEFAULT_PLACEHOLDER = '/LogoNuvos.webp';

/**
 * List of supported IPFS gateways
 */
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

/**
 * Extracts the CID from a potentially malformed IPFS URL
 * @param {string} url - The IPFS URL
 * @returns {string} The extracted CID
 */
export const extractIpfsCid = (url) => {
  if (!url) return null;
  
  // If it's a data URI, don't try to extract a CID
  if (url.startsWith('data:')) {
    return null;
  }
  
  // If it's already just a CID, return it
  if (url.match(/^Qm[a-zA-Z0-9]{44}$/) || url.match(/^bafy[a-zA-Z0-9]{44}$/)) {
    return url;
  }
  
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  
  // Handle URLs with /ipfs/ path
  const ipfsPathMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)(?:\/.*)?$/);
  if (ipfsPathMatch && ipfsPathMatch[1]) {
    return ipfsPathMatch[1];
  }
  
  // Handle malformed double gateway URLs
  const doubleGatewayMatch = url.match(/https:\/\/[^/]+\/ipfs\/https:\/\/[^/]+\/ipfs\/([a-zA-Z0-9]+)/);
  if (doubleGatewayMatch && doubleGatewayMatch[1]) {
    return doubleGatewayMatch[1];
  }
  
  return null;
};

/**
 * Creates a proper IPFS URL using the preferred gateway
 * This is a compatibility function that calls ipfsToHttp from blockchainUtils
 * @param {string} cidOrUrl - Either a CID or an IPFS URL
 * @param {number} gatewayIndex - The index of the gateway to use
 * @param {boolean} useFallback - Whether to use the default placeholder as fallback
 * @returns {string} A properly formatted IPFS URL
 */
export const createIpfsUrl = (cidOrUrl, gatewayIndex = 0, useFallback = true) => {
  if (!cidOrUrl) return useFallback ? DEFAULT_PLACEHOLDER : null;
  
  // Use the gateway corresponding to the index
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  
  // Call the unified function from blockchainUtils
  return ipfsToHttp(cidOrUrl, gateway) || (useFallback ? DEFAULT_PLACEHOLDER : null);
};

/**
 * Decodes a data URI containing JSON
 * @param {string} dataUri - The data URI to decode
 * @returns {Object|null} The decoded JSON object or null if invalid
 */
export const decodeDataUri = (dataUri) => {
  if (!dataUri || !dataUri.startsWith('data:')) return null;
  
  try {
    // Extract the content after the comma
    const base64Content = dataUri.split(',')[1];
    // For JSON data URIs that are URL encoded (not base64)
    const decodedContent = decodeURIComponent(base64Content);
    return JSON.parse(decodedContent);
  } catch (error) {
    console.error('Failed to decode data URI:', error);
    return null;
  }
};

/**
 * Tries to fetch from all available gateways until one succeeds
 * This is a compatibility function that uses fetchTokenMetadata
 * @param {string} cidOrUrl - Either a CID or an IPFS URL
 * @param {Object} fetchOptions - Options for the fetch call
 * @param {boolean} returnPlaceholderOnError - Whether to return placeholder data on error
 * @returns {Promise<Response>} The fetch response
 */
export const fetchFromIpfs = async (cidOrUrl, fetchOptions = {}, returnPlaceholderOnError = true) => {
  try {
    // Try to use the enhanced fetchTokenMetadata first
    const metadata = await fetchTokenMetadata(cidOrUrl);
    
    // Convert to response-like object for compatibility
    return {
      ok: true,
      json: () => Promise.resolve(metadata),
      text: () => Promise.resolve(JSON.stringify(metadata)),
      headers: {
        get: () => 'application/json'
      }
    };
  } catch (error) {
    console.error(`Failed to fetch from IPFS ${cidOrUrl}:`, error);
    
    if (returnPlaceholderOnError) {
      // Return a mock response with placeholder data
      return {
        ok: true,
        json: () => Promise.resolve({
          name: 'Metadata no disponible',
          description: 'No se pudo cargar la información del NFT',
          image: DEFAULT_PLACEHOLDER,
          error: true
        }),
        text: () => Promise.resolve('Metadata no disponible'),
        headers: {
          get: () => 'application/json'
        }
      };
    }
    throw error;
  }
};

// Export ipfsToHttp from blockchainUtils for convenience
export { ipfsToHttp, fetchTokenMetadata } from './blockchainUtils';
