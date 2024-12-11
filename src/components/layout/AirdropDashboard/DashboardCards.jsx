// src/components/layout/AirdropDashboard/DashboardCards.jsx
import React from 'react';
import { 
    FaUser, 
    FaRocket,
    FaArrowRight,
    FaCheckCircle,
    FaClock,
    FaChartLine, 
    FaGifts,
    FaCalendar
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const DashboardCards = ({ account, formatAddress, onOpenSidebar }) => {
    const airdropStartDate = new Date('2024-12-14');
    const airdropEndDate = new Date('2025-01-14');
    const today = new Date();
    
    // Calculate progress based on time
    const totalDays = (airdropEndDate - airdropStartDate) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today - airdropStartDate) / (1000 * 60 * 60 * 24);
    const airdropProgress = Math.min(Math.max(Math.round((daysElapsed / totalDays) * 100), 0), 100);
    
    // Get participants from localStorage or initialize
    const storedParticipants = JSON.parse(localStorage.getItem('airdropParticipants') || '[]');
    const totalParticipants = account && !storedParticipants.includes(account) 
        ? [...storedParticipants, account].length 
        : storedParticipants.length;
    
    // Store new participant if not already stored
    React.useEffect(() => {
        if (account && !storedParticipants.includes(account)) {
            localStorage.setItem('airdropParticipants', JSON.stringify([...storedParticipants, account]));
        }
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

    const cards = [
        {
            icon: <FaUser className="text-4xl text-purple-400" />,
            title: "Wallet Status",
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Address:</span>
                        <span className="text-gray-200">{formatAddress(account)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Verification:</span>
                        <div className="flex items-center gap-2">
                            {account ? (
                                <FaCheckCircle className="text-green-500" />
                            ) : (
                                <FaClock className="text-yellow-500" />
                            )}
                            <span className="text-gray-200 capitalize">
                                {account ? 'Verified' : 'Connect Wallet'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Eligibility:</span>
                        <span className="text-purple-400 font-bold">
                            {account ? 'Eligible' : 'Pending'}
                        </span>
                    </div>
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
                            <span className="text-purple-400 font-medium">{airdropProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${airdropProgress}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white mb-1">
                                {totalParticipants}
                            </div>
                            <div className="text-sm text-gray-400">Total Participants</div>
                        </div>
                        <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white mb-1">1000</div>
                            <div className="text-sm text-gray-400">POL Tokens</div>
                        </div>
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