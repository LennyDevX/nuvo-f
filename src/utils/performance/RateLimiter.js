export class RateLimiter {
  constructor(maxCalls = 25, timeWindow = 1000) {
    this.calls = new Map();
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.statistics = {
      totalCalls: 0,
      allowedCalls: 0,
      limitedCalls: 0
    };
  }

  canMakeCall(key) {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    const recentCalls = calls.filter(time => now - time < this.timeWindow);
    
    // Update statistics
    this.statistics.totalCalls++;
    
    if (recentCalls.length >= this.maxCalls) {
      this.statistics.limitedCalls++;
      return false;
    }
    
    this.calls.set(key, [...recentCalls, now]);
    this.statistics.allowedCalls++;
    return true;
  }
  
  // Add method to get the time until next available call
  getTimeUntilAvailable(key) {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    
    if (calls.length < this.maxCalls) return 0;
    
    // Sort calls by timestamp (oldest first)
    const sortedCalls = [...calls].sort((a, b) => a - b);
    // Get the oldest call that's still within the time window
    const oldestRecent = sortedCalls[calls.length - this.maxCalls];
    
    // Calculate when this call will expire
    const timeUntilExpiry = (oldestRecent + this.timeWindow) - now;
    return Math.max(0, timeUntilExpiry);
  }

  // Add method to reset rate limit for a specific key
  resetLimit(key) {
    this.calls.delete(key);
  }
  
  // Add method to get statistics
  getStatistics() {
    return { ...this.statistics };
  }
}

export const globalRateLimiter = new RateLimiter();

const pendingRequests = new Map();

export function dedupRequest(key, requestFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}
