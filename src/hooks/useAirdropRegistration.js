import { useState, useCallback, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import AirdropABI from '../Abi/Airdrop.json';

export const useAirdropRegistration = (provider, account) => {
    const [registrationError, setRegistrationError] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState('idle');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [airdropInfo, setAirdropInfo] = useState({
        isEligible: false,
        hasClaimed: false,
        hasMinBalance: false,
        isActive: false,
        isFunded: false,
        totalClaims: 0,
        userBalance: '0'
    });
    const [contract, setContract] = useState(null);

    // Inicializar el contrato cuando el provider y la cuenta estén disponibles
    useEffect(() => {
        if (provider && account) {
            try {
                const airdropAddress = import.meta.env.VITE_AIRDROP_ADDRESS;
                if (!airdropAddress) {
                    console.error('Airdrop contract address not found in environment variables');
                    return;
                }
                const contractInstance = new ethers.Contract(
                    airdropAddress,
                    AirdropABI.abi,
                    provider
                );
                setContract(contractInstance);
            } catch (error) {
                console.error('Error initializing contract:', error);
                setRegistrationError('Failed to initialize airdrop contract');
            }
        }
    }, [provider, account]);

    // Obtener información del airdrop
    const getAirdropInfo = useCallback(async () => {
        if (!contract || !account) return;

        try {
            setRegistrationStatus('checking');
            const [isEligible, hasClaimed, hasMinBalance, userBalance] = await contract.checkUserEligibility(account);
            const airdropStats = await contract.getAirdropStats();
            
            setAirdropInfo({
                isEligible,
                hasClaimed,
                hasMinBalance,
                userBalance: formatEther(userBalance),
                isActive: airdropStats.isAirdropActive,
                isFunded: airdropStats.hasBalance,
                totalClaims: Number(airdropStats.claimedCount),
                maxParticipants: Number(airdropStats.maxParticipants),
                tokenBalance: formatEther(airdropStats.tokenBalance)
            });

            setRegistrationStatus('ready');
            if (hasClaimed) {
                setRegistrationComplete(true);
            }
        } catch (error) {
            console.error('Error getting airdrop info:', error);
            setRegistrationStatus('error');
            setRegistrationError('Failed to get airdrop information');
        }
    }, [contract, account]);

    // Registrarse para el airdrop
    const registerForAirdrop = useCallback(async (userData = {}) => {
        setRegistrationError(null);
        setIsRegistering(true);
        setRegistrationStatus('registering');

        try {
            if (!provider || !account) {
                throw new Error('Wallet not connected');
            }

            if (!contract) {
                throw new Error('Contract not initialized');
            }

            const signer = await provider.getSigner();
            if (!signer) throw new Error('Signer not available');

            const contractWithSigner = contract.connect(signer);

            // Verificar elegibilidad primero
            const [isEligible, hasClaimed, hasMinBalance, userBalance] = 
                await contract.checkUserEligibility(account);
            
            console.log('Eligibility check:', {
                isEligible,
                hasClaimed,
                hasMinBalance,
                userBalance: formatEther(userBalance)
            });

            // Verificar balance mínimo
            if (!hasMinBalance) {
                throw new Error(`Insufficient balance. You need at least 1 MATIC. Current balance: ${formatEther(userBalance)} MATIC`);
            }

            // Si ya está registrado y ha reclamado
            if (hasClaimed) {
                throw new Error('You have already claimed this airdrop');
            }

            // Proceder con el registro
            setRegistrationStatus('submitting transaction');
            const tx = await contractWithSigner.registerForAirdrop();
            console.log('Registration transaction sent:', tx.hash);
            
            setRegistrationStatus('confirming transaction');
            const receipt = await tx.wait();
            console.log('Registration confirmed:', receipt);
            
            if (receipt.status === 1) {
                setRegistrationComplete(true);
                setRegistrationStatus('success');
                await getAirdropInfo(); // Actualizar el estado
                
                // Retornar datos útiles para el frontend
                return {
                    success: true,
                    transactionHash: receipt.transactionHash,
                    userData: userData,
                    timestamp: Date.now()
                };
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setRegistrationError(error.message || 'Failed to register for airdrop');
            setRegistrationStatus('error');
            throw error;
        } finally {
            setIsRegistering(false);
        }
    }, [contract, account, provider, getAirdropInfo]);
    
    // Función para reclamar tokens (para uso futuro)
    const claimTokens = useCallback(async () => {
        setRegistrationError(null);
        setIsRegistering(true);

        try {
            const signer = await provider.getSigner();
            if (!signer) throw new Error('Signer not available');

            const contractWithSigner = contract.connect(signer);
            
            const tx = await contractWithSigner.claimTokens();
            console.log('Claim transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Claim confirmed:', receipt);
            
            await getAirdropInfo(); // Actualizar información después de reclamar
            return receipt.transactionHash;
        } catch (error) {
            console.error('Claim error:', error);
            setRegistrationError(error.message || 'Failed to claim tokens');
            throw error;
        } finally {
            setIsRegistering(false);
        }
    }, [contract, provider, getAirdropInfo]);

    return {
        registerForAirdrop,
        getAirdropInfo,
        claimTokens,
        registrationError,
        registrationStatus,
        isRegistering,
        registrationComplete,
        airdropInfo
    };
};
