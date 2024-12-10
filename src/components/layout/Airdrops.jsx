// src/components/layout/Airdrops.jsx
import React, { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../components/context/WalletContext';
import { FaGift, FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { airdropsCollection } from '../../components/firebase/config';
import { addDoc, Timestamp } from 'firebase/firestore';

const Airdrop = () => {
    const { account, walletConnected } = useContext(WalletContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        wallet: account || '', // Initial state
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Update form when wallet connects
    useEffect(() => {
        if (account) {
            setFormData(prev => ({
                ...prev,
                wallet: account
            }));
        }
    }, [account]); // Only depend on account changes


    const AIRDROP_STATUS = {
      PENDING: 'pending',     // Initial registration
      VERIFIED: 'verified',   // Email/wallet verified
      APPROVED: 'approved',   // Eligible for airdrop
      DISTRIBUTED: 'distributed', // Tokens sent
      REJECTED: 'rejected'    // Not eligible
    };
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form validation helper
    const validateForm = () => {
        if (!formData.name.trim()) return false;
        if (!formData.email.trim()) return false;
        if (!formData.wallet) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check account exists instead of walletConnected
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
                wallet: account, // Use account directly
                submittedAt: Timestamp.now(),
                status: 'pending'
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
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-12 mt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Join Our Airdrop Program
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
            </div>
        );
    };
    
    export default Airdrop;