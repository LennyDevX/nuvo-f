import React from 'react';

const getNetworkName = (networkId) => {
  switch (networkId) {
    case '1':
      return 'Ethereum Mainnet';
    case '3':
      return 'Ropsten Testnet';
    case '4':
      return 'Rinkeby Testnet';
    case '42':
      return 'Kovan Testnet';
    case '56':
      return 'Binance Smart Chain'; // Agregar Binance Smart Chain (BSC)
    case '97':
      return 'Binance Smart Chain Testnet'; // Agregar Binance Smart Chain Testnet (BSC Testnet)
    case '137':
      return 'Polygon Mainnet';
    case '80001':
      return 'Polygon Mumbai Testnet';
    case '42220':
      return 'Celo Mainnet';
    case '44787':
      return 'Celo Alfajores Testnet';
    default:
      return 'Red Desconocida';
  }
};


const censorAccount = (account) => {
  return account ? `${account.substring(0, 6)}...${account.substring(account.length - 6)}` : '';
};

const NetworkUtils = {
  getNetworkName,
  censorAccount

};

export default NetworkUtils;
