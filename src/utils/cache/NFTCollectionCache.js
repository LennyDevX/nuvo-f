// NFT Collection Cache Management System
class NFTCollectionCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = 10 * 60 * 1000; // 10 minutes default TTL for user NFTs
    this.METADATA_TTL = 30 * 60 * 1000; // 30 minutes for metadata
    this.USER_NFTS_TTL = 10 * 60 * 1000; // 10 minutes for user NFTs (less dynamic than marketplace)
  }

  // Generate cache key
  generateKey(type, identifier, contractAddress = 'global') {
    return `${type}_${identifier}_${contractAddress}`;
  }

  // Set cache with custom TTL
  set(key, value, customTTL = null) {
    this.cache.set(key, value);
    this.timestamps.set(key, {
      created: Date.now(),
      ttl: customTTL || this.TTL
    });
  }

  // Get from cache with TTL check
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return null;
    
    const now = Date.now();
    if (now - timestamp.created > timestamp.ttl) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Clear expired entries
  clearExpired() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp.created > timestamp.ttl) {
        this.delete(key);
      }
    }
  }

  // Cache user NFTs
  setUserNFTs(userAddress, contractAddress, nfts) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    this.set(key, nfts, this.USER_NFTS_TTL);
  }

  getUserNFTs(userAddress, contractAddress) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    return this.get(key);
  }

  // Cache token metadata
  setTokenMetadata(tokenURI, metadata) {
    const key = this.generateKey('metadata', tokenURI, 'global');
    this.set(key, metadata, this.METADATA_TTL);
  }

  getTokenMetadata(tokenURI) {
    const key = this.generateKey('metadata', tokenURI, 'global');
    return this.get(key);
  }

  // Cache individual NFT data
  setNFTData(contractAddress, tokenId, nftData) {
    const key = this.generateKey('nft_data', tokenId, contractAddress);
    this.set(key, nftData, this.TTL);
  }

  getNFTData(contractAddress, tokenId) {
    const key = this.generateKey('nft_data', tokenId, contractAddress);
    return this.get(key);
  }

  // Cache user's created tokens
  setUserCreatedTokens(userAddress, contractAddress, tokens) {
    const key = this.generateKey('user_created', userAddress, contractAddress);
    this.set(key, tokens, this.USER_NFTS_TTL);
  }

  getUserCreatedTokens(userAddress, contractAddress) {
    const key = this.generateKey('user_created', userAddress, contractAddress);
    return this.get(key);
  }

  // Cache user stats
  setUserStats(userAddress, contractAddress, stats) {
    const key = this.generateKey('user_stats', userAddress, contractAddress);
    this.set(key, stats, this.TTL);
  }

  getUserStats(userAddress, contractAddress) {
    const key = this.generateKey('user_stats', userAddress, contractAddress);
    return this.get(key);
  }

  // Invalidate specific user data
  invalidateUserData(userAddress, contractAddress) {
    const patterns = [
      `user_nfts_${userAddress}_${contractAddress}`,
      `user_created_${userAddress}_${contractAddress}`,
      `user_stats_${userAddress}_${contractAddress}`
    ];
    
    for (const pattern of patterns) {
      this.delete(pattern);
    }
  }

  // Invalidate all user NFT data across contracts
  invalidateAllUserData(userAddress) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`_${userAddress}_`)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  // Get cache status for a specific user
  getUserCacheStatus(userAddress, contractAddress) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp) return null;
    
    const now = Date.now();
    const age = now - timestamp.created;
    const remaining = Math.max(0, timestamp.ttl - age);
    
    return {
      cached: true,
      age: Math.round(age / 1000),
      remaining: Math.round(remaining / 1000),
      expired: remaining <= 0,
      createdAt: new Date(timestamp.created).toLocaleTimeString()
    };
  }

  // Get cache info for debugging
  getCacheInfo() {
    const info = {
      totalEntries: this.cache.size,
      entries: []
    };
    
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      const age = now - timestamp.created;
      const remaining = Math.max(0, timestamp.ttl - age);
      info.entries.push({
        key,
        age: Math.round(age / 1000),
        remaining: Math.round(remaining / 1000),
        expired: remaining <= 0
      });
    }
    
    return info;
  }

  // Batch invalidate metadata for specific tokens
  invalidateTokensMetadata(tokenURIs) {
    for (const uri of tokenURIs) {
      const key = this.generateKey('metadata', uri, 'global');
      this.delete(key);
    }
  }

  // Check if user data needs refresh
  shouldRefreshUserData(userAddress, contractAddress, forceAfterMs = 5 * 60 * 1000) {
    const key = this.generateKey('user_nfts', userAddress, contractAddress);
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp) return true;
    
    const now = Date.now();
    return (now - timestamp.created) > forceAfterMs;
  }
}

// Export singleton instance
export const nftCollectionCache = new NFTCollectionCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  nftCollectionCache.clearExpired();
}, 10 * 60 * 1000);

export default nftCollectionCache;
