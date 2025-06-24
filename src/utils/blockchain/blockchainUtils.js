import { ethers } from 'ethers';
import {
  shouldFetchLogs,
  getCachedLogs,
  cacheLogResult,
  markLogQueryInProgress
} from './blockchainLogCache';
import { getAlchemyApiKey, getAlchemyNftUrl } from './alchemy';
import { imageCache } from './imageCache';

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

// Default image placeholder for NFTs and tokens
export const DEFAULT_PLACEHOLDER = "/LogoNuvos.webp";

// Supported NFT APIs and their base URLs
const NFT_API_CONFIG = {
  alchemy: {
    baseUrl: (network) => getAlchemyNftUrl({ network }),
    formatOwnerQuery: (address) => `?owner=${address}`
  },
  moralis: {
    baseUrl: (chainId) => `https://deep-index.moralis.io/api/v2/${chainId}/nft`,
    formatOwnerQuery: (address) => `/${address}`
  }
};

// API keys storage - best to move a environment variables en producción
const getApiKeys = () => ({
  alchemy: (() => { try { return getAlchemyApiKey(); } catch { return ''; } })(),
  moralis: import.meta.env.VITE_MORALIS_API || '',
  polygonscan: import.meta.env.VITE_POLYGONSCAN_API || ''
});

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

/**
 * Utility: Check if ENS is supported on the current chain
 * Only Ethereum Mainnet (chainId 1) supports ENS
 */
export const isENSSupported = (chainId) => {
  return chainId === 1;
};

/**
 * Fetch NFTs owned by an address using multiple providers with fallbacks
 * 
 * @param {string} address - Wallet address to fetch NFTs for
 * @param {Object} provider - Ethers provider
 * @param {Object} options - Options like limit, offset, chainId, etc.
 * @returns {Array} - Array of NFT objects
 */
export const fetchNFTs = async (address, provider, options = {}) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const cacheKey = `nfts_${address}_${options.chainId || '137'}`;
  const cachedNfts = getCachedData(cacheKey);
  if (cachedNfts) return cachedNfts;

  const chainId = options.chainId || 137; // Default to Polygon
  const apiKeys = getApiKeys();
  const limit = options.limit || 100;

  try {
    // Try Alchemy API first if key exists
    if (apiKeys.alchemy) {
      try {
        console.log("Fetching NFTs with Alchemy API");
        const network = chainId === 137 ? 'polygon-mainnet' : 'polygon-mumbai';
        const url = `${NFT_API_CONFIG.alchemy.baseUrl(network)}${NFT_API_CONFIG.alchemy.formatOwnerQuery(address)}&pageSize=${limit}`;
        
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
          minter: address, // Always address, never ENS
          owner: address   // Always address, never ENS
        }));
        
        return setCachedData(cacheKey, processedNfts);
      } catch (alchemyError) {
        console.warn("Alchemy API error:", alchemyError);
        // Fall through to next provider
      }
    }
    
    // Try Moralis API if key exists
    if (apiKeys.moralis) {
      try {
        console.log("Fetching NFTs with Moralis API");
        const url = `${NFT_API_CONFIG.moralis.baseUrl(chainId)}${NFT_API_CONFIG.moralis.formatOwnerQuery(address)}?limit=${limit}`;
        
        const response = await fetch(url, {
          headers: { 'X-API-Key': apiKeys.moralis }
        });
        if (!response.ok) throw new Error(`Moralis API error: ${response.statusText}`);
        
        const data = await response.json();
        
        // Process Moralis NFT data
        const processedNfts = data.result.map(nft => ({
          id: nft.token_id,
          contractAddress: nft.token_address,
          name: nft.name || `NFT #${nft.token_id}`,
          description: nft.metadata?.description || "",
          image: getImageFromMetadata(nft.metadata) || DEFAULT_PLACEHOLDER,
          tokenURI: nft.token_uri || "",
          standard: nft.contract_type,
          attributes: nft.metadata?.attributes || [],
          minter: nft.minter_address || address, // Always address, never ENS
          owner: address   // Always address, never ENS
        }));
        
        return setCachedData(cacheKey, processedNfts);
      } catch (moralisError) {
        console.warn("Moralis API error:", moralisError);
        // Fall through to blockchain direct method
      }
    }
    
    // Direct blockchain method as last resort
    console.log("Fetching NFTs directly from blockchain");
    if (!provider) throw new Error("Provider required for direct blockchain NFT fetch");
    
    // Get token contract address
    const contractAddress = options.contractAddress;
    if (!contractAddress) {
      console.log("No contract address provided, falling back to placeholder data");
      return setCachedData(cacheKey, getPlaceholderNFTs(address));
    }
    
    // Connect to the contract and fetch NFTs
    try {
      const contract = new ethers.Contract(contractAddress, erc721Abi, provider);
      const balance = await contract.balanceOf(address);
      
      if (balance === 0) {
        return setCachedData(cacheKey, []);
      }
      
      const nfts = [];
      for (let i = 0; i < Math.min(Number(balance), limit); i++) {
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
            contractAddress,
            name: metadata.name || `NFT #${tokenId}`,
            description: metadata.description || "",
            image: getImageFromMetadata(metadata) || DEFAULT_PLACEHOLDER,
            tokenURI,
            standard: "ERC721",
            attributes: metadata.attributes || [],
            minter: address, // Assuming owner is minter as a fallback
            owner: address   // Always address, never ENS
          });
        } catch (tokenError) {
          console.warn(`Error processing token at index ${i}:`, tokenError);
        }
      }
      
      return setCachedData(cacheKey, nfts);
    } catch (contractError) {
      console.error("Error interacting with NFT contract:", contractError);
      return setCachedData(cacheKey, getPlaceholderNFTs(address));
    }
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return getPlaceholderNFTs(address); // Fallback to placeholder data
  }
};

