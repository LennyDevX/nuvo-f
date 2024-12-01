import React from 'react';

const NETWORK_NAMES = {
  '1': 'Ethereum Mainnet',
  '3': 'Ropsten Testnet',
  '4': 'Rinkeby Testnet',
  '42': 'Kovan Testnet',
  '56': 'Binance Smart Chain',
  '97': 'Binance Smart Chain Testnet',
  '137': 'Polygon Mainnet',
  '80001': 'Polygon Mumbai Testnet',
  '42220': 'Celo Mainnet',
  '44787': 'Celo Alfajores Testnet',
};

const getNetworkName = (networkId) => {
  return NETWORK_NAMES[networkId] || 'Red Desconocida';
};

const censorAccount = (account, visibleChars = 6) => {
  if (!account || account.length <= visibleChars * 2) {
    return account;
  }
  return `${account.substring(0, visibleChars)}...${account.substring(account.length - visibleChars)}`;
};

const NetworkUtils = {
  getNetworkName,
  censorAccount
};

export default NetworkUtils;