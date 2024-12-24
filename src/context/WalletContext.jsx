import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext({
    account: null,
    balance: null,
    network: null,
    walletConnected: false,
    provider: null,
    setAccount: () => {},
    setBalance: () => {},
    setNetwork: () => {},
    setWalletConnected: () => {},
});

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [network, setNetwork] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [provider, setProvider] = useState(null);

    // Actualiza walletConnected cuando cambia la cuenta
    useEffect(() => {
        setWalletConnected(!!account);
    }, [account]);

    // Inicializa el proveedor si hay una wallet conectada
    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);
            }
        };
        initProvider();
    }, []);

    const value = {
        account,
        balance,
        network,
        walletConnected,
        provider,
        setAccount,
        setBalance,
        setNetwork,
        setWalletConnected
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
