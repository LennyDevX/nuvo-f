import React, { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../../../context/WalletContext';
import { useAirdropRegistration } from '../../../../hooks/useAirdropRegistration';
import { checkRegionalEligibility } from '../../../../utils/regionCheck';
import { ethers } from 'ethers';
import AirdropABI from '../../../../Abi/Airdrop.json';

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
    const { provider } = useContext(WalletContext);
    const [registrationStatus, setRegistrationStatus] = useState('');

    const handleRegistration = async (e) => {
        e.preventDefault();
        
        try {
            // Check if already registered first
        if (isAlreadyRegistered) {
            setRegistrationStatus('You are already registered for this airdrop type');
            return;
        }

        if (!walletConnected || !account) {
            setRegistrationStatus('Please connect your wallet first');
            return;
        }

        if (!provider) {
            setRegistrationStatus('Provider not available');
            return;
        }

        setRegistrationStatus('Checking eligibility...');
        
        // Create read-only contract instance for checks
        const contractForReads = new ethers.Contract(
            import.meta.env.VITE_AIRDROP_ADDRESS,
            AirdropABI.abi,
            provider
        );

        // Check if already registered on blockchain
        const eligibilityCheck = await contractForReads.checkUserEligibility(account);
        const [isEligible, hasClaimed, hasMinBalance, userBalance] = eligibilityCheck;
        
        if (hasClaimed) {
            setRegistrationStatus('✋ You have already registered for this airdrop');
            return;
        }

        if (!hasMinBalance) {
            setRegistrationStatus(`❌ Insufficient balance. Need 1 MATIC. Current: ${ethers.formatEther(userBalance)} MATIC`);
            return;
        }

        // Get signer and create contract instance
        const signer = await provider.getSigner();
        const contractWithSigner = new ethers.Contract(
            import.meta.env.VITE_AIRDROP_ADDRESS,
            AirdropABI.abi,
            signer
        );

        setRegistrationStatus('Registering for airdrop...');
        
        // Call the registration function
        const tx = await contractWithSigner.registerForAirdrop();
        console.log('Registration transaction sent:', tx.hash);
        
        setRegistrationStatus('Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('Registration confirmed:', receipt);

        if (receipt.status === 1) {
            setRegistrationStatus('✅ Successfully registered! You can now claim your airdrop.');
            
            // Prepare the complete registration data
            const registrationData = {
                ...formData,
                wallet: account,
                registrationHash: receipt.transactionHash,
                isRegistered: true,
                airdropType: 'tokens',
                submittedAt: new Date().toISOString()
            };

            // Submit to Firebase through the parent component
            await handleSubmit(registrationData);
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage;
        if (error.message.includes('Maximum participants')) {
            errorMessage = '❌ Maximum participants reached for this airdrop.';
        } else if (error.message.includes('Airdrop ended')) {
            errorMessage = '❌ This airdrop has ended.';
        } else if (error.message.includes('user rejected')) {
            errorMessage = '❌ Transaction was rejected. Please try again.';
        } else if (error.message.includes('UNSUPPORTED_OPERATION')) {
            errorMessage = '❌ Please ensure your wallet is properly connected.';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = '❌ Insufficient funds for transaction fee.';
        } else {
            errorMessage = '❌ Failed to register for airdrop: ' + error.message;
        }
        
        setRegistrationStatus(errorMessage);
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
export default RegistrationForm;