/**
 * Extract image URL from metadata accounting for various formats
 */
const getImageFromMetadata = (metadata) => {
  if (!metadata) return null;
  
  // Try parsing if it's a string
  let parsedMetadata = metadata;
  if (typeof metadata === 'string') {
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch (e) {
      return null;
    }
  }
  
  // Look for image in various fields
  return parsedMetadata.image || 
         parsedMetadata.image_url || 
         parsedMetadata.image_uri || 
         parsedMetadata.animation_url ||
         null;
};

/**
 * Convert IPFS URI to HTTP gateway URL with improved reliability
 * 
 * @param {string} uri - IPFS URI (ipfs://...)
 * @param {string} preferredGateway - Preferred IPFS gateway URL
 * @returns {string} - HTTP gateway URL
 */
export const ipfsToHttp = (uri, preferredGateway) => {
  if (!uri) return '';
  
  // If it's already an HTTP URL, return as is
  if (uri.startsWith('http')) return uri;
  
  // If it's a data URL, return as is
  if (uri.startsWith('data:')) return uri;
  
  // Available gateways in order of preference
  const gateways = [
    preferredGateway,
    'https://nftstorage.link/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.cf-ipfs.com/ipfs/',
  ].filter(Boolean); // Remove undefined entries
  
  if (uri.startsWith('ipfs://')) {
    // Use the first gateway in the list (or preferred gateway if provided)
    return gateways[0] + uri.substring(7);
  }
  
  // For CIDs without protocol prefix
  if (/^Qm[1-9A-Za-z]{44}/.test(uri) || /^bafy/.test(uri)) {
    return gateways[0] + uri;
  }
  
  return uri;
};

/**
 * Enhanced CSP-compliant image URL processor with caching
 */
export const getCSPCompliantImageURL = (imageUrl) => {
  if (!imageUrl) return DEFAULT_PLACEHOLDER;
  
  // Check cache first
  const cached = imageCache.get(imageUrl);
  if (cached) {
    return cached;
  }
  
  try {
    let processedUrl;
    
    // Handle IPFS URLs
    if (imageUrl.startsWith('ipfs://')) {
      const hash = imageUrl.replace('ipfs://', '');
      processedUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    // Handle raw IPFS hashes
    else if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[A-Za-z0-9]+)$/.test(imageUrl)) {
      processedUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
    }
    // Handle URLs that already contain IPFS gateways
    else if (imageUrl.includes('/ipfs/')) {
      const trustedGateways = [
        'gateway.pinata.cloud',
        'ipfs.io',
        'cloudflare-ipfs.com',
        'dweb.link',
        'nftstorage.link'
      ];
      
      const url = new URL(imageUrl);
      if (trustedGateways.some(gateway => url.hostname.includes(gateway))) {
        processedUrl = imageUrl;
      } else {
        const ipfsMatch = imageUrl.match(/\/ipfs\/(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[A-Za-z0-9]+)(\/.*)?/);
        if (ipfsMatch) {
          const hash = ipfsMatch[1];
          const path = ipfsMatch[2] || '';
          processedUrl = `https://gateway.pinata.cloud/ipfs/${hash}${path}`;
        }
      }
    }
    // Handle HTTP/HTTPS URLs
    else if (imageUrl.startsWith('http://')) {
      processedUrl = imageUrl.replace('http://', 'https://');
    }
    else if (imageUrl.startsWith('https://')) {
      processedUrl = imageUrl;
    }
    // Handle relative URLs or data URLs
    else if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
      processedUrl = imageUrl;
    }
    else {
      console.warn('Unsupported image URL format:', imageUrl);
      processedUrl = DEFAULT_PLACEHOLDER;
    }
    
    // Cache the processed URL
    if (processedUrl && processedUrl !== DEFAULT_PLACEHOLDER) {
      imageCache.set(imageUrl, processedUrl);
    }
    
    return processedUrl;
    
  } catch (error) {
    console.error('Error processing image URL:', error);
    return DEFAULT_PLACEHOLDER;
  }
};

