// src/components/layout/AirdropDashboard/AirdropForm.jsx
import React, { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../context/WalletContext';
import { FaGift, FaWallet, FaCoins, FaPalette, FaImages, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { airdropsCollection } from '../../firebase/config';
import { addDoc, Timestamp } from 'firebase/firestore';

const AirdropForm = () => {
    const { account, walletConnected } = useContext(WalletContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        wallet: account || '',
        airdropType: '' // Add new field
    });

    // Countdown timer state
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

    const airdropTypes = [
        { id: 'tokens', name: 'Tokens', icon: <FaCoins />, description: 'POL tokens airdrop' },
        { id: 'nft', name: 'NFT', icon: <FaPalette />, description: 'Exclusive NFT drop' },
        { id: 'collection', name: 'NFT Collection', icon: <FaImages />, description: 'Complete NFT collection' },
        { id: 'items', name: 'Items', icon: <FaBox />, description: 'In-game items and collectibles' }
    ];

    // Calculate countdown
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

    // Update form validation
    const validateForm = () => {
        if (!formData.name.trim()) return false;
        if (!formData.email.trim()) return false;
        if (!formData.wallet) return false;
        if (!formData.airdropType) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }

        if (!validateForm()) {
            setError('Please fill in all required fields');
            return;
        }
    
        setIsLoading(true);
        try {
            const submissionData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                wallet: account,
                submittedAt: Timestamp.now(),
                status: 'pending',
                rewards: {
                    tokens: [],
                    nfts: [],
                    other: []
                },
                lastUpdated: Timestamp.now()
            };
            
            const docRef = await addDoc(airdropsCollection, submissionData);
            console.log('Document written with ID: ', docRef.id);
            setIsSubmitted(true);
            setError(null);
        } catch (err) {
            console.error('Error adding document: ', err);
            setError('Failed to submit form. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen  mt-16">

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
                        Join Our  {""}
                        <span className='text-gradient bg-gradient-to-r from-purple-400 to-pink-500'>
                        Airdrop Program
                        </span>
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
                                {airdropTypes.map((type) => (
                                    <label
                                        key={type.id}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-xl cursor-pointer
                                            transition-all duration-200
                                            ${formData.airdropType === type.id 
                                                ? 'bg-purple-600/20 border-2 border-purple-500' 
                                                : 'bg-black/30 border-2 border-purple-500/30 hover:border-purple-500/50'}
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="airdropType"
                                            value={type.id}
                                            checked={formData.airdropType === type.id}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`text-2xl ${formData.airdropType === type.id ? 'text-purple-400' : 'text-gray-400'}`}>
                                            {type.icon}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{type.name}</div>
                                            <div className="text-sm text-gray-400">{type.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
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