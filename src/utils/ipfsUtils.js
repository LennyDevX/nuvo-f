/**
 * Utility functions for handling IPFS URLs
 */

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
 * @param {string} cidOrUrl - Either a CID or an IPFS URL
 * @param {number} gatewayIndex - The index of the gateway to use
 * @param {boolean} useFallback - Whether to use the default placeholder as fallback
 * @returns {string} A properly formatted IPFS URL
 */
export const createIpfsUrl = (cidOrUrl, gatewayIndex = 0, useFallback = true) => {
  if (!cidOrUrl) return useFallback ? DEFAULT_PLACEHOLDER : null;
  
  // If it's a data URI, return it as is
  if (cidOrUrl.startsWith('data:')) {
    return cidOrUrl;
  }

  // If it's a complete URL with http/https that's not IPFS related, return it
  if ((cidOrUrl.startsWith('http://') || cidOrUrl.startsWith('https://')) && 
      !cidOrUrl.includes('/ipfs/')) {
    return cidOrUrl;
  }
  
  const cid = extractIpfsCid(cidOrUrl);
  if (!cid) return useFallback ? cidOrUrl : DEFAULT_PLACEHOLDER; // If we can't extract a CID, return the original URL or placeholder
  
  // Use the specified gateway or default to the first one
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  
  return `${gateway}${cid}`;
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
 * @param {string} cidOrUrl - Either a CID or an IPFS URL
 * @param {Object} fetchOptions - Options for the fetch call
 * @param {boolean} returnPlaceholderOnError - Whether to return placeholder data on error
 * @returns {Promise<Response>} The fetch response
 */
export const fetchFromIpfs = async (cidOrUrl, fetchOptions = {}, returnPlaceholderOnError = true) => {
  // Special handling for data URIs
  if (cidOrUrl && cidOrUrl.startsWith('data:')) {
    const decodedData = decodeDataUri(cidOrUrl);
    if (decodedData) {
      // Create a mock response with the decoded data
      return {
        ok: true,
        json: () => Promise.resolve(decodedData),
        text: () => Promise.resolve(JSON.stringify(decodedData)),
        headers: {
          get: () => 'application/json'
        }
      };
    }
  }
  
  const cid = extractIpfsCid(cidOrUrl);
  if (!cid) {
    // If we can't extract a CID, try the original URL
    try {
      return await fetch(cidOrUrl, fetchOptions);
    } catch (error) {
      console.error(`Failed to fetch from URL ${cidOrUrl}:`, error);
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
  }
  
  // Try each gateway in order
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    const url = createIpfsUrl(cid, i, false);
    try {
      console.log(`Intentando cargar desde: ${url}`);
      const response = await fetch(url, fetchOptions);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.error(`Gateway ${url} falló:`, error);
    }
  }
  
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
  
  throw new Error('Falló la carga desde todos los gateways IPFS');
};