/**
 * Fetch content from IPFS with gateway fallbacks
 * 
 * @param {string} ipfsUri - IPFS URI or CID
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchFromIPFSWithFallback = async (ipfsUri) => {
  if (!ipfsUri) throw new Error('No IPFS URI provided');
  
  // Available gateways in order of preference
  const gateways = [
    'https://nftstorage.link/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.cf-ipfs.com/ipfs/'
  ];
  
  let cid = ipfsUri;
  if (ipfsUri.startsWith('ipfs://')) {
    cid = ipfsUri.substring(7);
  }
  
  let lastError = null;
  
  // Try each gateway until one works
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway + cid, {
        method: 'GET',
        headers: {
          'Accept': '*/*'
        },
        mode: 'cors',
      });
      
      if (response.ok) {
        return response;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Gateway ${gateway} failed:`, err.message);
    }
  }
  
  throw new Error(`All IPFS gateways failed: ${lastError?.message}`);
};

// Replace the fetchTokenMetadata function to use our new fallback mechanism
export const fetchTokenMetadata = async (tokenURI) => {
  if (!tokenURI) return {};
  
  try {
    // Handle IPFS URIs with our enhanced fallback system
    if (tokenURI.startsWith('ipfs://')) {
      const response = await fetchFromIPFSWithFallback(tokenURI);
      return await response.json();
    }
    
    // Handle data URIs
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.substring('data:application/json;base64,'.length);
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    }
    
    // Handle HTTP URIs
    if (tokenURI.startsWith('http')) {
      // If it's a Pinata gateway URL, use our fallback method
      if (tokenURI.includes('gateway.pinata.cloud')) {
        const ipfsPath = tokenURI.split('/ipfs/')[1];
        if (ipfsPath) {
          const response = await fetchFromIPFSWithFallback(ipfsPath);
          return await response.json();
        }
      }
      
      // Regular HTTP fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(tokenURI, { signal: controller.signal });
      clearTimeout(timeoutId);
      return await response.json();
    }
    
    return {};
  } catch (error) {
    console.warn('Error fetching token metadata:', error);
    return {};
  }
};

/**
 * Generate placeholder NFT data for fallback
 */
const getPlaceholderNFTs = (address) => {
  return [
    { 
      id: '1', 
      name: "NUVO Early Supporter", 
      image: "/NFT-X1.webp",
      description: "Exclusive NFT granted to early supporters of the NUVO ecosystem.",
      minter: address,
      attributes: [
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Benefits", value: "Staking Boost" },
        { trait_type: "Type", value: "Membership" }
      ]
    }
  ];
};

/**
 * Fetch transaction history for an address
 * 
 * @param {string} address - Wallet address
 * @param {Object} provider - Ethers provider 
 * @param {Object} options - Additional options (limit, offset, etc.)
 * @returns {Array} - Array of transaction objects
 */
export const fetchTransactions = async (address, provider, options = {}) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const cacheKey = `txs_${address}_${options.chainId || '137'}`;
  const cachedTxs = getCachedData(cacheKey);
  if (cachedTxs) return cachedTxs;
  
  const chainId = options.chainId || 137; // Default to Polygon
  const apiKeys = getApiKeys();
  const limit = options.limit || 100;
  
  try {
    // Try Polygonscan API first if key exists (best for transaction history)
    if (apiKeys.polygonscan) {
      try {
        console.log("Fetching transactions from Polygonscan API");
        const baseUrl = chainId === 137 
          ? 'https://api.polygonscan.com/api' 
          : 'https://api-testnet.polygonscan.com/api';
        
        // Set a timeout for the API request to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKeys.polygonscan}&offset=${limit}`;
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.status === '1' && Array.isArray(data.result)) {
          // Process and categorize transactions
          const processedTxs = await processPolygonscanTransactions(data.result, address, provider);
          return setCachedData(cacheKey, processedTxs);
        } else {
          console.warn("Polygonscan API error:", data.message || "Unknown error");
          throw new Error("Polygonscan data unavailable");
        }
      } catch (scanError) {
        console.warn("Polygonscan API error:", scanError);
        // Fall through to next method
      }
    }
    
    // Direct blockchain method using provider with improved timeout handling
    if (provider) {
      try {
        console.log("Fetching transactions directly from blockchain");
        const blockNumber = await provider.getBlockNumber();
        const startBlock = Math.max(blockNumber - 10000, 0); // Get last 10000 blocks
        
        // Get transactions from blocks
        const txs = [];
        for (let i = blockNumber; i > startBlock && txs.length < limit; i -= 10) {
          try {
            const block = await provider.getBlock(i, { includeTransactions: true });
            if (!block || !block.transactions) continue;
            
            // Filter transactions that involve our address
            const relevantTxs = block.transactions.filter(tx => 
              tx.from?.toLowerCase() === address.toLowerCase() || 
              tx.to?.toLowerCase() === address.toLowerCase()
            );
            
            // Process each transaction
            for (const tx of relevantTxs) {
              if (txs.length >= limit) break;
              
              try {
                // Get receipt for more details
                const receipt = await provider.getTransactionReceipt(tx.hash);
                
                // Determine transaction type based on data and logs
                const txType = determineTransactionType(tx, receipt, address);
                
                txs.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value ? ethers.formatEther(tx.value) : '0',
                  timestamp: block.timestamp,
                  formattedDate: formatTimestamp(block.timestamp),
                  blockNumber: tx.blockNumber || block.number,
                  status: receipt?.status ? 'Confirmed' : 'Failed',
                  type: txType.type,
                  amount: txType.amount || ethers.formatEther(tx.value),
                  tokenAddress: txType.tokenAddress,
                  description: getTransactionDescription({
                    ...tx,
                    ...txType,
                    timestamp: block.timestamp,
                    status: receipt?.status ? 'Confirmed' : 'Failed'
                  }, address)
                });
              } catch (receiptError) {
                console.warn(`Error fetching receipt for tx ${tx.hash}:`, receiptError);
              }
            }
          } catch (blockError) {
            console.warn(`Error fetching block ${i}:`, blockError);
          }
        }
        
        return setCachedData(cacheKey, txs);
      } catch (providerError) {
        console.error("Error fetching transactions from provider:", providerError);
        // Fall through to fallback
      }
    }
    
    // If all methods fail, return placeholder data
    return setCachedData(cacheKey, getPlaceholderTransactions(address));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return getPlaceholderTransactions(address);
  }
};

