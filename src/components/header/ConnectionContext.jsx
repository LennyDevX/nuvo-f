// src/context/ConnectionContext.js
import React, { createContext, useState, useEffect } from "react";
import useProvider from "../hooks/useProvider";

export const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const provider = useProvider();
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (provider) {
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(accounts[0]);

        setAccount(accounts[0]);
        setNetwork(network);
        setBalance(balance);
        setIsConnected(accounts.length > 0);
      }
    };

    checkConnection();
  }, [provider]);

  return (
    <ConnectionContext.Provider value={{ isConnected, account, network, balance }}>
      {children}
    </ConnectionContext.Provider>
  );
};