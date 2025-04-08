// src/components/layout/AirdropDashboard/AirdropDashboard.jsx
import React, { useContext, useState } from 'react';
import { WalletContext } from '../../../context/WalletContext';
import { useAirdropData } from '../../../hooks/useAirdropData';
import { m, AnimatePresence } from 'framer-motion'; // Changed motion to m
import { FaTimes } from 'react-icons/fa';
import AirdropCards from './card/AirdropCards'; // Updated import 
import AirdropForm from '../../pages/AirdropDashboard/AirdropForm/AirdropForm'; // Updated import
import SpaceBackground from '../../effects/SpaceBackground'; // Import SpaceBackground

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
                <m.div // Changed from motion.div to m.div
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
                            <AirdropForm onClose={() => setIsSidebarOpen(false)} />
                        </div>
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-nuvo-gradient pt-24 pb-16 px-4 md:px-8">
            <SpaceBackground customClass="opacity-90" />
            <Sidebar />
            
            <div className="max-w-[1440px] mx-auto">
                <m.div // Changed from motion.div to m.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                            style={{ textShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }}>
                            Airdrops
                        </h1>
                        <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full border border-purple-500/50 shadow-[0_0_1rem_-0.5rem_#8b5cf6]">
                            BETA v1.0
                        </span>
                    </div>
                    
                    <p className="text-lg text-white/90 max-w-2xl mx-auto mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        Join our community airdrop event and be part of the next generation of decentralized finance.
                    </p>
                    <p className="text-sm text-purple-100/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        Manage your airdrop submissions and check your eligibility status
                    </p>
                </m.div>

                <div className="container mx-auto">
                    <AirdropCards 
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