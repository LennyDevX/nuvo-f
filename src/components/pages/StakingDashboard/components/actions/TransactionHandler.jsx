import React, { useEffect, useRef } from 'react';
import { TransactionStatus } from '../../ui/CommonComponents';

/**
 * Enhanced console logging system with throttling, categorization and styling
 * Helps reduce console spam while maintaining useful debugging information
 */

// Log levels with corresponding styles
const LOG_LEVELS = {
  DEBUG: { name: 'debug', style: 'color: #8a8a8a', enabled: true },
  INFO: { name: 'info', style: 'color: #2196F3', enabled: true },
  SUCCESS: { name: 'success', style: 'color: #4CAF50', enabled: true },
  WARN: { name: 'warn', style: 'color: #FF9800', enabled: true },
  ERROR: { name: 'error', style: 'color: #F44336', enabled: true },
};

// Feature categories for better organization
const CATEGORIES = {
  WALLET: 'wallet',
  STAKING: 'staking',
  NETWORK: 'network',
  CACHE: 'cache',
  NFT: 'nft',
  TX: 'transaction',
  UI: 'ui',
  CONTRACT: 'contract',
};

// Logger storage
const logHistory = {};
const throttleTimers = {};

// Global settings
const defaultSettings = {
  throttleInterval: 5000,        // Default throttle time (ms)
  cleanupInterval: 300000,       // Clean log history every 5 minutes
  maxLogsPerCategory: 100,       // Maximum logs to keep per category
  enabledCategories: Object.values(CATEGORIES),
  enabledLevels: Object.keys(LOG_LEVELS),
  persistentDebug: false,        // Whether to persist debug logs in production
};

// Create the enhanced logger
const createEnhancedLogger = (settings = {}) => {
  const config = { ...defaultSettings, ...settings };
  
  // Start background cleanup
  const cleanupTimerId = setInterval(() => {
    Object.keys(logHistory).forEach(key => {
      // Keep only the most recent logs
      if (logHistory[key].length > config.maxLogsPerCategory) {
        logHistory[key] = logHistory[key].slice(-config.maxLogsPerCategory);
      }
      
      // Remove old throttle entries
      const now = Date.now();
      Object.keys(throttleTimers).forEach(tKey => {
        if (now - throttleTimers[tKey] > config.throttleInterval * 2) {
          delete throttleTimers[tKey];
        }
      });
    });
  }, config.cleanupInterval);
  
  // Clean up on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(cleanupTimerId);
    });
  }
  
  // Main logging function
  const log = (level, category, message, ...args) => {
    // Skip if level or category is disabled
    if (!config.enabledLevels.includes(level) || !config.enabledCategories.includes(category)) {
      return false;
    }
    
    // In production, limit debug logs unless explicitly enabled
    if (level === 'DEBUG' && !config.persistentDebug && process.env.NODE_ENV === 'production') {
      return false;
    }
    
    // Create cache key based on message and args
    const argKey = args.length > 0 
      ? JSON.stringify(args.map(arg => 
          typeof arg === 'object' ? '[Object]' : String(arg).substring(0, 50)
        ))
      : '';
    const cacheKey = `${category}-${level}-${message}-${argKey}`;
    
    // Check throttle
    const now = Date.now();
    if (throttleTimers[cacheKey] && now - throttleTimers[cacheKey] < config.throttleInterval) {
      return false;
    }
    
    // Update throttle timer
    throttleTimers[cacheKey] = now;
    
    // Track in history
    if (!logHistory[category]) {
      logHistory[category] = [];
    }
    logHistory[category].push({
      level,
      message,
      timestamp: now,
    });
    
    // Get log style
    const logConfig = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    
    // Format the log with styling
    console.log(
      `%c[${category.toUpperCase()}]%c ${message}`,
      `font-weight: bold; ${logConfig.style}`,
      'color: inherit',
      ...args
    );
    
    return true;
  };
  
  // Create convenience methods for each log level
  const logger = {
    debug: (category, message, ...args) => log('DEBUG', category, message, ...args),
    info: (category, message, ...args) => log('INFO', category, message, ...args),
    success: (category, message, ...args) => log('SUCCESS', category, message, ...args),
    warn: (category, message, ...args) => log('WARN', category, message, ...args),
    error: (category, message, ...args) => log('ERROR', category, message, ...args),
    
    // Allow changing settings at runtime
    updateSettings: (newSettings) => {
      Object.assign(config, newSettings);
    },
    
    // Get categories and levels for external use
    getCategories: () => ({ ...CATEGORIES }),
    getLevels: () => ({ ...LOG_LEVELS }),
    
    // Get log history for a specific category
    getHistory: (category) => logHistory[category] || [],
  };
  
  return logger;
};

// Create and export the logger instance
export const blockchainLogger = createEnhancedLogger();

// Export categories for convenience
export const LogCategory = CATEGORIES;

// The original throttled logger is still available but enhanced
export const txLogger = (message, ...args) => {
  return blockchainLogger.info(CATEGORIES.TX, message, ...args);
};

// Main component code
const TransactionHandler = ({ currentTx, isPending, setIsPending, updateStatus, refreshUserInfo, account, onReset }) => {
  const transactionTimerRef = useRef(null);

  // Set up a transaction timeout to automatically clear stuck transactions
  useEffect(() => {
    // Clear any existing timer
    if (transactionTimerRef.current) {
      clearTimeout(transactionTimerRef.current);
      transactionTimerRef.current = null;
    }
    
    // If a transaction is pending, set a timeout to automatically reset after 2 minutes
    if (isPending && currentTx && ['pending', 'awaiting_confirmation', 'preparing'].includes(currentTx.status)) {
      blockchainLogger.info(CATEGORIES.TX, `Monitoring transaction ${currentTx.hash || 'pending'} - will auto-reset if stuck`);
      
      transactionTimerRef.current = setTimeout(() => {
        blockchainLogger.warn(CATEGORIES.TX, "Auto-resetting stuck transaction after timeout");
        onReset();
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (transactionTimerRef.current) {
        clearTimeout(transactionTimerRef.current);
      }
    };
  }, [isPending, currentTx, onReset]);

  if (!currentTx) return null;
  
  return (
    <TransactionStatus 
      tx={currentTx} 
      className="mb-5" 
      onReset={onReset} 
    />
  );
};

export default TransactionHandler;
