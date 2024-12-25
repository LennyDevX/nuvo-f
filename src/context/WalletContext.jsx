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
                    const alchemyProvider = new ethers.JsonRpcProvider(
                        `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY}`
                    );
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    // Fallback al proveedor de Alchemy si hay error
                    provider.getFallbackProvider = () => alchemyProvider;
                    setProvider(provider);
                } catch (error) {
                    console.error("Error initializing provider:", error);
                }
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