/**
 * Process Polygonscan API transaction data
 */
const processPolygonscanTransactions = async (txs, address, provider) => {
  const processedTxs = [];
  const contractDataCache = new Map();
  
  for (const tx of txs) {
    try {
      // Basic transaction info
      const processed = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        timestamp: parseInt(tx.timeStamp),
        formattedDate: formatTimestamp(parseInt(tx.timeStamp)),
        blockNumber: parseInt(tx.blockNumber),
        status: tx.txreceipt_status === '1' ? 'Confirmed' : 'Failed',
        type: 'Transfer', // Default type, may be updated below
        amount: ethers.formatEther(tx.value),
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice
      };
      
      // Determine transaction type
      if (tx.input && tx.input.length > 10) {
        const methodId = tx.input.substring(0, 10);
        
        // Cache contract data by address to reduce RPC calls
        if (!contractDataCache.has(tx.to) && provider) {
          try {
            const code = await provider.getCode(tx.to);
            if (code && code !== '0x') {
              // It's a contract, try to determine its purpose
              const contract = new ethers.Contract(tx.to, erc20Abi, provider);
              
              let symbol = '';
              let decimals = 18;
              try {
                symbol = await contract.symbol();
                decimals = await contract.decimals();
              } catch (e) {
                // Not an ERC20 token
              }
              
              contractDataCache.set(tx.to, { isContract: true, symbol, decimals });
            } else {
              contractDataCache.set(tx.to, { isContract: false });
            }
          } catch (e) {
            contractDataCache.set(tx.to, { isContract: false });
          }
        }
        
        // Get contract data from cache
        const contractData = contractDataCache.get(tx.to);
        
        // Common method IDs for standard ERC20/721 operations
        if (methodId === '0xa9059cbb') { // ERC20 transfer
          processed.type = 'Token Transfer';
          processed.tokenAddress = tx.to;
          
          // Try to decode parameters if we have contract data
          if (contractData?.symbol) {
            try {
              const iface = new ethers.Interface(erc20Abi);
              const decodedData = iface.parseTransaction({ data: tx.input });
              const amount = ethers.formatUnits(decodedData.args[1], contractData.decimals);
              processed.amount = `${amount} ${contractData.symbol}`;
            } catch (e) {
              // Fallback if parsing fails
              processed.amount = 'Unknown';
            }
          }
        } else if (methodId === '0x095ea7b3') { // ERC20 approve
          processed.type = 'Approve';
          processed.tokenAddress = tx.to;
        } else if (methodId === '0xa0712d68') { // Mint NFT (common pattern)
          processed.type = 'Mint NFT';
        } else if (methodId === '0xed88c68e' || methodId === '0x44bd4627') { // Stake/deposit (common patterns)
          processed.type = 'Stake';
        } else if (methodId === '0x3ccfd60b' || methodId === '0x2e1a7d4d') { // Withdraw (common patterns)
          processed.type = 'Withdraw';
        } else if (methodId === '0x797eee24' || methodId === '0x3d18b912') { // Claim rewards (common patterns)
          processed.type = 'Claim';
        } else if (methodId === '0x38ed1739' || methodId === '0x7ff36ab5') { // Swap (common patterns)
          processed.type = 'Swap';
        }
      } else if (tx.value !== '0') {
        processed.type = 'Transfer';
        if (tx.from.toLowerCase() === address.toLowerCase()) {
          processed.description = `Sent ${processed.amount} MATIC`;
        } else {
          processed.description = `Received ${processed.amount} MATIC`;
        }
      }
      
      // If we haven't set a description yet, set it based on the determined type
      if (!processed.description) {
        processed.description = getTransactionDescription(processed, address);
      }
      
      processedTxs.push(processed);
    } catch (txError) {
      console.warn(`Error processing transaction ${tx.hash}:`, txError);
    }
  }
  
  return processedTxs;
};

/**
 * Determine transaction type from transaction data and receipt
 */
const determineTransactionType = (tx, receipt, userAddress) => {
  // Default type
  const result = { 
    type: 'Transfer', 
    amount: tx.value ? ethers.formatEther(tx.value) : '0',
    tokenAddress: null
  };
  
  // Try to determine transaction type from data
  if (tx.data && tx.data.length > 10) {
    const methodId = tx.data.substring(0, 10);
    
    switch (methodId) {
      // Common methods by signature
      case '0xa9059cbb': // ERC20 transfer
        result.type = 'Token Transfer';
        result.tokenAddress = tx.to;
        break;
      case '0x095ea7b3': // approve
        result.type = 'Approve';
        result.tokenAddress = tx.to;
        break;
      case '0x23b872dd': // transferFrom
        result.type = 'Token Transfer';
        result.tokenAddress = tx.to;
        break;
      case '0xd0e30db0': // deposit
      case '0xa694fc3a': // stake
        result.type = 'Stake';
        break;
      case '0x2e1a7d4d': // withdraw
      case '0x853828b6': // withdrawAll
        result.type = 'Withdraw';
        break;
      case '0x6a761202': // execTransaction (common for multisig wallets)
        result.type = 'Contract Interaction';
        break;
      default:
        // Check if it might be a swap by input length
        if (tx.data.length > 200) { 
          result.type = 'Contract Interaction';
        }
    }
  }
  
  // Further refine type using receipt logs if available
  if (receipt && receipt.logs) {
    // Look for ERC20 Transfer events
    const transferEventTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const transferLogs = receipt.logs.filter(log => log.topics[0] === transferEventTopic);
    
    if (transferLogs.length > 0) {
      // If we have transfer events, this might be a token transaction
      if (transferLogs.length === 1) {
        result.type = 'Token Transfer';
        result.tokenAddress = transferLogs[0].address;
      } else if (transferLogs.length === 2) {
        // Might be a swap (one token in, one token out)
        result.type = 'Swap';
      }
    }
  }
  
  return result;
};

/**
 * Format a timestamp into a human-readable date
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  
  try {
    const date = new Date(timestamp * 1000);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

/**
 * Generate transaction description based on transaction data
 */
const getTransactionDescription = (tx, userAddress = '') => {
  const address = userAddress.toLowerCase();
  
  switch (tx.type) {
    case 'Stake':
      return `Depositaste ${tx.amount} en el staking`;
    case 'Claim':
      return `Reclamaste ${tx.amount} de recompensas`;
    case 'Transfer':
      return tx.from?.toLowerCase() === address 
        ? `Enviaste ${tx.amount} a ${formatAddress(tx.to)}`
        : `Recibiste ${tx.amount} de ${formatAddress(tx.from)}`;
    case 'Token Transfer':
      return tx.from?.toLowerCase() === address 
        ? `Enviaste ${tx.amount || 'tokens'} a ${formatAddress(tx.to)}`
        : `Recibiste ${tx.amount || 'tokens'} de ${formatAddress(tx.from)}`;
    case 'Swap':
      return `Intercambiaste ${tx.amount || 'tokens'}`;
    case 'Approve':
      return `Aprobaste tokens para gastar`;
    case 'Withdraw':
      return `Retiraste ${tx.amount || 'tokens'}`;
    case 'Mint NFT':
      return 'Minteaste un NFT';
    case 'Contract Interaction':
      return 'Interactuaste con un contrato';
    default:
      return `Transacción: ${formatAddress(tx.hash)}`;
  }
};

/**
 * Format address for readability
 */
