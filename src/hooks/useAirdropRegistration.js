import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import AirdropABI from '../Abi/Airdrop.json';

export const useAirdropRegistration = (provider, account) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationError, setRegistrationError] = useState(null);
    const [airdropInfo, setAirdropInfo] = useState(null);

    const contract = useMemo(() => {
        if (!provider) return null;
        try {
            return new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                provider
            );
        } catch (error) {
            console.error('Error creating contract instance:', error);
            return null;
        }
    }, [provider]);

    const registerForAirdrop = useCallback(async () => {
        if (!contract || !account) {
            throw new Error('Please connect your wallet first');
        }

        setIsRegistering(true);
        setRegistrationError(null);

        try {
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
                userBalance: ethers.formatEther(userBalance)
            });

            // Verificar balance mínimo
            if (!hasMinBalance) {
                throw new Error(`Insufficient balance. You need at least 1 MATIC. Current balance: ${ethers.formatEther(userBalance)} MATIC`);
            }

            // Si ya está registrado y ha reclamado
            if (hasClaimed) {
                throw new Error('You have already claimed this airdrop');
            }

            // Si ya está registrado pero no ha reclamado
            if (isEligible && !hasClaimed) {
                throw new Error('You are already registered! Please proceed to claim your airdrop.');
            }

            // Registrar usando la nueva función registerForAirdrop
            console.log('Registering user...');
            const tx = await contractWithSigner.registerForAirdrop();
            console.log('Registration tx sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Registration confirmed:', receipt);

            return receipt;

        } catch (error) {
            console.error('Registration attempt error:', error);
            
            // Mejorar mensajes de error
            let errorMessage = error.message;
            if (error.message.includes('Already registered')) {
                errorMessage = 'You are already registered for this airdrop';
            } else if (error.message.includes('Maximum participants reached')) {
                errorMessage = 'Maximum participants reached for this airdrop';
            } else if (error.message.includes('Airdrop ended')) {
                errorMessage = 'This airdrop has ended';
            } else if (error.message.includes('Airdrop not configured')) {
                errorMessage = 'This airdrop is not configured yet';
            } else if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was rejected';
            }

            setRegistrationError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    }, [contract, account, provider]);

    const getAirdropInfo = useCallback(async () => {
        if (!contract) return null;
        try {
            const info = await contract.getAirdropStats();
            setAirdropInfo(info);
            return info;
        } catch (error) {
            console.error('Error fetching airdrop info:', error);
            return null;
        }
    }, [contract]);

    return {
        registerForAirdrop,
        getAirdropInfo,
        isRegistering,
        registrationError,
        airdropInfo
    };
};
