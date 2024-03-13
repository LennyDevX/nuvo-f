import React, { createContext, useState, } from 'react';

// Create the context
export const WalletContext = createContext({
  account: null,
  balance: null,
  network: null,
  walletConnected: false,  // New state for tracking whether the wallet is connected
  setAccount: () => {},
  setBalance: () => {},
  setNetwork: () => {},
  setWalletConnected: () => {},  // New setter function for walletConnected
});

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);  // walletConnected state and setter function

  // Update the number of purchases when 'account' changes


  const value = { balance, setBalance, account, setAccount, network, setNetwork, walletConnected, setWalletConnected };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};