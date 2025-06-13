import { ethers } from 'ethers';

// Enhanced ERC20 ABI with common functions
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

// ERC721 (NFT) ABI
const erc721Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

// Default image placeholder for NFTs and tokens - MUST be local path
export const DEFAULT_PLACEHOLDER = '/LogoNuvos.webp';

// Supported NFT APIs and their base URLs
const NFT_API_CONFIG = {
  alchemy: {
    baseUrl: (network, apiKey) => `https://${network}.g.alchemy.com/v2/${apiKey}/getNFTs/`,
    formatOwnerQuery: (address) => `?owner=${address}`
  },
  moralis: {
    baseUrl: (chainId) => `https://deep-index.moralis.io/api/v2/${chainId}/nft`,
    formatOwnerQuery: (address) => `/${address}`
  }
};

// API keys storage - fix the validation using correct env vars
const getApiKeys = () => {
  const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY || '';
  
  // Check for placeholder values or empty keys
  if (!alchemyKey || 
      alchemyKey.trim() === '' || 
      alchemyKey === 'YOUR_ALCHEMY_API_KEY_HERE' ||
      alchemyKey.includes('YOUR_') ||
      alchemyKey.length < 10) {
    console.warn('Invalid or missing Alchemy API key detected');
    return {
      alchemy: null,
      moralis: import.meta.env.VITE_MORALIS_API || '',
      polygonscan: import.meta.env.VITE_POLYGONSCAN_API || ''
    };
  }
  
  return {
    alchemy: alchemyKey,
    moralis: import.meta.env.VITE_MORALIS_API || '',
    polygonscan: import.meta.env.VITE_POLYGONSCAN_API || ''
  };
};

// Utilidad para obtener headers de Pinata usando las variables correctas del .env
const getPinataHeaders = () => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
  const secret = import.meta.env.VITE_PINATA_SECRET_KEY || '';
  
  if (!apiKey || !secret) {
    throw new Error('Missing Pinata API credentials. Check VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env');
  }
  
  return { 
    pinata_api_key: apiKey, 
    pinata_secret_api_key: secret 
  };
};

// Caching utilities for API responses
const apiCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

