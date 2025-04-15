import React, { useContext, useState, useEffect, useCallback } from 'react';
import { WalletContext } from '../../../../context/WalletContext';
import TimeCounter from './TimeCounter';
import { motion } from 'framer-motion';
import { FaCoins, FaImages, FaBox, FaPalette, FaTimes } from 'react-icons/fa';
import { addDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { airdropsCollection } from '../../../firebase/config';
import SubmissionSuccess from './SubmissionSuccess';
import { useAirdropRegistration } from '../../../../hooks/useAirdropRegistration';

const airdropTypes = [  
    { id: 'tokens', name: 'Tokens', description: 'Receive NUVO tokens', icon: <FaCoins /> },
    { id: 'nfts', name: 'NFTs', description: 'Get exclusive NFTs', icon: <FaImages />, comingSoon: true },
    { id: 'items', name: 'Items', description: 'Unlock special items', icon: <FaBox />, comingSoon: true },
    { id: 'art', name: 'Art', description: 'Claim unique digital art', icon: <FaPalette />, comingSoon: true }
];

const AirdropForm = ({ onClose }) => {
    const { account, walletConnected, provider } = useContext(WalletContext);
    const { registerForAirdrop, getAirdropInfo } = useAirdropRegistration(provider, account);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        wallet: account || '',
        airdropType: 'tokens' // Default to tokens type
    });
    const [submitCount, setSubmitCount] = useState(0);
    const [lastSubmitTime, setLastSubmitTime] = useState(null);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // Step 1: Choose airdrop type, Step 2: Fill form

    // Handlers and helpers
    const handleChange = (nameOrEvent, value) => {
        if (nameOrEvent?.target) {
            const { name, value } = nameOrEvent.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        } else if (typeof nameOrEvent === 'string') {
            setFormData(prev => ({ ...prev, [nameOrEvent]: value }));
            
            // Auto advance to step 2 when selecting airdrop type
            if (nameOrEvent === 'airdropType' && value) {
                setStep(2);
            }
        }
    };

    // Check if user has already registered
    useEffect(() => {
        if (account) {
            checkRegistrationStatus();
            setFormData(prev => ({ ...prev, wallet: account }));
        }
    }, [account]);

    const checkRegistrationStatus = async () => {
        if (!account) return;
        
        try {
            const participations = await checkPreviousParticipation('tokens');
            setIsAlreadyRegistered(participations.length > 0);
            if (participations.length > 0) {
                setStep(3); // Move to success state if already registered
            }
        } catch (error) {
            console.error('Error checking registration:', error);
        }
    };

    const checkPreviousParticipation = async (airdropType) => {
        try {
            const q = query(airdropsCollection, where('wallet', '==', account), where('airdropType', '==', airdropType));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error checking participation:', error);
            return [];
        }
    };

    const submitToBackend = useCallback(async (data) => {
        try {
            const cleanData = {
                name: data.name || '',
                email: data.email || '',
                wallet: data.wallet || '',
                airdropType: data.airdropType || 'tokens',
                registrationHash: data.registrationHash || '',
                isRegistered: Boolean(data.isRegistered),
                submittedAt: Timestamp.now(),
                status: 'pending'
            };

            if (!cleanData.name || !cleanData.email || !cleanData.wallet) {
                throw new Error('Missing required fields');
            }

            const docRef = await addDoc(airdropsCollection, cleanData);
            return docRef.id;
        } catch (error) {
            console.error('Error submitting:', error);
            throw error;
        }
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isLoading) return;
        
        setIsLoading(true);
        setError(null);

        try {
            // Validate form
            if (!formData.name.trim() || !formData.email.trim()) {
                setError('Please fill out all required fields');
                setIsLoading(false);
                return;
            }

            if (!account) {
                setError('Please connect your wallet first');
                setIsLoading(false);
                return;
            }

            // Submit to backend
            const submissionData = {
                ...formData,
                wallet: account,
                isRegistered: true,
                submittedAt: new Date().toISOString()
            };

            await submitToBackend(submissionData);
            setRegistrationCompleted(true);
            setStep(3);
        } catch (error) {
            console.error('Submission error:', error);
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full mx-auto">
            {/* Header with title and close button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className=""></h2>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-1"
                >
                    <FaTimes />
                </button>
            </div>

            <motion.div 
                className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="p-5">
                    {/* Progress indicator */}
                    <div className="flex mb-6 justify-center">
                        {[1, 2, 3].map((i) => (
                            <div 
                                key={i}
                                className={`w-3 h-3 mx-1 rounded-full ${
                                    i === step ? 'bg-purple-500' : 
                                    i < step ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>

                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h3 className="text-lg font-medium text-white mb-4">Select Airdrop Type</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {airdropTypes.map((type) => (
                                    <div 
                                        key={type.id}
                                        className={`p-4 rounded-lg border cursor-pointer ${
                                            formData.airdropType === type.id 
                                                ? 'border-purple-500 bg-purple-900/20' 
                                                : 'border-gray-700 hover:border-gray-500'
                                        } ${type.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => !type.comingSoon && handleChange('airdropType', type.id)}
                                    >
                                        <div className="flex items-center">
                                            <div className="mr-3 text-lg text-purple-400">{type.icon}</div>
                                            <div>
                                                <h4 className="text-white">{type.name}</h4>
                                                <p className="text-xs text-gray-400">{type.description}</p>
                                                {type.comingSoon && <span className="text-xs text-yellow-500">Coming Soon</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 flex justify-between">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!formData.airdropType || airdropTypes.find(t => t.id === formData.airdropType)?.comingSoon}
                                >
                                    Next
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={50}
                                        required
                                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="wallet" className="block text-sm font-medium text-gray-300 mb-1">
                                        Wallet Address
                                    </label>
                                    <input
                                        type="text"
                                        name="wallet"
                                        id="wallet"
                                        value={account || ''}
                                        disabled
                                        className="w-full px-3 py-2 bg-black/50 border border-gray-800 rounded-lg text-gray-400"
                                    />
                                    {!account && (
                                        <p className="text-yellow-500 text-xs mt-1">
                                            Please connect your wallet to continue
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-3 rounded bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-between pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 text-gray-400 hover:text-white"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !account}
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Submitting...' : 'Register'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <SubmissionSuccess onClose={onClose} />
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AirdropForm;