const formatAddress = (address) => {
  if (!address) return 'desconocido';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Generate placeholder transaction data for fallback
 */
const getPlaceholderTransactions = (address) => {
  const now = Math.floor(Date.now() / 1000);
  
  return [
    {
      id: generateRandomId(),
      type: 'Stake',
      amount: '10.5 POL',
      tokenAddress: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
      timestamp: now - 86400 * 2,
      formattedDate: formatTimestamp(now - 86400 * 2),
      status: 'Completed',
      hash: generateRandomId(),
      from: address,
      to: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
      description: `Depositaste 10.5 POL en el staking`
    },
    {
      id: generateRandomId(),
      type: 'Claim',
      amount: '1.2 POL',
      tokenAddress: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
      timestamp: now - 86400 * 5,
      formattedDate: formatTimestamp(now - 86400 * 5),
      status: 'Completed',
      hash: generateRandomId(),
      from: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
      to: address,
      description: `Reclamaste 1.2 POL de recompensas`
    }
  ];
};

/**
 * Generate a random transaction ID
 */
const generateRandomId = () => {
  return '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
};

/**
 * Fetch ERC20 token balances for an address
 * 
 * @param {string} address - Wallet address
 * @param {Object} provider - Ethers provider
 * @param {Object} options - Additional options like tokenAddresses
 * @returns {Array} - Array of token balance objects
 */
export const fetchTokenBalances = async (address, provider, options = {}) => {
  if (!address) {
    throw new Error("Address is required");
  }
  
  const cacheKey = `balances_${address}`;
  const cachedBalances = getCachedData(cacheKey);
  if (cachedBalances) return cachedBalances;

  const tokenAddresses = options.tokenAddresses || [
    '0x0000000000000000000000000000000000001010', // MATIC on Polygon
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',  // USDC on Polygon
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',  // WETH on Polygon
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',  // WBTC on Polygon
  ];
  
  try {
    // Add NUVO token if specified in options
    if (options.nuvoTokenAddress) {
      tokenAddresses.push(options.nuvoTokenAddress);
    }
    
    // 1. Try to use provider to get balances
    if (provider) {
      try {
        console.log("Fetching token balances from blockchain");
        const balances = await Promise.all(
          tokenAddresses.map(async (tokenAddress) => {
            try {
              // Special case for native MATIC
              if (tokenAddress === '0x0000000000000000000000000000000000001010') {
                const balance = await provider.getBalance(address);
                return {
                  address: tokenAddress,
                  symbol: 'MATIC',
                  name: 'Polygon',
                  decimals: 18,
                  logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025',
                  balance: ethers.formatUnits(balance, 18),
                  // We would fetch these from a price API in production
                  price: 0.68,
                  change: 2.45
                };
              }
              
              // For ERC20 tokens
              const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
              
              // Fetch token details and balance in parallel
              const [balance, symbol, name, decimals] = await Promise.all([
                contract.balanceOf(address).catch(() => BigInt(0)),
                contract.symbol().catch(() => 'UNKNOWN'),
                contract.name().catch(() => 'Unknown Token'),
                contract.decimals().catch(() => 18)
              ]);
              
              // Get logo URL based on symbol (in production, use a token DB)
              const logo = getTokenLogo(symbol);
              
              return {
                address: tokenAddress,
                symbol,
                name,
                decimals,
                logo,
                balance: ethers.formatUnits(balance, decimals),
                // Placeholder prices - would use price API in production
                price: symbol === 'USDC' ? 1.0 : 0.0,
                change: symbol === 'USDC' ? 0.01 : 0.0
              };
            } catch (tokenError) {
              console.warn(`Error fetching details for token ${tokenAddress}:`, tokenError);
              return null;
            }
          })
        );
        
        // Filter out failed tokens and set cache
        const validBalances = balances.filter(Boolean);
        return setCachedData(cacheKey, validBalances);
      } catch (providerError) {
        console.error("Error fetching balances from provider:", providerError);
        // Fall through to fallback
      }
    }
    
    // 2. Fallback to placeholder data
    return setCachedData(cacheKey, getPlaceholderTokenBalances());
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return getPlaceholderTokenBalances();
  }
};

/**
 * Get token logo URL based on symbol
 */
const getTokenLogo = (symbol) => {
  const logos = {
    'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025',
    'WMATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025',
    'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=025',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025',
    'WETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025',
    'WBTC': 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg?v=025',
    'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=025',
    'NUVO': '/LogoNuvos.webp'
  };
  
  return logos[symbol] || '/token-placeholder.png';
};

/**
 * Generate placeholder token balance data
 */
const getPlaceholderTokenBalances = () => {
  return [
    {
      address: '0x0000000000000000000000000000000000001010',
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025',
      balance: "25.5",
      price: 0.68,
      change: 2.45
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=025',
      balance: "100.0",
      price: 1.0,
      change: 0.01
    },
    {
      address: '0xnuvoaddress',
      symbol: 'NUVO',
      name: 'Nuvos Token',
      decimals: 18,
      logo: '/LogoNuvos.webp',
      balance: "500.0",
      price: 0.0,
      change: 0.0
    }
  ];
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

/**
 * Upload data to IPFS using Pinata
 * 
 * @param {Object} data - JSON data to upload
 * @param {Object} options - Upload options including Pinata keys
 * @returns {Promise<string>} - IPFS URI (ipfs://...)
 */
export const uploadJsonToIPFS = async (data, options = {}) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const headers = {
    'Content-Type': 'application/json',
    ...getPinataHeaders()
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    let result;
    try {
      result = await response.json();
    } catch {
      result = {};
    }
    if (!response.ok) {
      // Improve error message for Pinata 401/403
      let pinataMsg = result.error || result.errorDetails || result.message || result.error_message;
      if (!pinataMsg && typeof result === 'object') {
        pinataMsg = JSON.stringify(result);
      }
      // Ensure pinataMsg is always a string
      if (typeof pinataMsg === 'object') {
        pinataMsg = JSON.stringify(pinataMsg);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Pinata authentication failed (HTTP ${response.status}). Verifica tus credenciales de Pinata (API Key/Secret o JWT). Mensaje: ${pinataMsg || response.statusText}`
        );
      }
      throw new Error(`Pinata error: ${pinataMsg || response.statusText}`);
    }
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    // Re-throw error to be handled by caller
    throw error;
  }
};

// Utilidad para obtener headers de Pinata (API Key/Secret o JWT)
const getPinataHeaders = () => {
  // Use correct variable names from .env/.env.local
  const apiKey = import.meta.env.VITE_PINATA || '';
  const secret = import.meta.env.VITE_PINATA_SK || '';
  const jwt = import.meta.env.VITE_PINATA_JWT || '';
  // Validate JWT: must have 3 segments separated by '.'
  if (jwt && jwt.split('.').length === 3) {
    return { Authorization: `Bearer ${jwt}` };
  }
  if (jwt && jwt.length > 0) {
    // JWT present but malformed
    console.warn(
      '[Pinata] JWT token is malformed (should have 3 segments separated by dots). Falling back to API Key/Secret.'
    );
  }
  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secret
  };
};

/**
 * Upload file to IPFS using Pinata
 * 
 * @param {File} file - File to upload
 * @param {Object} options - Upload options including Pinata keys
 * @returns {Promise<string>} - IPFS URI (ipfs://...)
 */
export const uploadFileToIPFS = async (file, options = {}) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();
  formData.append('file', file);

  const headers = getPinataHeaders();
  let fetchHeaders = {};
  if (headers.Authorization) {
    fetchHeaders['Authorization'] = headers.Authorization;
  } else {
    fetchHeaders['pinata_api_key'] = headers.pinata_api_key;
    fetchHeaders['pinata_secret_api_key'] = headers.pinata_secret_api_key;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: fetchHeaders
    });
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok) {
      // Improve error message for Pinata 401/403
      let pinataMsg = data.error || data.errorDetails || data.message || data.error_message;
      if (!pinataMsg && typeof data === 'object') {
        pinataMsg = JSON.stringify(data);
      }
      // Ensure pinataMsg is always a string
      if (typeof pinataMsg === 'object') {
        pinataMsg = JSON.stringify(pinataMsg);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Pinata authentication failed (HTTP ${response.status}). Verifica tus credenciales de Pinata (API Key/Secret o JWT). Mensaje: ${pinataMsg || response.statusText}`
        );
      }
      throw new Error(`Pinata error: ${pinataMsg || response.statusText}`);
    }
    return `ipfs://${data.IpfsHash}`;
  } catch (err) {
    console.error("Error uploading file to IPFS:", err);
    throw err;
  }
};

