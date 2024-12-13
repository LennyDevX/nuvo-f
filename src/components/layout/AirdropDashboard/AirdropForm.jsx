import React, { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../context/WalletContext';
import { FaGift, FaWallet, FaCoins, FaPalette, FaImages, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { airdropsCollection } from '../../firebase/config';
import { addDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';

const airdropTypes = [
    { id: 'tokens', name: 'Tokens', description: 'Receive tokens directly to your wallet', icon: <FaCoins /> },
    { id: 'nfts', name: 'NFTs', description: 'Get exclusive NFTs', icon: <FaImages />, comingSoon: true },
    { id: 'items', name: 'Items', description: 'Receive special items', icon: <FaBox />, comingSoon: true },
    { id: 'art', name: 'Art', description: 'Get unique digital art', icon: <FaPalette />, comingSoon: true }
];

const AirdropForm = () => {
    const { account, walletConnected } = useContext(WalletContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        wallet: account || '',
        airdropType: ''
    });

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getAirdropTypeStatus = async (typeId) => {
        const participations = await checkPreviousParticipation(typeId);
        if (participations && participations.length > 0) {
            const participation = participations[0];
            return {
                isRegistered: true,
                timestamp: new Date(participation.submittedAt.seconds * 1000).toLocaleDateString(),
                submissionId: participation.id
            };
        }
        return { isRegistered: false };
    };

    useEffect(() => {
        const targetDate = new Date('2024-12-14T00:00:00');
        
        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;
            
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            
            setTimeLeft({ days, hours, minutes, seconds });
            
            if (difference < 0) {
                clearInterval(timer);
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (account) {
            setFormData(prev => ({
                ...prev,
                wallet: account
            }));
        }
    }, [account]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const checkPreviousParticipation = async (airdropType) => {
        const q = query(airdropsCollection, where('wallet', '==', account), where('airdropType', '==', airdropType));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const validateForm = async () => {
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }
        if (!formData.wallet) {
            setError('Please connect your wallet first');
            return false;
        }
        if (!formData.airdropType) {
        if (!formData.airdropType) {
            setError('Please select an airdrop type');
            return false;
        }
        
        const { isRegistered } = await getAirdropTypeStatus(formData.airdropType);
            setError(`You have already registered for this airdrop type. Please select a different one.`);
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }
    
        if (!validateForm()) {
            return;
        }
    
        setIsLoading(true);
        try {
            const selectedAirdropType = airdropTypes.find(type => type.id === formData.airdropType);
            const sanitizedAirdropDetails = {
                id: selectedAirdropType.id,
                name: selectedAirdropType.name,
                description: selectedAirdropType.description
            };
    
            const submissionData = {
                name: String(formData.name).trim(),
                email: String(formData.email).trim().toLowerCase(),
                wallet: String(account),
                airdropType: String(formData.airdropType),
                airdropDetails: sanitizedAirdropDetails,
                status: 'pending',
                submittedAt: Timestamp.now(),
                lastUpdated: Timestamp.now(),
                isWalletVerified: Boolean(account),
                emailVerified: false,
                rewards: {
                    tokens: {
                        amount: Number(0),
                        claimed: Boolean(false),
                        claimDate: null
                    },
                    nfts: [],
                    items: [],
                    collection: null
                },
                participationCount: Number(1),
                lastParticipation: Timestamp.now(),
                eligibilityScore: Number(0),
                notes: String(''),
                ipAddress: String(''),
                userAgent: String(navigator.userAgent || '')
            };
            
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    const docRef = await addDoc(airdropsCollection, submissionData);
                    console.log('Airdrop registration successful with ID:', docRef.id);
                    
                    const participations = JSON.parse(localStorage.getItem('airdropParticipations') || '{}');
                    participations[formData.airdropType] = {
                        submissionId: docRef.id,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('airdropParticipations', JSON.stringify(participations));
                    
                    setIsSubmitted(true);
                    setError(null);
                    localStorage.removeItem('airdropParticipations');
                    break;
                } catch (err) {
                    retryCount++;
                    if (retryCount === maxRetries) {
                        throw err;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }
        } catch (err) {
            console.error('Error submitting airdrop registration:', err);
            setError('Failed to submit registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen mt-16">
            <motion.div className="mb-8 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
                    <div className="bg-black/30 rounded-xl p-4">
                        <div className="text-2xl font-bold">{timeLeft.days}</div>
                        <div className="text-sm text-gray-400">Days</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                        <div className="text-2xl font-bold">{timeLeft.hours}</div>
                        <div className="text-sm text-gray-400">Hours</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                        <div className="text-sm text-gray-400">Minutes</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                        <div className="text-sm text-gray-400">Seconds</div>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Join Our <span className='text-gradient bg-gradient-to-r from-purple-400 to-pink-500'>Airdrop Program</span>
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Subscribe to receive tokens, NFTs, and other digital assets directly to your Polygon wallet.
                    </p>
                </motion.div>

                <motion.div
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {isSubmitted ? (
                        <div className="text-center text-white">
                            <FaGift className="text-6xl text-purple-400 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Thank You for Subscribing!</h2>
                            <p className="text-lg">You will receive updates about upcoming airdrops in your email.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <label className="block text-gray-300 mb-2">Select Airdrop Type</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {airdropTypes.map((type) => {
                                        const { isRegistered, timestamp } = getAirdropTypeStatus(type.id);
                                        
                                        return (
                                            <label
                                                key={type.id}
                                                className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300
                                                    ${type.comingSoon 
                                                        ? 'bg-gray-800/50 border-2 border-gray-600 cursor-not-allowed' 
                                                        : isRegistered 
                                                            ? 'bg-gray-800/50 border-2 border-gray-600 cursor-not-allowed' 
                                                            : formData.airdropType === type.id 
                                                                ? 'bg-purple-600/20 border-2 border-purple-500 shadow-lg shadow-purple-500/20' 
                                                                : 'bg-black/30 border-2 border-purple-500/30 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="airdropType"
                                                    value={type.id}
                                                    checked={formData.airdropType === type.id}
                                                    onChange={handleChange}
                                                    disabled={isRegistered || type.comingSoon}
                                                    className="hidden"
                                                />
                                                <div className={`text-2xl transition-all duration-300
                                                    ${isRegistered || type.comingSoon 
                                                        ? 'text-gray-500' 
                                                        : formData.airdropType === type.id 
                                                            ? 'text-purple-400 scale-110' 
                                                            : 'text-gray-400'}`}
                                                >
                                                    {type.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-white flex items-center gap-2">
                                                        {type.name}
                                                        {isRegistered && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                                                                Registered
                                                            </span>
                                                        )}
                                                        {type.comingSoon && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                                                                Coming Soon
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isRegistered && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Registered on {timestamp}
                                                        </div>
                                                    )}
                                                </div>
                                                {formData.airdropType === type.id && !isRegistered && !type.comingSoon && (
                                                    <motion.div
                                                        layoutId="selectedIndicator"
                                                        className="absolute -right-1 -top-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    </motion.div>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                                {error && error.includes('airdrop type') && (
                                    <motion.p 
                                        className="text-red-400 text-sm mt-2"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <label className="block text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-2 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-4 py-2 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-300 mb-2">Wallet Address</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="wallet"
                                        value={formData.wallet}
                                        readOnly
                                        className={`w-full bg-black/30 border-2 ${
                                            walletConnected ? 'border-green-500/30' : 'border-purple-500/30'
                                        } rounded-xl px-4 py-2 text-white focus:border-purple-500 focus:outline-none transition-colors`}
                                        placeholder={walletConnected ? '' : 'Connect your wallet first'}
                                    />
                                    {walletConnected && account && (
                                        <FaWallet className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400" />
                                    )}
                                </div>
                                {walletConnected && account && (
                                    <span className="block text-green-400 mt-2">✓ Wallet connected and verified</span>
                                )}
                                {error && <span className="block text-red-400 mt-2">{error}</span>}
                            </div>
                            <div className="text-center">
                                <motion.div
                                    whileHover={!isLoading && { y: -2, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
                                    whileTap={!isLoading && { scale: 0.98 }}
                                >
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all ${
                                            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
                                        }`}
                                    >
                                        {isLoading ? 'Processing...' : 'Subscribe'}
                                    </button>
                                </motion.div>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
            <style>{`
                .text-gradient {
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                }
            `}</style>
        </div>
    );
};

export default AirdropForm;