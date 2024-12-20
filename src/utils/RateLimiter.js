export class RateLimiter {
  constructor(maxCalls = 25, timeWindow = 1000) {
    this.calls = new Map();
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
  }

  canMakeCall(key) {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    const recentCalls = calls.filter(time => now - time < this.timeWindow);
    
    if (recentCalls.length >= this.maxCalls) {
      return false;
    }
    
    this.calls.set(key, [...recentCalls, now]);
    return true;
  }
}

export const globalRateLimiter = new RateLimiter();