const getCachedData = (key) => {
  const cachedItem = apiCache.get(key);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  apiCache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Enhanced metadata cache with expiration
const metadataCache = new Map();
const METADATA_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache utility functions
const getCachedMetadata = (uri) => {
  const cached = metadataCache.get(uri);
  if (cached && Date.now() - cached.timestamp < METADATA_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedMetadata = (uri, data) => {
  metadataCache.set(uri, {
    data,
    timestamp: Date.now()
  });
  return data;
};

/**
 * Convert IPFS URI to HTTP URL using multiple gateways with CORS fallbacks
 */
export const ipfsToHttp = (ipfsUri) => {
  if (!ipfsUri) return DEFAULT_PLACEHOLDER;
  
  // If it's already an HTTP URL, return as is
  if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
    return ipfsUri;
  }
  
  // Handle data URLs (base64 encoded metadata)
  if (ipfsUri.startsWith('data:')) {
    try {
      // Extract the JSON part after the comma
      const base64Data = ipfsUri.split(',')[1];
      if (base64Data) {
        const decodedData = decodeURIComponent(base64Data);
        const metadata = JSON.parse(decodedData);
        if (metadata.image) {
          return ipfsToHttp(metadata.image);
        }
      }
    } catch (e) {
      console.warn('Error parsing data URL:', e);
    }
    return DEFAULT_PLACEHOLDER;
  }
  
  // Extract hash from IPFS URI
  let hash = '';
  if (ipfsUri.startsWith('ipfs://')) {
    hash = ipfsUri.replace('ipfs://', '');
  } else if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('ba')) {
    hash = ipfsUri;
  } else {
    return DEFAULT_PLACEHOLDER;
  }
  
  // Use multiple IPFS gateways with CORS support
  const gateways = [
    `https://ipfs.io/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
    `https://gateway.ipfs.io/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`
  ];
  
  // Return the first gateway (ipfs.io has better CORS support)
  return gateways[0];
};

/**
 * Fetch token metadata from IPFS with multiple gateway fallbacks and no-cors mode
 */
export const fetchTokenMetadata = async (tokenURI) => {
  if (!tokenURI) {
    return {
      name: 'Unknown NFT',
      description: 'No metadata available',
      image: DEFAULT_PLACEHOLDER,
      attributes: []
    };
  }

  // Check cache first
  const cached = getCachedMetadata(tokenURI);
  if (cached) return cached;

  try {
    // Handle data URLs (inline JSON metadata)
    if (tokenURI.startsWith('data:')) {
      try {
        let jsonData;
        
        if (tokenURI.includes('application/json')) {
          // Handle data:application/json;base64, or data:application/json,
          const base64Part = tokenURI.split(',')[1];
          if (tokenURI.includes('base64')) {
            // Base64 encoded
            jsonData = atob(base64Part);
          } else {
            // URL encoded
            jsonData = decodeURIComponent(base64Part);
          }
        } else {
          // Try to extract JSON directly
          const dataPart = tokenURI.split(',')[1];
          jsonData = decodeURIComponent(dataPart);
        }
        
        const metadata = JSON.parse(jsonData);
        
        // Fix problematic image URLs in metadata
        let imageUrl = metadata.image;
        if (imageUrl && (
          imageUrl.includes('nuvos.app/nft-placeholder.png') ||
          imageUrl.includes('/nft-placeholder.png')
        )) {
          console.warn('Replacing problematic image URL in metadata:', imageUrl);
          imageUrl = DEFAULT_PLACEHOLDER;
        }
        
        // Process and validate metadata
        const processedMetadata = {
          name: metadata.name || 'Unknown NFT',
          description: metadata.description || '',
          image: imageUrl ? ipfsToHttp(imageUrl) : DEFAULT_PLACEHOLDER,
          attributes: Array.isArray(metadata.attributes) ? metadata.attributes : []
        };

        // Cache the result
        setCachedMetadata(tokenURI, processedMetadata);
        return processedMetadata;
      } catch (dataError) {
        console.warn('Error parsing data URL metadata:', dataError);
        const fallback = {
          name: 'Unknown NFT',
          description: 'Error parsing inline metadata',
          image: DEFAULT_PLACEHOLDER,
          attributes: []
        };
        setCachedMetadata(tokenURI, fallback);
        return fallback;
      }
    }

    // Handle IPFS URLs with multiple gateway fallbacks
    const gateways = [
      ipfsToHttp(tokenURI),
      tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      tokenURI.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'),
      tokenURI.replace('ipfs://', 'https://dweb.link/ipfs/'),
      tokenURI.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/')
    ];
    
    // Try each gateway until one works
    for (let i = 0; i < gateways.length; i++) {
      const httpUrl = gateways[i];
      
      try {
        // Add timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(httpUrl, {
          headers: {
            'Accept': 'application/json'
            // Remove Cache-Control header that causes CORS issues
          },
          signal: controller.signal,
          mode: 'cors' // Try CORS first
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let metadata;
        try {
          metadata = await response.json();
        } catch (jsonError) {
          console.warn('Failed to parse JSON metadata:', jsonError);
          throw new Error('Invalid JSON metadata');
        }
        
        // Fix problematic image URLs in metadata
        let imageUrl = metadata.image;
        if (imageUrl && (
          imageUrl.includes('nuvos.app/nft-placeholder.png') ||
          imageUrl.includes('/nft-placeholder.png')
        )) {
          console.warn('Replacing problematic image URL in metadata:', imageUrl);
          imageUrl = DEFAULT_PLACEHOLDER;
        }
        
        // Process and validate metadata
        const processedMetadata = {
          name: metadata.name || 'Unknown NFT',
          description: metadata.description || '',
          image: imageUrl ? ipfsToHttp(imageUrl) : DEFAULT_PLACEHOLDER,
          attributes: Array.isArray(metadata.attributes) ? metadata.attributes : []
        };

        // Cache the result
        setCachedMetadata(tokenURI, processedMetadata);
        return processedMetadata;
      } catch (fetchError) {
        console.warn(`Failed to fetch from gateway ${i + 1}/${gateways.length}: ${httpUrl}`, fetchError.message);
        
        // If this is the last gateway, try no-cors mode as fallback
        if (i === gateways.length - 1) {
          try {
            console.log('Trying no-cors fallback for:', httpUrl);
            const response = await fetch(httpUrl, {
              mode: 'no-cors',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            // no-cors mode doesn't allow reading response, so we can't get metadata
            // Fall through to fallback metadata
          } catch (noCorsError) {
            console.warn('No-cors fallback also failed:', noCorsError);
          }
        }
        
        // Continue to next gateway
        continue;
      }
    }
    
    // If all gateways failed, return fallback metadata
    throw new Error('All IPFS gateways failed');
    
  } catch (error) {
    console.warn(`Failed to fetch metadata from ${tokenURI}:`, error.message);
    
    // Return fallback metadata
    const fallback = {
      name: 'Unknown NFT',
      description: 'Metadata unavailable',
      image: DEFAULT_PLACEHOLDER,
      attributes: []
    };
    
    setCachedMetadata(tokenURI, fallback);
    return fallback;
  }
};

/**
 * Get image from metadata object
 */
export const getImageFromMetadata = (metadata) => {
  if (!metadata) return DEFAULT_PLACEHOLDER;
  
  if (metadata.image) {
    return ipfsToHttp(metadata.image);
  }
  
  if (metadata.image_url) {
    return ipfsToHttp(metadata.image_url);
  }
  
  if (metadata.animation_url) {
    return ipfsToHttp(metadata.animation_url);
  }
  
  return DEFAULT_PLACEHOLDER;
};

/**
 * Get CSP compliant image URL with better fallbacks
 */
export const getCSPCompliantImageURL = (imageUrl) => {
  if (!imageUrl) return DEFAULT_PLACEHOLDER;
  
  // Convert IPFS URLs to HTTP
  const httpUrl = ipfsToHttp(imageUrl);
  
  // If it's our default placeholder, return it directly
  if (httpUrl === DEFAULT_PLACEHOLDER) return DEFAULT_PLACEHOLDER;
  
  // Handle known problematic URLs that should use placeholder
  const problematicUrls = [
    'https://nuvos.app/nft-placeholder.png',
    'nuvos.app/nft-placeholder.png',
    '/nft-placeholder.png'
  ];
  
  if (problematicUrls.some(problemUrl => httpUrl.includes(problemUrl))) {
    console.warn(`Problematic URL detected: ${httpUrl}, using local placeholder`);
    return DEFAULT_PLACEHOLDER;
  }
  
  // List of allowed domains from CSP - updated with better CORS support
  const allowedDomains = [
    'ipfs.io',
    'cloudflare-ipfs.com',
    'dweb.link',
    'gateway.ipfs.io',
    'gateway.pinata.cloud',
    'nftstorage.link',
    'w3s.link'
    // Removed 'nuvos.app' since it's causing resolution issues
  ];
  
  try {
    const url = new URL(httpUrl);
    if (allowedDomains.some(domain => url.hostname.includes(domain))) {
      return httpUrl;
    } else {
      console.warn(`Domain ${url.hostname} not in CSP allowlist, using placeholder`);
    }
  } catch (e) {
    console.warn('Invalid URL:', httpUrl);
  }
  
  return DEFAULT_PLACEHOLDER;
};

/**
 * Upload data to IPFS using Pinata
 */
export const uploadJsonToIPFS = async (data, options = {}) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getPinataHeaders()
    };

    console.log('Uploading JSON to Pinata with headers:', Object.keys(headers));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Failed to parse Pinata response:', parseError);
      result = {};
    }
    
    if (!response.ok) {
      let errorMessage = 'Unknown Pinata error';
      
      if (result.error) {
        if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error.details) {
          errorMessage = result.error.details;
        } else {
          errorMessage = JSON.stringify(result.error);
        }
      } else if (result.message) {
        errorMessage = result.message;
      } else if (response.status === 401) {
        errorMessage = 'Invalid Pinata credentials. Please check your API keys or regenerate your JWT token.';
      } else if (response.status === 403) {
        errorMessage = 'Pinata access forbidden. Please check your account permissions.';
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        result,
        url,
        headers: Object.keys(headers)
      });
      
      throw new Error(`Pinata error: ${errorMessage}`);
    }
    
    if (!result.IpfsHash) {
      throw new Error('Pinata response missing IpfsHash');
    }
    
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
};

