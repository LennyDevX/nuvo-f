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
  const [walletConnected, setWalletConnected] = useState(false);

  // Function to update the account and walletConnected state
  const updateAccount = (newAccount) => {
    setAccount(newAccount);
    setWalletConnected(!!newAccount); // Set walletConnected to true if newAccount is truthy
  };

  const value = { balance, setBalance, account, setAccount, updateAccount, network, setNetwork, walletConnected };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
