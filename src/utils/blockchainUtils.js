import { ethers } from 'ethers';

// ERC20 ABI (minimal for balanceOf function)
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Fetch NFTs owned by an address
export const fetchNFTs = async (address, provider) => {
  try {
    // In a real implementation, you would use an NFT indexer API like Alchemy, Moralis or Covalent
    // Example with Alchemy:
    // const apiKey = 'YOUR_ALCHEMY_API_KEY';
    // const url = `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}/getNFTs/?owner=${address}`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data.ownedNfts.map(nft => {...});
    
    // For demonstration purposes, we'll return placeholder data
    // Actual implementation would query indexed NFT data
    return [
      { 
        id: 1, 
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
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
};

// Fetch transaction history for an address
export const fetchTransactions = async (address, provider) => {
  try {
    // In a real implementation, you would use a blockchain explorer API like Etherscan/Polygonscan
    // Example with Polygonscan:
    // const apiKey = 'YOUR_POLYGONSCAN_API_KEY';
    // const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data.result.map(tx => {...});
    
    // For demonstration purposes, we'll return placeholder data
    // The actual implementation would fetch real transactions from the blockchain
    return [
      {
        id: '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
        type: 'Stake',
        amount: '10.5 POL',
        tokenAddress: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
        status: 'Completed',
        hash: '0x' + Math.random().toString(16).slice(2, 66)
      },
      {
        id: '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
        type: 'Claim',
        amount: '1.2 POL',
        tokenAddress: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
        status: 'Completed',
        hash: '0x' + Math.random().toString(16).slice(2, 66)
      },
      {
        id: '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
        type: 'Swap',
        amount: '50 USDC → 48.5 POL',
        tokenAddress: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 15,
        status: 'Completed',
        hash: '0x' + Math.random().toString(16).slice(2, 66)
      }
    ];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Fetch ERC20 token balances for common tokens
export const fetchTokenBalances = async (address, provider) => {
  try {
    // Common tokens on Polygon network - in a real app, this would be more comprehensive
    const tokens = [
      { 
        address: '0x0000000000000000000000000000000000001010',  // MATIC
        symbol: 'MATIC', 
        name: 'Polygon',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025'
      },
      { 
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',  // USDC
        symbol: 'USDC', 
        name: 'USD Coin',
        decimals: 6,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=025'
      },
      { 
        address: '0x8c92e38eca8210f4fcbf17f0951b198dd7668292',  // POL (hypothetical)
        symbol: 'POL', 
        name: 'Polygon',
        decimals: 18,
        logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025'
      },
    ];

    // Placeholder NUVO token
    const nuvoToken = {
      address: '0xnuvoaddress',
      symbol: 'NUVO',
      name: 'Nuvos Token',
      decimals: 18,
      logo: '/LogoNuvos.webp'
    };
    
    // In a real implementation, we would query the blockchain for each token balance
    // Here's how you would do it for a single token:
    /*
    const results = await Promise.all(tokens.map(async (token) => {
      try {
        // For native MATIC
        if (token.symbol === 'MATIC') {
          const balance = await provider.getBalance(address);
          return {
            ...token,
            balance: ethers.formatUnits(balance, 18),
            price: 0.68, // Would come from a price API
            change: 2.45 // Would come from a price API
          };
        }
        
        // For ERC20 tokens
        const contract = new ethers.Contract(token.address, erc20Abi, provider);
        const balance = await contract.balanceOf(address);
        return {
          ...token,
          balance: ethers.formatUnits(balance, token.decimals),
          price: token.symbol === 'USDC' ? 1.0 : 0.0, // Price would come from API
          change: token.symbol === 'USDC' ? 0.01 : 0.0 // Change would come from API
        };
      } catch (error) {
        console.error(`Error fetching ${token.symbol} balance:`, error);
        return {
          ...token,
          balance: "0.0",
          price: 0.0,
          change: 0.0
        };
      }
    }));
    */
    
    // For demonstration purposes, return sample data
    const results = [
      {
        ...tokens[0], // MATIC
        balance: "25.5",
        price: 0.68,
        change: 2.45
      },
      {
        ...tokens[1], // USDC
        balance: "100.0",
        price: 1.0,
        change: 0.01
      },
      {
        ...tokens[2], // POL
        balance: "200.0",
        price: 0.68,
        change: 2.45
      },
      {
        ...nuvoToken,
        balance: "500.0",
        price: 0.0, // Not yet trading
        change: 0.0
      }
    ];
    
    return results;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
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
  
  try {
    const currentBlock = await provider.getBlockNumber();
    const startBlock = filter.fromBlock === 0 || !filter.fromBlock ? 
      Math.max(0, currentBlock - 50000) : // Start from recent history instead of genesis
      parseInt(filter.fromBlock);
    
    const endBlock = filter.toBlock === 'latest' ? currentBlock : parseInt(filter.toBlock);
    
    // If range is already small enough, make direct request
    if (endBlock - startBlock <= chunkSize) {
      return await provider.getLogs({
        ...filter,
        fromBlock: ethers.toQuantity(startBlock),
        toBlock: ethers.toQuantity(endBlock)
      });
    }
    
    // Otherwise fetch in chunks
    console.log(`Fetching logs in chunks from block ${startBlock} to ${endBlock}`);
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
          console.log(`Successfully fetched logs for blocks ${from}-${to}: ${chunk.length} results`);
        } catch (error) {
          attempt++;
          console.warn(`Error fetching logs for blocks ${from}-${to} (attempt ${attempt}/${maxRetries}):`, error.message);
          
          if (attempt >= maxRetries) {
            console.error(`Max retries exceeded for blocks ${from}-${to}`);
          } else {
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      
      // Add small delay between chunks to prevent rate limiting
      await new Promise(r => setTimeout(r, 300));
    }
    
    return logs;
  } catch (error) {
    console.error('Error fetching logs in chunks:', error);
    return [];
  }
};