/**
 * Upload file to IPFS using Pinata
 */
export const uploadFileToIPFS = async (file, options = {}) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  
  try {
    const headers = getPinataHeaders();
    const formData = new FormData();
    formData.append('file', file);
    
    // Add optional metadata
    if (options.name || file.name) {
      const metadata = JSON.stringify({
        name: options.name || file.name,
        keyvalues: {
          originalName: file.name,
          fileSize: file.size.toString(),
          fileType: file.type
        }
      });
      formData.append('pinataMetadata', metadata);
    }

    let fetchHeaders = {};
    if (headers.Authorization) {
      fetchHeaders['Authorization'] = headers.Authorization;
    } else {
      fetchHeaders['pinata_api_key'] = headers.pinata_api_key;
      fetchHeaders['pinata_secret_api_key'] = headers.pinata_secret_api_key;
    }

    console.log('Uploading file to Pinata:', file.name, 'using auth method:', headers.Authorization ? 'JWT' : 'API Keys');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: fetchHeaders
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse Pinata response:', parseError);
      data = {};
    }
    
    if (!response.ok) {
      let errorMessage = 'Unknown Pinata error';
      
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error.details) {
          errorMessage = data.error.details;
        } else {
          errorMessage = JSON.stringify(data.error);
        }
      } else if (data.message) {
        errorMessage = data.message;
      } else if (response.status === 401) {
        errorMessage = 'Invalid Pinata credentials. Please regenerate your JWT token or check your API keys.';
      } else if (response.status === 403) {
        errorMessage = 'Pinata access forbidden. Please check your account permissions.';
      } else if (response.status === 413) {
        errorMessage = 'File too large for Pinata upload.';
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        data,
        url,
        headers: Object.keys(fetchHeaders),
        fileSize: file.size,
        fileType: file.type
      });
      
      throw new Error(`Pinata error: ${errorMessage}`);
    }
    
    if (!data.IpfsHash) {
      throw new Error('Pinata response missing IpfsHash');
    }
    
    return `ipfs://${data.IpfsHash}`;
  } catch (err) {
    console.error("Error uploading file to IPFS:", err);
    throw err;
  }
};

/**
 * Fetch NFTs owned by an address using multiple providers with fallbacks
 */
export const fetchNFTs = async (address, provider, options = {}) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const cacheKey = `nfts_${address}_${options.chainId || '137'}`;
  const cachedNfts = getCachedData(cacheKey);
  if (cachedNfts) {
    console.log(`Returning ${cachedNfts.length} cached NFTs for ${address}`);
    return cachedNfts;
  }

  const chainId = options.chainId || 137;
  const apiKeys = getApiKeys();
  const limit = options.limit || 100;

  try {
    // Only try Alchemy if we have a valid API key
    if (apiKeys.alchemy) {
      try {
        console.log("Fetching NFTs with Alchemy API");
        const network = chainId === 137 ? 'polygon-mainnet' : 'polygon-mumbai';
        const url = `${NFT_API_CONFIG.alchemy.baseUrl(network, apiKeys.alchemy)}${NFT_API_CONFIG.alchemy.formatOwnerQuery(address)}&pageSize=${limit}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Alchemy API error: ${response.statusText}`);
        
        const data = await response.json();
        
        // Process Alchemy NFT data
        const processedNfts = data.ownedNfts.map(nft => ({
          id: nft.id.tokenId,
          contractAddress: nft.contract.address,
          name: nft.title || nft.metadata?.name || `NFT #${nft.id.tokenId}`,
          description: nft.description || nft.metadata?.description || "",
          image: nft.metadata?.image || nft.media?.[0]?.gateway || DEFAULT_PLACEHOLDER,
          tokenURI: nft.tokenUri?.gateway || "",
          standard: nft.id.tokenMetadata?.tokenType || "ERC721",
          attributes: nft.metadata?.attributes || [],
          minter: address,
          owner: address
        }));
        
        return setCachedData(cacheKey, processedNfts);
      } catch (alchemyError) {
        console.warn("Alchemy API error:", alchemyError);
      }
    }
    
    // Direct blockchain method using contract functions from ABI
    console.log("Fetching NFTs directly from blockchain using contract functions");
    if (!provider) throw new Error("Provider required for direct blockchain NFT fetch");
    
    // Get token contract address
    const contractAddress = options.contractAddress || import.meta.env.VITE_TOKENIZATION_ADDRESS;
    if (!contractAddress) {
      console.log("No contract address provided, cannot fetch NFTs");
      return setCachedData(cacheKey, []);
    }
    
    try {
      // Use the TokenizationApp ABI
      const TokenizationAppABI = await import('../../Abi/TokenizationApp.json');
      const contract = new ethers.Contract(contractAddress, TokenizationAppABI.abi, provider);
      
      // Check if user has NFTs using balanceOf
      let balance;
      try {
        balance = await contract.balanceOf(address);
        console.log(`User has ${balance.toString()} NFTs`);
      } catch (balanceError) {
        console.warn("Error getting balance:", balanceError.message);
        return setCachedData(cacheKey, []);
      }
      
      if (balance === 0n) {
        console.log("User has no NFTs");
        return setCachedData(cacheKey, []);
      }
      
      const nfts = [];
      const maxTokens = Math.min(Number(balance), limit);
      
      // Use getTokensByCreator function from the ABI
      try {
        const createdTokens = await contract.getTokensByCreator(address);
        console.log(`Found ${createdTokens.length} tokens created by user`);
        
        // Process ALL tokens sequentially to avoid losing any
        for (let i = 0; i < createdTokens.length; i++) {
          const tokenId = createdTokens[i];
          
          try {
            console.log(`Processing token ${tokenId} (${i + 1}/${createdTokens.length})`);
            
            // Get token details with individual timeouts - more generous timeouts
            let tokenURI = "";
            let owner = address;
            let isListed = false;
            
            try {
              tokenURI = await Promise.race([
                contract.tokenURI(tokenId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('TokenURI timeout')), 5000))
              ]);
              console.log(`Got tokenURI for ${tokenId}: ${tokenURI}`);
            } catch (uriError) {
              console.warn(`Failed to get tokenURI for token ${tokenId}:`, uriError.message);
              tokenURI = "";
            }
            
            try {
              owner = await Promise.race([
                contract.ownerOf(tokenId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('OwnerOf timeout')), 3000))
              ]);
            } catch (ownerError) {
              console.warn(`Failed to get owner for token ${tokenId}:`, ownerError.message);
              owner = address;
            }
            
            try {
              const listingResult = await Promise.race([
                contract.getListedToken(tokenId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('GetListedToken timeout')), 3000))
              ]);
              isListed = listingResult[4];
              
              // Additional marketplace info
              if (isListed) {
                console.log(`Token ${tokenId} is listed for sale - seller: ${listingResult[1]}, price: ${ethers.formatEther(listingResult[3])}`);
              }
            } catch (listingError) {
              console.warn(`Failed to get listing for token ${tokenId}:`, listingError.message);
              isListed = false;
            }
            
            // Fetch metadata with more generous timeout and better fallback
            let metadata = {
              name: `NFT #${tokenId}`,
              description: '',
              image: DEFAULT_PLACEHOLDER,
              attributes: []
            };
            
            if (tokenURI && tokenURI.trim() !== '') {
              try {
                console.log(`Fetching metadata for token ${tokenId} from: ${tokenURI}`);
                const fetchedMetadata = await Promise.race([
                  fetchTokenMetadata(tokenURI),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata timeout')), 8000))
                ]);
                
                if (fetchedMetadata && typeof fetchedMetadata === 'object') {
                  metadata = { ...metadata, ...fetchedMetadata };
                  console.log(`Successfully fetched metadata for token ${tokenId}:`, metadata.name);
                } else {
                  console.warn(`Invalid metadata format for token ${tokenId}`);
                }
              } catch (metadataError) {
                console.warn(`Error fetching metadata for token ${tokenId}:`, metadataError.message);
                // Keep default metadata
              }
            } else {
              console.warn(`Token ${tokenId} has empty or invalid tokenURI`);
            }
            
            // Get additional data with individual error handling
            let listingData = null;
            let likesCount = 0;
            
            if (isListed) {
              try {
                const listing = await Promise.race([
                  contract.getListedToken(tokenId),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Listing timeout')), 3000))
                ]);
                listingData = {
                  price: listing[3].toString(),
                  seller: listing[1],
                  timestamp: listing[5].toString(),
                  category: listing[6]
                };
              } catch (listingError) {
                console.warn(`Error getting listing details for token ${tokenId}:`, listingError.message);
              }
            }
            
            try {
              likesCount = await Promise.race([
                contract.getLikesCount(tokenId),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Likes timeout')), 2000))
              ]);
            } catch (likesError) {
              console.warn(`Error getting likes for token ${tokenId}:`, likesError.message);
              likesCount = 0;
            }
            
            // Ensure image URL is CSP compliant
            const processedImage = getCSPCompliantImageURL(metadata.image);
            
            const nftData = {
              id: tokenId.toString(),
              tokenId: tokenId.toString(),
              contractAddress,
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || "",
              image: processedImage,
              tokenURI,
              standard: "ERC721",
              attributes: Array.isArray(metadata.attributes) ? metadata.attributes : [],
              minter: address,
              owner: owner,
              isForSale: isListed,
              price: listingData?.price || "0",
              seller: listingData?.seller || "",
              category: listingData?.category || "",
              likes: likesCount.toString(),
              timestamp: listingData?.timestamp || "0"
            };
            
            console.log(`✅ Successfully processed NFT ${tokenId}: ${metadata.name} with image: ${processedImage}`);
            nfts.push(nftData);
            
            // Small delay between tokens to avoid overwhelming the RPC
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (tokenError) {
            console.error(`❌ Critical error processing token ${tokenId}:`, tokenError);
            
            // Even if there's an error, try to add a basic NFT entry so it's not lost
            const fallbackNft = {
              id: tokenId.toString(),
              tokenId: tokenId.toString(),
              contractAddress,
              name: `NFT #${tokenId}`,
              description: 'Error loading details',
              image: DEFAULT_PLACEHOLDER,
              tokenURI: '',
              standard: "ERC721",
              attributes: [],
              minter: address,
              owner: address,
              isForSale: false,
              price: "0",
              seller: "",
              category: "",
              likes: "0",
              timestamp: "0"
            };
            
            nfts.push(fallbackNft);
            console.log(`Added fallback NFT for token ${tokenId}`);
          }
        }
        
        console.log(`🎉 Successfully loaded ${nfts.length} out of ${createdTokens.length} NFTs from contract`);
        
        // Verify we have all the NFTs
        if (nfts.length !== createdTokens.length) {
          console.warn(`⚠️ Mismatch: Expected ${createdTokens.length} NFTs but got ${nfts.length}`);
        }
        
        return setCachedData(cacheKey, nfts);
        
      } catch (creatorError) {
        console.warn("Error using getTokensByCreator:", creatorError);
        
        // Fallback: try tokenOfOwnerByIndex if available
        console.log("Trying alternative method with tokenOfOwnerByIndex");
        
        for (let i = 0; i < maxTokens; i++) {
          try {
            const tokenId = await contract.tokenOfOwnerByIndex(address, i);
            let tokenURI = "";
            let metadata = {};
            
            try {
              tokenURI = await contract.tokenURI(tokenId);
              metadata = await fetchTokenMetadata(tokenURI);
            } catch (metadataError) {
              console.warn(`Error fetching metadata for token ${tokenId}:`, metadataError);
            }
            
            nfts.push({
              id: tokenId.toString(),
              tokenId: tokenId.toString(),
              contractAddress,
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || "",
              image: getImageFromMetadata(metadata) || DEFAULT_PLACEHOLDER,
              tokenURI,
              standard: "ERC721",
              attributes: metadata.attributes || [],
              minter: address,
              owner: address
            });
          } catch (tokenError) {
            console.warn(`Error processing token at index ${i}:`, tokenError);
          }
        }
        
        console.log(`Fallback method loaded ${nfts.length} NFTs`);
        return setCachedData(cacheKey, nfts);
      }
      
    } catch (contractError) {
      console.error("Error interacting with NFT contract:", contractError);
      return setCachedData(cacheKey, getPlaceholderNFTs(address));
    }
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return getPlaceholderNFTs(address);
  }
};

