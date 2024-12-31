// src/components/layout/AirdropDashboard/DashboardCards.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Añadir esta importación
import { 
    FaUser, 
    FaRocket,
    FaArrowRight,
    FaCheckCircle,
    FaChartLine,
    FaGift,
    FaCalendar,
    FaCoins,
    FaHistory, 
    FaShieldAlt, 
    FaExclamationCircle,
    FaInfoCircle,
    FaCopy,
    FaMoneyBill
} from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { airdropsCollection } from '../../firebase/config';
import useTreasuryBalance from '../../../hooks/useTreasuryBalance';
import ButtonClaimAirdrop from '../../web3/ButtonClaimAirdrop';
import WalletStatusCard from './WalletStatusCard';
import AirdropProgressCard from './AirdropProgressCard';
import RewardsBenefitsCard from './RewardsBenefitsCard';
import NextAirdropCard from './NextAirdropCard';
import AirdropCalendarCard from './AirdropCalendarCard';
import AirdropPoolStatusCard from './ClaimCard';

const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

const DashboardCards = ({ account, airdropData, formatAddress, onOpenSidebar }) => {
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
                        registrationDate: doc.submittedAt?.toDate() || new Date(),
                        registrationType: doc.airdropType || 'standard',
                        claimStatus: doc.rewards?.tokens?.claimed ? 'claimed' : 'pending',
                        isEligible: true,
                        eligibilityReason: 'Wallet meets all requirements'
                    });
                } else {
                    setWalletHistory({
                        hasParticipated: false,
                        registrationDate: null,
                        registrationType: null,
                        claimStatus: 'pending',
                        isEligible: true,
                        eligibilityReason: 'Wallet eligible for participation'
                    });
                }
            } catch (error) {
                console.error('Error checking wallet history:', error);
                setWalletHistory({
                    hasParticipated: false,
                    registrationDate: null,
                    registrationType: null,
                    claimStatus: 'error',
                    isEligible: false,
                    eligibilityReason: 'Error checking wallet status'
                });
            }
        };

        checkWalletHistory();
    }, [account]);

    const { balance: treasuryBalance, error: treasuryError } = useTreasuryBalance(TREASURY_ADDRESS);

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

    const getDateClassName = (day) => {
        if (!day) return 'text-transparent';
        if (day === 14) return 'text-blue-400 font-bold bg-blue-900/50 rounded-full border border-blue-500/50';
        if (day === 28) return 'text-red-400 font-bold bg-red-900/50 rounded-full border border-red-500/50';
        return 'text-gray-300';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                <WalletStatusCard 
                    account={account} 
                    formatAddress={formatAddress} 
                    walletHistory={walletHistory} 
                    onOpenSidebar={onOpenSidebar} 
                />,
                <AirdropProgressCard 
                    totalParticipants={totalParticipants} 
                    distributionProgress={distributionProgress} 
                    tokensDistributed={tokensDistributed} 
                    TOTAL_AIRDROP_TOKENS={TOTAL_AIRDROP_TOKENS} 
                    TOKEN_SYMBOL={TOKEN_SYMBOL} 
                    MAX_PARTICIPANTS={MAX_PARTICIPANTS} 
                    TOKENS_PER_WALLET={TOKENS_PER_WALLET} 
                    remainingTokens={remainingTokens} 
                />,
                <RewardsBenefitsCard />,
                <NextAirdropCard 
                    formatDate={formatDate} 
                    airdropStartDate={airdropStartDate} 
                    airdropEndDate={airdropEndDate} 
                    onOpenSidebar={onOpenSidebar} 
                />,
                <AirdropCalendarCard 
                    weekDays={weekDays} 
                    monthDays={monthDays} 
                    getDateClassName={getDateClassName} 
                />,
                <AirdropPoolStatusCard 
                    treasuryBalance={treasuryBalance} 
                    treasuryError={treasuryError} 
                    walletHistory={walletHistory} 
                    account={account} 
                />
            ].map((CardComponent, index) => (
                <motion.div
                    key={index}
                    className="bg-pink-400/5 rounded-xl p-6 border border-purple-500 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {CardComponent}
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardCards;