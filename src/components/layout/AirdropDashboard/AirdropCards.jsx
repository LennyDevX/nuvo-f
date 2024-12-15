// src/components/layout/AirdropDashboard/DashboardCards.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Añadir esta importación
import { 
    FaUser, 
    FaRocket,
    FaArrowRight,
    FaCheckCircle,
    FaChartLine, 
    FaGifts,
    FaCalendar,
    FaCoins,
    FaHistory, 
    FaShieldAlt, 
    FaExclamationCircle,
    FaInfoCircle,
    FaCopy
} from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { airdropsCollection } from '../../firebase/config';

const DashboardCards = ({ account, formatAddress, onOpenSidebar }) => {
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [walletHistory, setWalletHistory] = useState({
        hasParticipated: false,
        registrationDate: null,
        registrationType: null,
        claimStatus: 'pending',
        isEligible: true,
        eligibilityReason: null
    });
    
    const airdropStartDate = new Date('2024-12-14');
    const airdropEndDate = new Date('2025-01-14');
    const today = new Date();
    // Calculate time-related values
    const totalDays = (airdropEndDate - airdropStartDate) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today - airdropStartDate) / (1000 * 60 * 60 * 24);
    const airdropProgress = Math.min(Math.max(Math.round((daysElapsed / totalDays) * 100), 0), 100);
    
    // Obtener participantes desde Firebase
    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const querySnapshot = await getDocs(airdropsCollection);
                const participantsCount = querySnapshot.size;
                setTotalParticipants(participantsCount);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };
        
        fetchParticipants();
    }, []);
    
    useEffect(() => {
        const checkWalletHistory = async () => {
            if (!account) return;
            
            try {
                const q = query(airdropsCollection, where('wallet', '==', account));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0].data();
                    setWalletHistory({
                        hasParticipated: true,
                        registrationDate: doc.submittedAt.toDate(),
                        registrationType: doc.airdropType,
                        claimStatus: doc.rewards.tokens.claimed ? 'claimed' : 'pending',
                        isEligible: true,
                        eligibilityReason: 'Wallet meets all requirements'
                    });
                }
            } catch (error) {
                console.error('Error checking wallet history:', error);
            }
        };

        checkWalletHistory();
    }, [account]);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getCurrentMonthDays = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const days = [];
        const startPadding = firstDay.getDay();
        
        // Add padding for start of month
        for(let i = 0; i < startPadding; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for(let i = 1; i <= lastDay.getDate(); i++) {
            days.push(i);
        }
        
        return days;
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthDays = getCurrentMonthDays();

    // Constantes actualizadas para el airdrop
    const TOTAL_AIRDROP_TOKENS = 500; // 250 POL tokens en total
    const TOKEN_SYMBOL = 'POL';
    const TOKENS_PER_WALLET = 10; // 10 POL por wallet
    const MAX_PARTICIPANTS = Math.floor(TOTAL_AIRDROP_TOKENS / TOKENS_PER_WALLET); // 25 participantes máximo
    
    // Calcular el porcentaje de tokens distribuidos
    const distributionProgress = (totalParticipants * TOKENS_PER_WALLET / TOTAL_AIRDROP_TOKENS) * 100;
    const tokensDistributed = totalParticipants * TOKENS_PER_WALLET;
    const remainingTokens = TOTAL_AIRDROP_TOKENS - tokensDistributed;

    const cards = [
        {
            icon: <FaUser className="text-4xl text-purple-400" />,
            title: "Wallet Status",
            content: (
                <div className="space-y-4">
                    {/* Wallet Address Section */}
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Address:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-200">{formatAddress(account)}</span>
                            {account && (
                                <button 
                                    onClick={() => navigator.clipboard.writeText(account)}
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <FaCopy size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Verification:</span>
                        <div className="flex items-center gap-2">
                            {account ? (
                                <>
                                    <FaShieldAlt className="text-green-500" />
                                    <span className="text-green-400">Verified</span>
                                </>
                            ) : (
                                <>
                                    <FaExclamationCircle className="text-yellow-500" />
                                    <span className="text-yellow-500">Connect Wallet</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Registration Status */}
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Registration:</span>
                        <div className="flex items-center gap-2">
                            <FaHistory className="text-purple-400" />
                            <span className={`${walletHistory.hasParticipated ? 'text-green-400' : 'text-gray-400'}`}>
                                {walletHistory.hasParticipated ? 'Registered' : 'Not Registered'}
                            </span>
                        </div>
                    </div>

                    {/* Claim Status */}
                    {walletHistory.hasParticipated && (
                        <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                            <span className="text-gray-400">Claim Status:</span>
                            <span className={`
                                ${walletHistory.claimStatus === 'claimed' ? 'text-green-400' : 'text-yellow-500'}
                            `}>
                                {walletHistory.claimStatus === 'claimed' ? 'Claimed' : 'Pending'}
                            </span>
                        </div>
                    )}

                    {/* Registration Date */}
                    {walletHistory.registrationDate && (
                        <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                            <span className="text-gray-400">Registered On:</span>
                            <span className="text-gray-200">
                                {walletHistory.registrationDate.toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {/* Eligibility Status with Tooltip */}
                    <div className="relative group">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Eligibility:</span>
                            <div className="flex items-center gap-2">
                                {walletHistory.isEligible ? (
                                    <span className="text-green-400">Eligible</span>
                                ) : (
                                    <span className="text-red-400">Not Eligible</span>
                                )}
                                <FaInfoCircle className="text-gray-400 cursor-help" />
                            </div>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 invisible group-hover:visible bg-black/90 text-white text-xs p-2 rounded whitespace-nowrap">
                            {walletHistory.eligibilityReason || 'Connect wallet to check eligibility'}
                        </div>
                    </div>

                    {/* Action Button */}
                    {!walletHistory.hasParticipated && account && (
                        <button
                            onClick={onOpenSidebar}
                            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 px-4 rounded transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            Register for Airdrop
                            <FaArrowRight className="text-sm" />
                        </button>
                    )}
                </div>
            )
        },
        {
            icon: <FaChartLine className="text-4xl text-purple-400" />,
            title: "Airdrop Progress",
            content: (
                <div className="space-y-4">
                    <div className="bg-purple-900/30 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Distribution Progress</span>
                            <span className="text-purple-400 font-medium">{distributionProgress.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${distributionProgress}%` }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-400">
                            <span>{tokensDistributed} {TOKEN_SYMBOL}</span>
                            <span>{TOTAL_AIRDROP_TOKENS} {TOKEN_SYMBOL}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <FaUser className="text-purple-400 text-sm" />
                                <span className="text-sm text-gray-400">Registered Wallets</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-2xl font-bold text-white">
                                    {totalParticipants}
                                </div>
                                <div className="text-xs text-gray-400">
                                    of {MAX_PARTICIPANTS}
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <FaCoins className="text-purple-400 text-sm" />
                                <span className="text-sm text-gray-400">Per Wallet</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {TOKENS_PER_WALLET} <span className="text-sm text-purple-400">{TOKEN_SYMBOL}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-center text-gray-400 bg-purple-900/10 rounded-lg py-2">
                        Remaining tokens: {remainingTokens} {TOKEN_SYMBOL}
                    </div>
                </div>
            )
        },
        {
            icon: <FaGifts className="text-4xl text-purple-400" />,
            title: "Rewards & Benefits",
            content: (
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg bg-purple-900/30 p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-green-400">
                                <FaCheckCircle />
                                <span>Early Access to New NFTs</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <FaCheckCircle />
                                <span>Community First </span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <FaCheckCircle />
                                <span>Trading Fee Discounts</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <FaCheckCircle />
                                <span>Free Tokens</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: <FaRocket className="text-4xl text-purple-400" />,
            title: "Next Airdrop",
            content: (
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg bg-purple-900/30 p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Token:</span>
                                <span className="text-purple-400 font-medium">POL</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Amount:</span>
                                <span className="text-purple-400 font-medium">1000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Date:</span>
                                <span className="text-purple-400 font-medium">{formatDate(airdropStartDate)}</span>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <FaRocket className="text-8xl text-purple-400" />
                        </div>
                    </div>
                    <button 
                        onClick={onOpenSidebar}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        <span>Register Now</span>
                        <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            )
        },
        {
            icon: <FaCalendar className="text-4xl text-purple-400" />,
            title: "Airdrop Calendar",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map(day => (
                            <div 
                                key={day}
                                className="text-center p-1 text-gray-400 text-sm"
                            >
                                {day}
                            </div>
                        ))}
                        {monthDays.map((day, index) => (
                            <div 
                                key={index}
                                className={`text-center p-1 ${
                                    day === null 
                                        ? 'text-transparent' 
                                        : day === 14
                                            ? 'text-purple-400 font-bold bg-purple-900/50 rounded-full'
                                            : 'text-gray-300'
                                }`}
                            >
                                {day || '-'}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-purple-600 rounded"></div>
                        <span className="text-gray-300">Next Airdrop</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {cards.map((card, index) => (
                <motion.div
                    key={index}
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        {card.icon}
                        <h2 className="text-2xl font-bold text-white">{card.title}</h2>
                    </div>
                    {card.content}
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardCards;