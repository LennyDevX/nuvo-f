import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { logger } from '../utils/debug/logger';
import useProvider from '../hooks/blockchain/useProvider';

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

// Custom hook to use the WalletContext
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

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

    // Use the centralized provider hook FIRST
    const { provider: blockchainProvider, getWalletProvider, connect: connectProvider, disconnect: disconnectProvider, account: providerAccount, chainId, isInitialized } = useProvider();

    const handleDisconnect = useCallback(() => {
        // Use the provider's disconnect function to set explicit disconnect flag
        disconnectProvider();
        
        // Clear local state
        setAccount(null);
        setBalance(null);
        setNetwork(null);
        setWalletConnected(false);
        setProvider(null);
        
        // Clear localStorage
        localStorage.removeItem('walletAccount');
        localStorage.removeItem('walletBalance');
        localStorage.removeItem('walletNetwork');
        localStorage.removeItem('walletConnected');
        
        // Remove wallet event listeners
        if (window.ethereum) {
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
            window.ethereum.removeAllListeners('disconnect');
        }
    }, [disconnectProvider]);

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
    }, [walletConnected, lastActivityTime, handleDisconnect]);

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

    // Debug: Verificar el estado del contexto - REPLACED WITH SMART LOGGING
    useEffect(() => {
        // Only log when values actually change
        logger.walletChange('connected', walletConnected);
        logger.walletChange('account', account ? `${account.substring(0, 8)}...` : null);
        logger.walletChange('network', network);
        
        // Log full context only once per session or on significant changes
        const contextSummary = { 
            walletConnected, 
            hasAccount: !!account, 
            network,
            hasDisconnectMethod: !!handleDisconnect,
            methodCount: Object.keys(value || {}).length
        };
        
        logger.logOnChange('WALLET', 'context_state', contextSummary);
    }, [walletConnected, account, network, handleDisconnect]);

    const getNetworkName = useCallback((chainId) => {
        const networks = {
            '1': 'Ethereum',
            '137': 'Polygon',
            '80001': 'Mumbai',
            '56': 'BSC',
            '97': 'BSC Testnet',
            // Add more networks as needed
        };
        return networks[chainId] || `Chain ID: ${chainId}`;
    }, []);


    
    // Sync with provider hook account
    useEffect(() => {
        if (providerAccount && providerAccount !== account) {
            setAccount(providerAccount);
            setWalletConnected(true);
        } else if (!providerAccount && walletConnected) {
            // Provider lost account, but we think we're connected
            handleDisconnect();
        }
    }, [providerAccount, account, walletConnected, handleDisconnect]);
    
    // Update network when chainId changes
    useEffect(() => {
        if (chainId) {
            const networkName = getNetworkName(chainId.toString());
            setNetwork(networkName);
        }
    }, [chainId, getNetworkName]);
    
    // Update balance when account or provider changes
    useEffect(() => {
        const updateBalance = async () => {
            if (account && blockchainProvider) {
                try {
                    const balance = await blockchainProvider.getBalance(account);
                    setBalance(ethers.formatEther(balance));
                } catch (error) {
                    logger.error('WALLET', 'Error updating balance', error.message);
                }
            }
        };
        
        updateBalance();
    }, [account, blockchainProvider]);

    const setupEventListeners = useCallback(() => {
        if (window.ethereum) {
            // Handle account changes
            const handleAccountsChanged = async (accounts) => {
                if (accounts.length === 0) {
                    logger.info('WALLET', 'User disconnected all accounts');
                    handleDisconnect();
                } else {
                    const newAccount = accounts[0];
                    logger.info('WALLET', 'Account changed', `${newAccount.substring(0, 8)}...`);
                    setAccount(newAccount);
                    console.log("Account changed:", newAccount);
                }
            };
            
            // Handle chain/network changes
            const handleChainChanged = async (chainId) => {
                // Force page refresh on chain change for safety
                window.location.reload();
            };
            
            // Handle disconnect
            const handleDisconnect = () => {
                handleDisconnect();
            };
            
            // Remove existing listeners to prevent duplicates
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
            window.ethereum.removeAllListeners('disconnect');
            
            // Add new listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('disconnect', handleDisconnect);
        }
    }, [handleDisconnect]);

    const ensureProvider = useCallback(async () => {
        if (blockchainProvider) {
            return blockchainProvider;
        }
        
        if (account && window.ethereum) {
            try {
                const { browserProvider } = await getWalletProvider();
                setProvider(browserProvider);
                return browserProvider;
            } catch (error) {
                console.error("Error creating wallet provider:", error);
                throw new Error("Failed to initialize wallet provider");
            }
        }
        
        throw new Error("Provider not available");
    }, [blockchainProvider, account, getWalletProvider]);

    // Nueva función para conectar la wallet manualmente
    const connectWallet = useCallback(async () => {
        try {
            // Clear explicit disconnect flag when manually connecting
            localStorage.removeItem('walletExplicitlyDisconnected');
            
            const success = await connectProvider();
            if (success) {
                logger.success('WALLET', 'Wallet connected successfully');
                setupEventListeners();
            } else {
                logger.error('WALLET', 'Failed to connect wallet');
            }
            return success;
        } catch (error) {
            logger.error('WALLET', 'Error connecting wallet', error.message);
            handleDisconnect();
            return false;
        }
    }, [connectProvider, handleDisconnect, setupEventListeners]);

    // Set the provider from the hook when available
    useEffect(() => {
        if (blockchainProvider) {
            setProvider(blockchainProvider);
        }
    }, [blockchainProvider]);
    
    // Setup event listeners when wallet is connected
    useEffect(() => {
        if (walletConnected && account) {
            setupEventListeners();
        }
    }, [walletConnected, account, setupEventListeners]);

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
        connectWallet, // <-- expone la función para conectar la wallet
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
