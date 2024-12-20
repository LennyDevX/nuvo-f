// src/components/layout/AirdropDashboard/AirdropDashboard.jsx
import React, { useContext, useState } from 'react';
import AirdropForm from './AirdropForm/AirdropForm';
import { WalletContext } from '../../context/WalletContext';
import { useAirdropData } from '../../../hooks/useAirdropData';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCards from './AirdropCards';
import { FaTimes } from 'react-icons/fa';

const AirdropDashboard = () => {
    const { account } = useContext(WalletContext);
    const { airdropData } = useAirdropData(account);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const verifyEligibility = async (submissionData) => {
        // Example usage of verifyEligibility
        const isEligible = await verifyEligibility(submissionData);
        console.log(`Eligibility: ${isEligible}`);
        const eligibilityScore = calculateEligibilityScore({
          walletAge: submissionData.isWalletVerified,
          emailVerified: submissionData.emailVerified,
          participationCount: submissionData.participationCount,
          // Add more criteria
        });
      
        return eligibilityScore > 50; // Threshold for eligibility
      };

    const Sidebar = () => (
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.3 }}
                    className="fixed top-0 right-0 h-full w-full md:w-[500px] lg:w-[600px] bg-black/95 backdrop-blur-lg z-50 overflow-y-auto shadow-2xl border-l border-purple-500/20"
                >
                    <div className="p-8 md:p-12">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-6 right-6 text-white hover:text-purple-400 transition-colors duration-200"
                        >
                            <FaTimes size={24} />
                        </button>
                        <div className="mt-16 md:mt-20">
                            <AirdropForm />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 pt-24 pb-16 px-4 md:px-8">
            <Sidebar />
            
            <div className="max-w-[1440px] mx-auto">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4">
                    Airdrop Beta{" "}
                    <span className="text-white">
                        Dashboard
                    </span>
                    </h1>
                    <p className="text-gray-300">
                    Manage your airdrop submissions and eligibility
                    </p>
                </motion.div>

                <div className="container mx-auto">
                    <DashboardCards 
                        account={account}
                        airdropData={airdropData}
                        formatAddress={formatAddress}
                        onOpenSidebar={() => setIsSidebarOpen(true)}
                    />
                </div>
            </div>
            
        </div>
    );
};

export default AirdropDashboard;