/**
 * Blockchain logging utility that wraps the enhanced logger
 * for blockchain-specific operations
 */

import { blockchainLogger, LogCategory } from '../../components/pages/StakingDashboard/components/actions/TransactionHandler';

// Create blockchain-specific logging helpers
const balanceLogger = {
  // Track the last logged balances to avoid duplicates
  _lastBalances: {},
  
  // Log a balance update with proper throttling based on value changes
  logBalanceUpdate: (account, symbol, balance, source) => {
    const key = `${account}-${symbol}`;
    const lastVal = balanceLogger._lastBalances[key];
    
    // Only log if balance changed significantly (> 0.01) or it's the first time
    if (!lastVal || Math.abs(parseFloat(balance) - parseFloat(lastVal)) > 0.01) {
      blockchainLogger.info(
        LogCategory.WALLET, 
        `Balance updated: ${balance} ${symbol}`, 
        { source, account: account.substring(0, 8) + '...' }
      );
      balanceLogger._lastBalances[key] = balance;
      return true;
    }
    return false;
  }
};

const networkLogger = {
  // Track last logged network to avoid duplicates
  _lastNetwork: null,
  
  // Log network connection with throttling
  logNetworkConnection: (network) => {
    if (networkLogger._lastNetwork !== network) {
      blockchainLogger.info(LogCategory.NETWORK, `Connected to network: ${network}`);
      networkLogger._lastNetwork = network;
      return true;
    }
    return false;
  }
};

// Export the blockchain logging utilities
export {
  balanceLogger,
  networkLogger,
  blockchainLogger,
  LogCategory
};

// Configure default settings for blockchain use
blockchainLogger.updateSettings({
  throttleInterval: 10000,  // 10 seconds between identical logs
  enabledCategories: [
    LogCategory.WALLET, 
    LogCategory.NETWORK,
    LogCategory.STAKING,
    LogCategory.TX,
    LogCategory.CACHE
  ]
});