/**
 * Safely fetch logs from a blockchain by dividing the request into smaller chunks
 * to handle RPC provider limitations (typically 500 blocks per request)
 * 
 * @param {Object} provider - Ethers provider
 * @param {Object} filter - Log filter object
 * @param {number} chunkSize - Maximum blocks per request (default: 480)
 * @param {number} maxRetries - Maximum retry attempts per chunk
 * @returns {Array} - Combined array of log results
 */
export const fetchLogsInChunks = async (provider, filter, chunkSize = 480, maxRetries = 3) => {
  if (!provider) throw new Error('Provider is required');

  const cacheKey = `logs_${filter.address || 'all'}_${(filter.topics || []).join('-')}_${filter.fromBlock}_${filter.toBlock}`;

  // Usa el caché y evita múltiples fetch simultáneos
  if (!shouldFetchLogs(cacheKey)) {
    const cachedData = getCachedLogs(cacheKey);
    if (cachedData) return cachedData;
    // Si hay una consulta en progreso, espera un poco y reintenta (simple polling)
    await new Promise(r => setTimeout(r, 500));
    return getCachedLogs(cacheKey) || [];
  }

  markLogQueryInProgress(cacheKey);

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
      cacheLogResult(cacheKey, logs);
      return logs;
    }

    // Solo un log de inicio
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
      await new Promise(r => setTimeout(r, 200)); // Menor delay para más eficiencia
    }

    cacheLogResult(cacheKey, logs);
    return logs;
  } catch (error) {
    console.error('[LogFetch] Error fetching logs in chunks:', error);
    cacheLogResult(cacheKey, null);
    return [];
  }
};

