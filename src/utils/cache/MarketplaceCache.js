// Marketplace Cache Management System
class MarketplaceCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = 5 * 60 * 1000; // 5 minutes default TTL
    this.METADATA_TTL = 30 * 60 * 1000; // 30 minutes for metadata
    this.LISTING_TTL = 2 * 60 * 1000; // 2 minutes for listings (more dynamic)
  }

  // Generate cache key
  generateKey(type, identifier, contractAddress) {
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

  // Cache marketplace listings
  setMarketplaceListings(contractAddress, listings) {
    const key = this.generateKey('marketplace_listings', 'all', contractAddress);
    this.set(key, listings, this.LISTING_TTL);
  }

  getMarketplaceListings(contractAddress) {
    const key = this.generateKey('marketplace_listings', 'all', contractAddress);
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

  // Cache token listing status
  setTokenListing(contractAddress, tokenId, listingData) {
    const key = this.generateKey('token_listing', tokenId, contractAddress);
    this.set(key, listingData, this.LISTING_TTL);
  }

  getTokenListing(contractAddress, tokenId) {
    const key = this.generateKey('token_listing', tokenId, contractAddress);
    return this.get(key);
  }

  // Cache stats
  setMarketplaceStats(contractAddress, stats) {
    const key = this.generateKey('marketplace_stats', 'all', contractAddress);
    this.set(key, stats, this.TTL);
  }

  getMarketplaceStats(contractAddress) {
    const key = this.generateKey('marketplace_stats', 'all', contractAddress);
    return this.get(key);
  }

  // Invalidate specific data
  invalidateMarketplace(contractAddress) {
    const patterns = [
      `marketplace_listings_all_${contractAddress}`,
      `marketplace_stats_all_${contractAddress}`
    ];
    
    for (const pattern of patterns) {
      this.delete(pattern);
    }
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
}

// Export singleton instance
export const marketplaceCache = new MarketplaceCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  marketplaceCache.clearExpired();
}, 5 * 60 * 1000);

export default marketplaceCache;
