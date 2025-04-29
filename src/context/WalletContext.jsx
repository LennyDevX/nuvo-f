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
    ensureProvider: async () => {},
});

export const WalletProvider = ({ children }) => {
    // Inicializar estados desde localStorage con comprobación más robusta
    const [account, setAccount] = useState(() => {
        const savedAccount = localStorage.getItem('walletAccount');
        return savedAccount && savedAccount !== 'null' ? savedAccount : null;
    });
    
    const [balance, setBalance] = useState(() => {
        const savedBalance = localStorage.getItem('walletBalance');
        return savedBalance && savedBalance !== 'null' ? savedBalance : null;
    });
    
    const [network, setNetwork] = useState(() => {
        const savedNetwork = localStorage.getItem('walletNetwork');
        return savedNetwork && savedNetwork !== 'null' ? savedNetwork : null;
    });
    
    const [walletConnected, setWalletConnected] = useState(() => 
        localStorage.getItem('walletConnected') === 'true'
    );
    
    const [provider, setProvider] = useState(null);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    const AUTO_DISCONNECT_TIME = 3600000; // 1 hour of inactivity

    // Update lastActivityTime on user activity
    useEffect(() => {
        const updateLastActivity = () => setLastActivityTime(Date.now());
        
        // Events to track user activity
        window.addEventListener('mousemove', updateLastActivity);
        window.addEventListener('keydown', updateLastActivity);
        window.addEventListener('click', updateLastActivity);
        window.addEventListener('touchstart', updateLastActivity);
        
        return () => {
            window.removeEventListener('mousemove', updateLastActivity);
            window.removeEventListener('keydown', updateLastActivity);
            window.removeEventListener('click', updateLastActivity);
            window.removeEventListener('touchstart', updateLastActivity);
        };
    }, []);

    // Auto disconnect after inactivity
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (walletConnected && Date.now() - lastActivityTime > AUTO_DISCONNECT_TIME) {
                console.log("Auto-disconnecting wallet due to inactivity");
                handleDisconnect();
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(intervalId);
    }, [walletConnected, lastActivityTime]);

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
        localStorage.setItem('walletConnected', walletConnected.toString());
    }, [walletConnected]);

    // Improved auto-reconnect logic
    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum && walletConnected && account) {
                try {
                    console.log("Attempting to reconnect wallet:", account);
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    await provider.ready;
                    
                    // Get current accounts
                    const accounts = await window.ethereum.request({ 
                        method: "eth_accounts" 
                    });
                    
                    // Verify if our saved account is still authorized
                    if (accounts && accounts.length > 0) {
                        // Check if the saved account matches one of the available accounts
                        const isAuthorized = accounts.some(
                            acc => acc.toLowerCase() === account.toLowerCase()
                        );
                        
                        if (isAuthorized) {
                            // Account still authorized, restore connection
                            setProvider(provider);
                            
                            // Update network
                            const network = await provider.getNetwork();
                            const networkName = getNetworkName(network.chainId.toString());
                            setNetwork(networkName);
                            
                            // Update balance
                            const balance = await provider.getBalance(account);
                            setBalance(ethers.formatEther(balance));
                            
                            // Setup event listeners
                            setupEventListeners(provider);
                            
                            console.log("Wallet reconnected successfully");
                        } else {
                            console.log("Saved account no longer authorized");
                            handleDisconnect();
                        }
                    } else {
                        console.log("No authorized accounts found");
                        handleDisconnect();
                    }
                } catch (error) {
                    console.error("Error reconnecting wallet:", error);
                    handleDisconnect();
                }
            }
        };

        initProvider();
    }, []);

    const getNetworkName = (chainId) => {
        const networks = {
            '1': 'Ethereum',
            '137': 'Polygon',
            '80001': 'Mumbai',
            '56': 'BSC',
            '97': 'BSC Testnet',
            // Add more networks as needed
        };
        return networks[chainId] || `Chain ID: ${chainId}`;
    };

    const setupEventListeners = (provider) => {
        if (window.ethereum) {
            // Handle account changes
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected all accounts
                    handleDisconnect();
                } else {
                    // User switched account
                    const newAccount = accounts[0];
                    setAccount(newAccount);
                    
                    // Update balance for new account
                    const balance = await provider.getBalance(newAccount);
                    setBalance(ethers.formatEther(balance));
                    
                    console.log("Account changed:", newAccount);
                }
            });
            
            // Handle chain/network changes
            window.ethereum.on('chainChanged', async (chainId) => {
                // Force page refresh on chain change for safety
                window.location.reload();
            });
            
            // Handle disconnect
            window.ethereum.on('disconnect', () => {
                handleDisconnect();
            });
        }
    };

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
        balance,
        network,      
        walletConnected,
        provider,
        setAccount,
        setBalance,
        setNetwork,
        setWalletConnected,
        handleDisconnect,
        ensureProvider,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
