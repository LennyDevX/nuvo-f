import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { WalletContext } from '../../../../context/WalletContext';
import { ethers } from 'ethers';
import AirdropABI from '../../../../Abi/Airdrop.json';
import { useAnimationConfig } from '../../../animation/AnimationProvider';
import memoWithName from '../../../../utils/performance/memoWithName';
import { useThrottle, useDebounce } from '../../../../hooks/performance/useEventOptimizers';

const RegistrationForm = ({
    formData,
    handleChange,
    handleSubmit,
    account,
    error,
    isLoading,
    setFormData,
    walletConnected,
    onClose,
    isAlreadyRegistered
}) => {
    const { provider, ensureProvider } = useContext(WalletContext);
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
    
    // Crear una función de comprobación de registro con throttle
    // para evitar llamadas excesivas a la blockchain
    const checkRegistrationThrottled = useThrottle(async (userAccount) => {
        if (!userAccount || !walletConnected) return;

        try {
            const activeProvider = await ensureProvider();
            const contractForReads = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                activeProvider
            );

            const eligibilityCheck = await contractForReads.checkUserEligibility(userAccount);
            const [, hasClaimed] = eligibilityCheck;

            if (hasClaimed) {
                setRegistrationStatus('You have already registered for this airdrop');
                setRegistrationComplete(true);
            }
        } catch (error) {
            console.error('Error checking registration:', error);
        }
    }, 2000); // Throttle a 2 segundos para evitar sobrecarga

    // Implementar caché local para resultados de consultas
    const eligibilityCache = useMemo(() => new Map(), []);

    useEffect(() => {
        // Verificar si ya tenemos el resultado en caché
        if (account && walletConnected) {
            if (eligibilityCache.has(account)) {
                const cachedResult = eligibilityCache.get(account);
                if (cachedResult.hasClaimed) {
                    setRegistrationStatus('You have already registered for this airdrop');
                    setRegistrationComplete(true);
                }
            } else {
                checkRegistrationThrottled(account);
            }
        }
    }, [account, walletConnected, checkRegistrationThrottled]);

    const handleRegistration = useCallback(async (e) => {
        e.preventDefault();
        if (isRegistering || registrationComplete) return;

        try {
            setIsRegistering(true);
            
            if (registrationComplete || isAlreadyRegistered) {
                setRegistrationStatus('You have already registered for this airdrop');
                return;
            }

            if (!walletConnected || !account) {
                setRegistrationStatus('Please connect your wallet first');
                return;
            }

            let activeProvider;
            try {
                activeProvider = await ensureProvider();
            } catch (error) {
                setRegistrationStatus('Please connect your wallet and try again');
                return;
            }

            setRegistrationStatus('Checking eligibility...');
            
            // Verificar primero si tenemos la información en caché
            if (eligibilityCache.has(account)) {
                const cachedResult = eligibilityCache.get(account);
                if (cachedResult.hasClaimed) {
                    setRegistrationStatus('✋ You have already registered for this airdrop');
                    setRegistrationComplete(true);
                    return;
                }
                
                if (!cachedResult.hasMinBalance) {
                    setRegistrationStatus(`❌ Insufficient balance. Need 1 MATIC. Current: ${ethers.formatEther(cachedResult.userBalance)} MATIC`);
                    return;
                }
            }
            
            const contractForReads = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                activeProvider
            );

            const eligibilityCheck = await contractForReads.checkUserEligibility(account);
            const [isEligible, hasClaimed, hasMinBalance, userBalance] = eligibilityCheck;
            
            // Guardar resultado en caché para futuras consultas
            eligibilityCache.set(account, { isEligible, hasClaimed, hasMinBalance, userBalance });
            
            if (hasClaimed) {
                setRegistrationStatus('✋ You have already registered for this airdrop');
                setRegistrationComplete(true);
                return;
            }

            if (!hasMinBalance) {
                setRegistrationStatus(`❌ Insufficient balance. Need 1 MATIC. Current: ${ethers.formatEther(userBalance)} MATIC`);
                return;
            }

            const signer = await activeProvider.getSigner();
            const contractWithSigner = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                signer
            );

            setRegistrationStatus('Registering for airdrop...');
            
            const tx = await contractWithSigner.registerForAirdrop();
            console.log('Registration transaction sent:', tx.hash);
            
            setRegistrationStatus('Waiting for confirmation...');
            const receipt = await tx.wait();
            console.log('Registration confirmed:', receipt);

            if (receipt.status === 1) {
                setRegistrationStatus('✅ Successfully registered! You can now claim your airdrop.');
                setRegistrationComplete(true);
                
                // Actualizar caché con el nuevo estado
                if (eligibilityCache.has(account)) {
                    const cachedData = eligibilityCache.get(account);
                    eligibilityCache.set(account, { ...cachedData, hasClaimed: true });
                }
                
                const registrationData = {
                    ...formData,
                    wallet: account,
                    registrationHash: receipt.transactionHash,
                    isRegistered: true,
                    airdropType: 'tokens',
                    submittedAt: new Date().toISOString()
                };

                await handleSubmit(registrationData);
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage;
            if (error.message?.includes('Maximum participants')) {
                errorMessage = '❌ Maximum participants reached for this airdrop.';
            } else if (error.message?.includes('Airdrop ended')) {
                errorMessage = '❌ This airdrop has ended.';
            } else if (error.message?.includes('user rejected')) {
                errorMessage = '❌ Transaction was rejected. Please try again.';
            } else if (error.message?.includes('UNSUPPORTED_OPERATION')) {
                errorMessage = '❌ Please ensure your wallet is properly connected.';
            } else if (error.message?.includes('insufficient funds')) {
                errorMessage = '❌ Insufficient funds for transaction fee.';
            } else {
                errorMessage = '❌ Failed to register for airdrop: ' + (error.message || 'Unknown error');
            }
            
            setRegistrationStatus(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    }, [account, ensureProvider, formData, handleSubmit, isAlreadyRegistered, registrationComplete, walletConnected, isRegistering]);

    // Usar debounce para validación para reducir procesamiento
    const validateInput = useDebounce((e) => {
        const { name, value } = e.target;
        
        switch (name) {
            case 'name':
                if (value.length > 50) {
                    e.preventDefault();
                    return;
                }
                if (!/^[a-zA-Z0-9\s]*$/.test(value)) {
                    e.preventDefault();
                    return;
                }
                break;
            case 'email':
                if (value.length > 100) {
                    e.preventDefault();
                    return;
                }
                break;
        }
    }, 300);

    if (registrationComplete) {
        return (
            <div className="p-6 text-center">
                <div className="mb-4 text-green-400">
                    <svg className="w-16 h-16 mx-auto" /* ... */></svg>
                </div>
                <h3 className="text-xl font-medium text-green-400 mb-2">
                    Registration Successful!
                </h3>
                <p className="text-gray-300 mb-4">
                    Your registration has been confirmed. You can now close this window.
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleRegistration} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyDown={validateInput}
                    maxLength={50}
                    pattern="[a-zA-Z0-9\s]+"
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
            </div>

            <div>
                <label htmlFor="wallet" className="block text-sm font-medium text-gray-200">
                    Wallet Address
                </label>
                <input
                    type="text"
                    name="wallet"
                    id="wallet"
                    value={account || ''}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-400 shadow-sm"
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-2">
                    {error}
                </div>
            )}

            {registrationStatus && !isAlreadyRegistered && (
                <div className={`p-4 rounded-lg ${
                    registrationStatus.includes('already registered')
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : registrationStatus.includes('Successfully')
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                }`}>
                    {registrationStatus}
                </div>
            )}

            {!walletConnected && (
                <div className="text-yellow-500 text-sm mt-2 bg-yellow-500/10 p-3 rounded-lg">
                    👉 Please connect your wallet to continue
                </div>
            )}

            <div className="flex flex-col gap-3">
                {isAlreadyRegistered ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 text-center">
                        <div className="text-yellow-500 font-medium mb-2">
                            ⚠️ Already Registered
                        </div>
                        <p className="text-gray-300 text-sm">
                            You have already registered for this airdrop type.
                            Check your registration status in the dashboard.
                        </p>
                    </div>
                ) : (
                    <button
                        type="submit"
                        disabled={isLoading || !walletConnected || isAlreadyRegistered}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${(isLoading || !walletConnected || isAlreadyRegistered)
                                ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                            }`}
                    >
                        {!walletConnected 
                            ? 'Connect Wallet First'
                            : isLoading 
                            ? 'Registering...' 
                            : 'Register for Airdrop'}
                    </button>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors duration-200"
                >
                    {isAlreadyRegistered ? 'Close' : 'Cancel'}
                </button>
            </div>
        </form>
    );
};

export default memoWithName(RegistrationForm);