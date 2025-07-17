import React, { useContext, useState, useEffect, useCallback } from 'react';
import { WalletContext } from '../../../../context/WalletContext';
import TimeCounter from './TimeCounter';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaImages, FaBox, FaPalette, FaTimes } from 'react-icons/fa';
import { addDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';

// Fix the wrong path - the firebase config is in components/firebase, not in the root firebase folder
import { airdropsCollection } from '../../../firebase/config';
import SubmissionSuccess from './SubmissionSuccess';
import ClaimTokensComponent from './ClaimTokensComponent';

// Fix the path to the hook
import { useAirdropRegistration } from '../../../../hooks/airdrop/useAirdropRegistration';
import submitAirdropRegistration from '../../../firebase/submitAirdropRegistration';

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
    const [step, setStep] = useState(1); // Step 1: Choose airdrop type, Step 2: Fill form, Step 3: Success, Step 4: Claim
    const [userRegistrationData, setUserRegistrationData] = useState(null);
    const [showClaimComponent, setShowClaimComponent] = useState(false);

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
                // Store registration data for claim component
                setUserRegistrationData(participations[0]);
                
                // Check if claim period has started (August 1, 2025)
                const now = new Date();
                const claimStartDate = new Date('2025-08-01T00:00:00');
                
                if (now >= claimStartDate) {
                    setShowClaimComponent(true);
                    setStep(4); // Go to claim step
                } else {
                    setStep(3); // Go to success step (waiting for claim period)
                }
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
            // Use the new airdrop registration service instead
            const result = await submitAirdropRegistration({
                name: data.name || '',
                email: data.email || '',
                wallet: data.wallet || '',
                airdropType: data.airdropType || 'tokens',
                registrationHash: data.registrationHash || ''
            });

            return result.id;
        } catch (error) {
            console.error('Error submitting registration:', error);
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
            setUserRegistrationData(submissionData);
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
                <motion.h2 
                    className="text-xl font-bold bg-nuvo-gradient-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    Join the Airdrop
                </motion.h2>
                <motion.button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaTimes />
                </motion.button>
            </div>

            <motion.div 
                className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                layout
            >
                <div className="p-6">
                    {/* Enhanced Progress indicator */}
                    <div className="flex mb-8 justify-center items-center">
                        {[1, 2, 3].map((i) => (
                            <React.Fragment key={i}>
                                <motion.div 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                        i === step ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' : 
                                        i < step ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                                    }`}
                                    animate={i === step ? { scale: 1.1 } : { scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    {i < step ? '✓' : i}
                                </motion.div>
                                {i < 3 && (
                                    <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                                        i < step ? 'bg-green-500' : 'bg-gray-700'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-medium text-white mb-2">Select Airdrop Type</h3>
                                    <p className="text-gray-400 text-sm">Choose what you'd like to receive</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {airdropTypes.map((type) => (
                                        <motion.div 
                                            key={type.id}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                                formData.airdropType === type.id 
                                                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                                                    : 'border-gray-700 hover:border-purple-400/50 hover:bg-purple-500/5'
                                            } ${type.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => !type.comingSoon && handleChange('airdropType', type.id)}
                                            whileHover={!type.comingSoon ? { y: -2 } : {}}
                                            whileTap={!type.comingSoon ? { scale: 0.98 } : {}}
                                        >
                                            <div className="flex items-center">
                                                <div className={`mr-3 text-xl transition-colors duration-200 ${
                                                    formData.airdropType === type.id ? 'text-purple-400' : 'text-gray-400'
                                                }`}>
                                                    {type.icon}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium">{type.name}</h4>
                                                    <p className="text-xs text-gray-400">{type.description}</p>
                                                    {type.comingSoon && <span className="text-xs text-yellow-400 font-medium">Coming Soon</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <motion.button
                                        onClick={onClose}
                                        className="px-5 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                                        disabled={!formData.airdropType || airdropTypes.find(t => t.id === formData.airdropType)?.comingSoon}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Next Step →
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-medium text-white mb-2">Personal Information</h3>
                                    <p className="text-gray-400 text-sm">Complete your registration details</p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            maxLength={50}
                                            required
                                            className="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-500"
                                            placeholder="Enter your full name"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-500"
                                            placeholder="Enter your email address"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label htmlFor="wallet" className="block text-sm font-medium text-gray-300 mb-2">
                                            Wallet Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="wallet"
                                                id="wallet"
                                                value={account || ''}
                                                disabled
                                                className="w-full px-4 py-3 bg-black/60 border border-gray-800 rounded-lg text-gray-400 pr-10"
                                            />
                                            <div className="absolute right-3 top-3">
                                                {account ? (
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                ) : (
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        {!account && (
                                            <motion.p 
                                                className="text-yellow-400 text-xs mt-2 flex items-center gap-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                ⚠️ Please connect your wallet to continue
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {error && (
                                        <motion.div 
                                            className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="flex justify-between pt-4">
                                        <motion.button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-5 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            ← Back
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading || !account}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center gap-2"
                                            whileHover={!isLoading && account ? { scale: 1.02 } : {}}
                                            whileTap={!isLoading && account ? { scale: 0.98 } : {}}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Registering...
                                                </>
                                            ) : (
                                                'Complete Registration'
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && !showClaimComponent && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <SubmissionSuccess 
                                    onClose={onClose} 
                                    userRegistration={userRegistrationData}
                                    showClaimButton={false}
                                />
                            </motion.div>
                        )}

                        {step === 4 || (step === 3 && showClaimComponent) ? (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <ClaimTokensComponent 
                                    userRegistration={userRegistrationData}
                                    onClose={onClose}
                                />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AirdropForm;