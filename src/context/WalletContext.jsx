import React, { createContext, useState, useEffect, useCallback } from 'react';
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
    ensureProvider: async () => {},  // Add this line
});

export const WalletProvider = ({ children }) => {
    // Inicializar estados desde localStorage
    const [account, setAccount] = useState(() => localStorage.getItem('walletAccount'));
    const [balance, setBalance] = useState(() => localStorage.getItem('walletBalance'));
    const [network, setNetwork] = useState(() => localStorage.getItem('walletNetwork'));
    const [walletConnected, setWalletConnected] = useState(() => 
        localStorage.getItem('walletConnected') === 'true'
    );
    const [provider, setProvider] = useState(null);

    // Persistir estados en localStorage
    useEffect(() => {
        if (account) localStorage.setItem('walletAccount', account);
        else localStorage.removeItem('walletAccount');
    }, [account]);

    useEffect(() => {
        if (balance) localStorage.setItem('walletBalance', balance);
        else localStorage.removeItem('walletBalance');
    }, [balance]);

    useEffect(() => {
        if (network) localStorage.setItem('walletNetwork', network);
        else localStorage.removeItem('walletNetwork');
    }, [network]);

    useEffect(() => {
        localStorage.setItem('walletConnected', walletConnected);
    }, [walletConnected]);

    // Reconectar automáticamente si hay una sesión guardada
    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum && account) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    await provider.ready;
                    setProvider(provider);

                    // Verificar si la cuenta guardada aún está autorizada
                    const accounts = await provider.listAccounts();
                    if (!accounts.includes(account)) {
                        // La cuenta ya no está autorizada, limpiar estado
                        handleDisconnect();
                    } else {
                        // Actualizar balance
                        const balance = await provider.getBalance(account);
                        setBalance(ethers.formatEther(balance));
                    }
                } catch (error) {
                    console.error("Error initializing provider:", error);
                    handleDisconnect();
                }
            }
        };

        initProvider();
    }, []);

    const ensureProvider = async () => {
        if (!provider && window.ethereum && account) {
            try {
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                await newProvider.ready;
                setProvider(newProvider);
                return newProvider;
            } catch (error) {
                console.error("Error creating provider:", error);
                throw new Error("Failed to initialize provider");
            }
        }
        if (!provider) {
            throw new Error("Provider not available");
        }
        return provider;
    };

    const handleDisconnect = () => {
        setAccount(null);
        setBalance(null);
        setNetwork(null);
        setWalletConnected(false);
        setProvider(null);
        localStorage.removeItem('walletAccount');
        localStorage.removeItem('walletBalance');
        localStorage.removeItem('walletNetwork');
        localStorage.removeItem('walletConnected');
    };

    const value = {
        account,
        balance,      // Asegúrate de que estos valores
        network,      // están incluidos en el value
        walletConnected,
        provider,
        setAccount,
        setBalance,
        setNetwork,
        setWalletConnected,
        handleDisconnect,
        ensureProvider,  // Add this line
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
