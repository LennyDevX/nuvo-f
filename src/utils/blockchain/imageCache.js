// Enhanced cache for IPFS images and NFT metadata with localStorage persistence and request deduplication.
class IPFSImageCache {
  constructor() {
    this.cache = this.loadFromLocalStorage();
    this.metadataCache = new Map(); // In-memory metadata cache
    this.pendingRequests = new Map(); // Track pending requests to avoid duplicates
    this.cleanup();
  }

  loadFromLocalStorage() {
    if (typeof localStorage === 'undefined') {
      return new Map();
    }
    try {
      const data = localStorage.getItem('ipfs-image-cache');
      return data ? new Map(JSON.parse(data)) : new Map();
    } catch (e) {
      console.error('Failed to load image cache from localStorage', e);
      return new Map();
    }
  }

  saveToLocalStorage() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      const data = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem('ipfs-image-cache', data);
    } catch (e) {
      console.error('Failed to save image cache to localStorage', e);
    }
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 días
      return item.url;
    }
    return null;
  }

  set(key, url) {
    this.cache.set(key, {
      url,
      timestamp: Date.now()
    });
    this.saveToLocalStorage();
  }

  // Enhanced metadata caching with deduplication
  async getMetadata(uri) {
    if (!uri) return null;
    
    // Check cache first
    const cached = this.metadataCache.get(uri);
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutes cache
      return cached.data;
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(uri)) {
      return this.pendingRequests.get(uri);
    }
    
    // Create new request
    const requestPromise = this.fetchMetadataInternal(uri);
    this.pendingRequests.set(uri, requestPromise);
    
    try {
      const metadata = await requestPromise;
      // Cache successful result
      this.metadataCache.set(uri, {
        data: metadata,
        timestamp: Date.now()
      });
      return metadata;
    } catch (error) {
      console.warn('Error fetching metadata:', error);
      return null;
    } finally {
      this.pendingRequests.delete(uri);
    }
  }

  async fetchMetadataInternal(uri) {
    if (!uri) return null;
    
    let url = uri;
    
    // Handle IPFS URIs
    if (uri.startsWith('ipfs://')) {
      url = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    
    // Handle data URIs
    if (uri.startsWith('data:application/json;base64,')) {
      const base64Data = uri.substring('data:application/json;base64,'.length);
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    }
    
    // Set timeout for request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Batch metadata fetching for multiple URIs
  async getMetadataBatch(uris) {
    const results = await Promise.allSettled(
      uris.map(uri => this.getMetadata(uri))
    );
    
    return results.map((result, index) => ({
      uri: uris[index],
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    
    let wasChanged = false;
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
        wasChanged = true;
      }
    }

    // Clean metadata cache
    for (const [key, value] of this.metadataCache.entries()) {
      if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
        this.metadataCache.delete(key);
      }
    }

    if (wasChanged) {
      this.saveToLocalStorage();
    }
  }

  clear() {
    this.cache.clear();
    this.metadataCache.clear();
    this.pendingRequests.clear();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ipfs-image-cache');
    }
  }

  // Get cache statistics
  getStats() {
    return {
      imagesCached: this.cache.size,
      metadataCached: this.metadataCache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

export const imageCache = new IPFSImageCache();
