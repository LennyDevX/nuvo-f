import React, { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../../../context/WalletContext';
import { useAirdropRegistration } from '../../../../hooks/useAirdropRegistration';
import { checkRegionalEligibility } from '../../../../utils/regionCheck';

const RegistrationForm = ({
    formData,
    handleChange,
    handleSubmit,
    account,
    error,
    isLoading,
    setFormData,
}) => {
    const { provider, walletConnected } = useContext(WalletContext);
    const { registerForAirdrop } = useAirdropRegistration(provider, account);
    const [registrationStatus, setRegistrationStatus] = useState('');

    const handleRegistration = async () => {
        try {
            if (!walletConnected || !account) {
                setRegistrationStatus('Please connect your wallet first');
                throw new Error('Please connect your wallet first');
            }

            if (!provider) {
                setRegistrationStatus('Provider not available');
                throw new Error('Provider not available');
            }

            setRegistrationStatus('Registering for airdrop...');
            console.log('Attempting registration with:', {
                account,
                walletConnected,
                hasProvider: !!provider
            });

            const tx = await registerForAirdrop();
            console.log('Registration transaction sent:', tx.hash);
            
            setRegistrationStatus('Waiting for confirmation...');
            const receipt = await tx.wait();
            console.log('Registration confirmed:', receipt);

            if (receipt.status === 1) {
                setRegistrationStatus('✅ Successfully registered! You can now claim your airdrop.');
                await handleSubmit({
                    ...formData,
                    wallet: account,
                    registrationHash: receipt.transactionHash
                });
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            
            // Manejo específico de errores
            let errorMessage;
            if (error.message.includes('already registered')) {
                errorMessage = '✋ You are already registered! Please proceed to claim your airdrop.';
            } else if (error.message.includes('Maximum participants')) {
                errorMessage = '❌ Maximum participants reached for this airdrop.';
            } else if (error.message.includes('Airdrop ended')) {
                errorMessage = '❌ This airdrop has ended.';
            } else if (error.message.includes('user rejected')) {
                errorMessage = '❌ Transaction was rejected. Please try again.';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = '❌ Insufficient funds for transaction.';
            } else {
                errorMessage = error.message || 'Failed to register for airdrop';
            }
            
            setRegistrationStatus(errorMessage);
            if (!errorMessage.includes('already registered')) {
                throw error;
            }
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            await handleRegistration();
        } catch (error) {
            console.error('Form submission error:', error.message);
        }
    };

    const validateInput = (e) => {
        const { name, value } = e.target;
        
        switch (name) {
            case 'name':
                if (value.length > 50) {
                    e.preventDefault();
                    return;
                }
                // Prevenir caracteres especiales
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
    };

    useEffect(() => {
        const checkEligibility = async () => {
            const { isEligible, error } = await checkRegionalEligibility();
            
            if (error) {
                setRegistrationStatus('Unable to verify region eligibility');
                return;
            }

            if (!isEligible) {
                setRegistrationStatus('Registration not available in your region');
                return;
            }
        };

        checkEligibility();
    }, []);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
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

            {registrationStatus && (
                <div className={`p-4 rounded-lg ${
                    registrationStatus.includes('Successfully') || registrationStatus.includes('✅')
                        ? 'bg-green-500/20 text-green-400'
                        : registrationStatus.includes('Waiting') || registrationStatus.includes('Registering')
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                }`}>
                    {registrationStatus}
                </div>
            )}

            {!walletConnected && (
                <div className="text-yellow-500 text-sm mt-2 bg-yellow-500/10 p-3 rounded-lg">
                    👉 Please connect your wallet to continue
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !walletConnected}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${(isLoading || !walletConnected)
                        ? 'bg-purple-600 opacity-50 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
            >
                {!walletConnected 
                    ? 'Connect Wallet First'
                    : isLoading 
                    ? 'Registering...' 
                    : 'Register for Airdrop'}
            </button>
        </form>
    );
};

export default RegistrationForm;