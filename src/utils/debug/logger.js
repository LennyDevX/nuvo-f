/**
 * Centralized logging utility with spam prevention and smart throttling
 */

// Debug flags - can be controlled via environment or localStorage
const DEBUG_FLAGS = {
  WALLET: localStorage.getItem('debug_wallet') === 'true' || import.meta.env.DEV,
  STAKING: localStorage.getItem('debug_staking') === 'true' || import.meta.env.DEV,
  NFT: localStorage.getItem('debug_nft') === 'true' || import.meta.env.DEV,
  CHAT: localStorage.getItem('debug_chat') === 'true' || import.meta.env.DEV,
  CACHE: localStorage.getItem('debug_cache') === 'true' || import.meta.env.DEV, // Agregado
  GENERAL: localStorage.getItem('debug_general') === 'true' || import.meta.env.DEV,
};

// Throttling storage
const logThrottleMap = new Map();
const lastLoggedValues = new Map();

// Log levels with colors
const LOG_LEVELS = {
  DEBUG: { color: '#8a8a8a', emoji: '🔍' },
  INFO: { color: '#2196F3', emoji: 'ℹ️' },
  SUCCESS: { color: '#4CAF50', emoji: '✅' },
  WARN: { color: '#FF9800', emoji: '⚠️' },
  ERROR: { color: '#F44336', emoji: '❌' },
};

class SmartLogger {
  constructor() {
    this.isProduction = import.meta.env.MODE === 'production';
    this.defaultThrottleTime = 5000; // 5 seconds
    this.maxLogsPerCategory = 50;
  }

  /**
   * Smart logging that only logs when values change significantly
   */
  logOnChange(category, key, newValue, options = {}) {
    const cacheKey = `${category}_${key}`;
    const lastValue = lastLoggedValues.get(cacheKey);
    
    // Check if value actually changed
    const hasChanged = this._hasValueChanged(lastValue, newValue, options.threshold);
    
    if (hasChanged || options.force) {
      lastLoggedValues.set(cacheKey, newValue);
      return this.log('INFO', category, `${key} changed:`, newValue);
    }
    
    return false;
  }

  /**
   * Throttled logging to prevent spam
   */
  throttledLog(level, category, message, data, throttleTime = this.defaultThrottleTime) {
    const key = `${category}_${message}`;
    const now = Date.now();
    const lastLogged = logThrottleMap.get(key);
    
    if (!lastLogged || now - lastLogged > throttleTime) {
      logThrottleMap.set(key, now);
      return this.log(level, category, message, data);
    }
    
    return false;
  }

  /**
   * Main logging method
   */
  log(level, category, message, data) {
    // Skip if category is disabled
    if (!DEBUG_FLAGS[category.toUpperCase()]) return false;
    
    // Skip debug logs in production
    if (this.isProduction && level === 'DEBUG') return false;
    
    const config = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    const timestamp = new Date().toLocaleTimeString();
    
    const style = `color: ${config.color}; font-weight: bold;`;
    const categoryStyle = 'color: #9C27B0; font-weight: bold;';
    
    if (data !== undefined) {
      console.log(
        `%c${config.emoji} [${timestamp}] %c[${category.toUpperCase()}]%c ${message}`,
        style,
        categoryStyle,
        'color: inherit;',
        data
      );
    } else {
      console.log(
        `%c${config.emoji} [${timestamp}] %c[${category.toUpperCase()}]%c ${message}`,
        style,
        categoryStyle,
        'color: inherit;'
      );
    }
    
    return true;
  }

  /**
   * Convenience methods
   */
  debug(category, message, data) {
    return this.log('DEBUG', category, message, data);
  }

  info(category, message, data) {
    return this.log('INFO', category, message, data);
  }

  success(category, message, data) {
    return this.log('SUCCESS', category, message, data);
  }

  warn(category, message, data) {
    return this.log('WARN', category, message, data);
  }

  error(category, message, data) {
    return this.log('ERROR', category, message, data);
  }

  /**
   * Wallet-specific logging
   */
  walletInfo(message, data) {
    return this.throttledLog('INFO', 'WALLET', message, data, 10000); // 10 sec throttle
  }

  walletChange(key, newValue) {
    return this.logOnChange('WALLET', key, newValue);
  }

  /**
   * Cache-specific logging methods
   */
  cacheHit(cacheId, key, responseTime) {
    return this.throttledLog('DEBUG', 'CACHE', `Hit [${cacheId}]: ${key}`, { responseTime: `${responseTime.toFixed(2)}ms` }, 15000);
  }

  cacheMiss(cacheId, key, responseTime) {
    return this.throttledLog('DEBUG', 'CACHE', `Miss [${cacheId}]: ${key}`, { responseTime: `${responseTime.toFixed(2)}ms` }, 15000);
  }

  cacheSet(cacheId, key, ttl) {
    return this.throttledLog('DEBUG', 'CACHE', `Set [${cacheId}]: ${key}`, { ttl: `${ttl}ms` }, 20000);
  }

  cacheEviction(cacheId, evictedKeys) {
    return this.warn('CACHE', `Eviction [${cacheId}]`, { count: evictedKeys, reason: 'LRU cleanup' });
  }

  cacheMetrics(cacheId, metrics) {
    return this.throttledLog('INFO', 'CACHE', `Metrics [${cacheId}]`, metrics, 60000); // Una vez por minuto
  }

  cacheInvalidation(cacheId, pattern, count) {
    return this.info('CACHE', `Invalidated [${cacheId}]: ${pattern}`, { entriesRemoved: count });
  }

  /**
   * Helper methods
   */
  _hasValueChanged(oldValue, newValue, threshold = 0) {
    if (oldValue === undefined) return true;
    if (typeof oldValue !== typeof newValue) return true;
    
    if (typeof newValue === 'number' && threshold > 0) {
      return Math.abs(oldValue - newValue) > threshold;
    }
    
    return JSON.stringify(oldValue) !== JSON.stringify(newValue);
  }

  /**
   * Clear throttle cache (useful for debugging)
   */
  clearThrottleCache() {
    logThrottleMap.clear();
    lastLoggedValues.clear();
  }

  /**
   * Get debug stats
   */
  getStats() {
    return {
      throttledKeys: logThrottleMap.size,
      trackedValues: lastLoggedValues.size,
      debugFlags: DEBUG_FLAGS
    };
  }
}

// Create singleton instance
export const logger = new SmartLogger();

// Export convenience functions
export const { debug, info, success, warn, error, walletInfo, walletChange, cacheHit, cacheMiss, cacheSet, cacheEviction, cacheMetrics, cacheInvalidation } = logger;

// Export debug control functions
export const debugControl = {
  enable: (category) => {
    localStorage.setItem(`debug_${category.toLowerCase()}`, 'true');
    DEBUG_FLAGS[category.toUpperCase()] = true;
  },
  disable: (category) => {
    localStorage.setItem(`debug_${category.toLowerCase()}`, 'false');
    DEBUG_FLAGS[category.toUpperCase()] = false;
  },
  enableAll: () => {
    Object.keys(DEBUG_FLAGS).forEach(key => {
      localStorage.setItem(`debug_${key.toLowerCase()}`, 'true');
      DEBUG_FLAGS[key] = true;
    });
  },
  disableAll: () => {
    Object.keys(DEBUG_FLAGS).forEach(key => {
      localStorage.setItem(`debug_${key.toLowerCase()}`, 'false');
      DEBUG_FLAGS[key] = false;
    });
  },
  status: () => DEBUG_FLAGS
};

// Make debug controls available globally in development
if (import.meta.env.DEV) {
  window.debugNuvos = { logger, debugControl };
}