/**
 * Fetch token balances for multiple tokens
 * @param {string} address - User wallet address
 * @param {Object} provider - Ethereum provider
 * @param {Array} tokenAddresses - Array of token contract addresses
 * @returns {Array} Array of token balance objects
 */
export const fetchTokenBalances = async (address, provider, tokenAddresses = []) => {
  if (!address || !provider) {
    console.warn('Address and provider are required for fetchTokenBalances');
    return [];
  }

  const balances = [];

  try {
    // Add MATIC (native token) balance
    try {
      const maticBalance = await provider.getBalance(address);
      balances.push({
        symbol: 'MATIC',
        name: 'Polygon',
        balance: ethers.formatEther(maticBalance),
        decimals: 18,
        contractAddress: null, // Native token
        logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
      });
    } catch (error) {
      console.warn('Error fetching MATIC balance:', error);
    }

    // Add NUVO token balance if configured
    const nuvoTokenAddress = import.meta.env.VITE_NUVO_TOKEN;
    if (nuvoTokenAddress && ethers.isAddress(nuvoTokenAddress)) {
      try {
        const nuvoContract = new ethers.Contract(nuvoTokenAddress, erc20Abi, provider);
        const [balance, decimals, symbol, name] = await Promise.all([
          nuvoContract.balanceOf(address),
          nuvoContract.decimals(),
          nuvoContract.symbol(),
          nuvoContract.name()
        ]);

        balances.push({
          symbol,
          name,
          balance: ethers.formatUnits(balance, decimals),
          decimals,
          contractAddress: nuvoTokenAddress,
          logo: '/LogoNuvos.webp' // Use local logo for NUVO token
        });
      } catch (error) {
        console.warn('Error fetching NUVO token balance:', error);
      }
    }

    // Fetch balances for additional token addresses
    for (const tokenAddress of tokenAddresses) {
      if (!ethers.isAddress(tokenAddress)) continue;

      try {
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        const [balance, decimals, symbol, name] = await Promise.all([
          tokenContract.balanceOf(address),
          tokenContract.decimals(),
          tokenContract.symbol(),
          tokenContract.name()
        ]);

        balances.push({
          symbol,
          name,
          balance: ethers.formatUnits(balance, decimals),
          decimals,
          contractAddress: tokenAddress,
          logo: null // Could be enhanced to fetch token logos from a service
        });
      } catch (error) {
        console.warn(`Error fetching balance for token ${tokenAddress}:`, error);
      }
    }

    return balances;
  } catch (error) {
    console.error('Error in fetchTokenBalances:', error);
    return [];
  }
};

