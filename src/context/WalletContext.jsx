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

    // Mejorar la inicialización del proveedor
    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    // Wait for provider to initialize
                    await provider.ready;
                    setProvider(provider);
                } catch (error) {
                    console.error("Error initializing provider:", error);
                }
            } else {
                console.log('Please install MetaMask!');
            }
        };
        initProvider();
    }, []);

    const value = {
        account,
        balance,      // Asegúrate de que estos valores
        network,      // están incluidos en el value
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