/**
 * Decode contract custom error from error data
 * @param {string} errorData - The error data from contract call
 * @returns {string} - Human readable error message
 */
export const decodeContractError = (errorData) => {
  const errorSignatures = {
    '0x8f563f02': 'CategoryNotValid - The category must be registered in the contract first',
    '0x82b42960': 'Unauthorized - You are not authorized to perform this action',
    '0x677510db': 'TokenDoesNotExist - The NFT does not exist',
    '0x037eff13': 'TokenNotForSale - The NFT is not available for sale operations',
    '0x356680b7': 'InsufficientFunds - Insufficient funds for the operation',
    '0xb4fa3fb3': 'InvalidInput - Invalid input parameters provided',
    '0x0df56d4f': 'SectionPaused - This section is currently paused',
    '0xc2b03beb': 'RoyaltyTooHigh - The royalty percentage is too high',
    '0x99fb3302': 'BlacklistedAddress - This address is blacklisted',
    '0x12171d83': 'TransferFailed - The transfer operation failed'
  };

  return errorSignatures[errorData] || `Unknown contract error (${errorData})`;
};

/**
 * Mapping functions for categories
 */
export const mapCategoryToSpanish = (category) => {
  const categoryMap = {
    'collectible': 'coleccionables',
    'artwork': 'arte', 
    'item': 'artículo',
    'document': 'documento',
    'realestate': 'inmuebles',
    'art': 'arte',
    'photo': 'fotografía',
    'music': 'música',
    'video': 'video'
  };
  
  return categoryMap[category?.toLowerCase()] || category || 'coleccionables';
};

export const mapCategoryToEnglish = (category) => {
  const categoryMap = {
    'coleccionables': 'collectible',
    'arte': 'art',
    'artículo': 'item', 
    'documento': 'document',
    'inmuebles': 'realestate',
    'fotografía': 'photo',
    'música': 'music',
    'video': 'video'
  };
  
  return categoryMap[category?.toLowerCase()] || category || 'collectible';
};

// Category normalization mapping - ensure all categories are in English
const CATEGORY_MAPPING = {
  // English (keep as is)
  'collectible': 'collectible',
  'art': 'art',
  'photo': 'photo',
  'music': 'music',
  'video': 'video',
  'document': 'document',
  'game': 'game',
  'utility': 'utility',
  
  // Spanish to English mapping
  'coleccionable': 'collectible',
  'arte': 'art',
  'foto': 'photo',
  'musica': 'music',
  'música': 'music',
  'video': 'video',
  'documento': 'document',
  'juego': 'game',
  'utilidad': 'utility',
  
  // Common variations
  'collectibles': 'collectible',
  'artwork': 'art',
  'photograph': 'photo',
  'photography': 'photo',
  'videos': 'video',
  'documents': 'document',
  'gaming': 'game',
  'games': 'game',
  
  // Default fallback
  'other': 'collectible',
  'others': 'collectible',
  'misc': 'collectible',
  'miscellaneous': 'collectible'
};

// Enhanced category normalization function
export const normalizeCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return 'collectible'; // default fallback
  }
  
  // Convert to lowercase and trim whitespace
  const normalized = category.toLowerCase().trim();
  
  // Check if we have a direct mapping
  if (CATEGORY_MAPPING[normalized]) {
    return CATEGORY_MAPPING[normalized];
  }
  
  // If no mapping found, return collectible as default
  return 'collectible';
};

// Get display name for categories (always in English)
export const getCategoryDisplayName = (category) => {
  const normalizedCategory = normalizeCategory(category);
  
  const displayNames = {
    'collectible': 'Collectible',
    'art': 'Art',
    'photo': 'Photo',
    'music': 'Music',
    'video': 'Video',
    'document': 'Document',
    'game': 'Game',
    'utility': 'Utility'
  };
  
  return displayNames[normalizedCategory] || 'Collectible';
};

// Get all available categories in English
export const getAvailableCategories = () => {
  return [
    { value: 'all', label: 'All Categories' },
    { value: 'collectible', label: 'Collectible' },
    { value: 'art', label: 'Art' },
    { value: 'photo', label: 'Photo' },
    { value: 'music', label: 'Music' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'game', label: 'Game' },
    { value: 'utility', label: 'Utility' }
  ];
};