/**
 * Fetch transactions for a given address
 * @param {string} address - Wallet address
 * @param {Object} provider - Ethereum provider
 * @returns {Array} Array of transaction objects
 */
export const fetchTransactions = async (address, provider) => {
  if (!address || !provider) {
    console.warn('Address and provider are required for fetchTransactions');
    return [];
  }

  try {
    // Get recent transactions - limited to last 50 for performance
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks

    // Get sent transactions
    const sentFilter = {
      fromBlock,
      toBlock: 'latest',
      from: address
    };

    // Get received transactions
    const receivedFilter = {
      fromBlock,
      toBlock: 'latest',
      to: address
    };

    const [sentTxs, receivedTxs] = await Promise.allSettled([
      provider.getLogs(sentFilter),
      provider.getLogs(receivedFilter)
    ]);

    const transactions = [];

    // Process sent transactions
    if (sentTxs.status === 'fulfilled') {
      sentTxs.value.slice(0, 25).forEach(tx => {
        transactions.push({
          hash: tx.transactionHash,
          type: 'sent',
          from: address,
          to: tx.to || 'Contract',
          value: '0', // We'd need to get full transaction details for value
          timestamp: Date.now(), // Placeholder
          blockNumber: tx.blockNumber
        });
      });
    }

    // Process received transactions
    if (receivedTxs.status === 'fulfilled') {
      receivedTxs.value.slice(0, 25).forEach(tx => {
        transactions.push({
          hash: tx.transactionHash,
          type: 'received',
          from: tx.from || 'Contract',
          to: address,
          value: '0', // We'd need to get full transaction details for value
          timestamp: Date.now(), // Placeholder
          blockNumber: tx.blockNumber
        });
      });
    }

    return transactions.slice(0, 50); // Limit to 50 total transactions
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

/**
 * Safely fetch logs from a blockchain by dividing the request into smaller chunks
 */
export const fetchLogsInChunks = async (provider, filter, chunkSize = 480, maxRetries = 3) => {
  if (!provider) throw new Error('Provider is required');

  try {
    const currentBlock = await provider.getBlockNumber();
    const startBlock = filter.fromBlock === 0 || !filter.fromBlock ?
      Math.max(0, currentBlock - 50000) :
      parseInt(filter.fromBlock);

    const endBlock = filter.toBlock === 'latest' ? currentBlock : parseInt(filter.toBlock);

    // Si el rango es pequeño, consulta directo
    if (endBlock - startBlock <= chunkSize) {
      const logs = await provider.getLogs({
        ...filter,
        fromBlock: ethers.toQuantity(startBlock),
        toBlock: ethers.toQuantity(endBlock)
      });
      return logs;
    }

    console.info(`[LogFetch] Fetching logs in chunks: ${startBlock} to ${endBlock}`);

    const logs = [];
    for (let from = startBlock; from < endBlock; from += chunkSize) {
      const to = Math.min(from + chunkSize - 1, endBlock);
      let attempt = 0;
      let success = false;

      while (!success && attempt < maxRetries) {
        try {
          const chunk = await provider.getLogs({
            ...filter,
            fromBlock: ethers.toQuantity(from),
            toBlock: ethers.toQuantity(to)
          });
          logs.push(...chunk);
          success = true;
        } catch (error) {
          attempt++;
          if (attempt >= maxRetries) {
            console.error(`[LogFetch] Max retries exceeded for blocks ${from}-${to}: ${error.message}`);
          } else {
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }

    return logs;
  } catch (error) {
    console.error('[LogFetch] Error fetching logs in chunks:', error);
    return [];
  }
};

/**
 * Calculate staking rewards based on parameters
 * 
 * @param {string} amount - Amount staked
 * @param {number} days - Days staked
 * @param {number} hourlyROI - Hourly ROI percentage (e.g., 0.01 for 0.01%)
 * @param {number} maxROI - Maximum ROI percentage (e.g., 125 for 125%)
 * @returns {Object} - Calculated rewards data
 */
export const calculateStakingRewards = (amount, days, hourlyROI = 0.0001, maxROI = 1.25) => {
  // Convert amount to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Calculate daily ROI from hourly
  const dailyROI = hourlyROI * 24;
  
  // Calculate raw rewards (linear)
  const rawRewards = numAmount * dailyROI * days;
  
  // Apply max ROI cap if needed
  const maxRewards = numAmount * maxROI;
  const finalRewards = Math.min(rawRewards, maxRewards);
  
  // Calculate progress percentage toward max ROI
  const progressPercentage = Math.min((dailyROI * days) / maxROI, 1) * 100;
  
  return {
    rewards: finalRewards,
    apy: dailyROI * 365 * 100, // Annualized percentage yield
    progress: progressPercentage,
    maxRewards,
    daysToMax: maxROI / dailyROI
  };
};

/**
 * Calculate time-based staking bonus
 * 
 * @param {number} stakingDays - Number of days staked
 * @param {Object} bonusConfig - Configuration for time bonuses
 * @returns {number} - Bonus multiplier (e.g., 1.05 for 5% bonus)
 */
export const calculateTimeBonus = (stakingDays, bonusConfig = {
  YEAR: { days: 365, bonus: 0.05 },
  HALF_YEAR: { days: 180, bonus: 0.03 },
  QUARTER: { days: 90, bonus: 0.01 }
}) => {
  if (stakingDays >= bonusConfig.YEAR.days) 
    return 1 + bonusConfig.YEAR.bonus;
  if (stakingDays >= bonusConfig.HALF_YEAR.days) 
    return 1 + bonusConfig.HALF_YEAR.bonus;
  if (stakingDays >= bonusConfig.QUARTER.days) 
    return 1 + bonusConfig.QUARTER.bonus;
  return 1; // No bonus (multiplier of 1)
};

// Helper function to get placeholder NFTs when contract fails
const getPlaceholderNFTs = (address) => {
  return [{
    id: "1",
    tokenId: "1",
    contractAddress: import.meta.env.VITE_TOKENIZATION_ADDRESS || "",
    name: "Welcome to Nuvos NFT",
    description: "This is a placeholder NFT. Connect your wallet and create your first NFT!",
    image: DEFAULT_PLACEHOLDER,
    tokenURI: "",
    standard: "ERC721",
    attributes: [
      { trait_type: "Type", value: "Placeholder" },
      { trait_type: "Status", value: "Demo" }
    ],
    minter: address,
    owner: address,
    isForSale: false,
    price: "0",
    likes: "0"
  }];
};
