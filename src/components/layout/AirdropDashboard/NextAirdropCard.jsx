import React from 'react';
import { 
    FaRocket, 
    FaCalendar, 
    FaCoins, 
    FaClock, 
    FaShieldAlt,
    FaInfoCircle,
    FaArrowRight,
    FaUsers
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const NextAirdropCard = ({ onOpenSidebar }) => {
    const airdropInfo = {
        start: new Date('2025-01-15'),
        end: new Date('2025-01-31'),
        rewardAmount: '5 POL',
        maxParticipants: 50,
        distributionDate: new Date('2025-01-25')
    };

    const InfoRow = ({ icon: Icon, label, value, highlight = false }) => (
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
            <div className="flex items-center gap-2">
                <Icon className="text-purple-400" />
                <span className="text-gray-300">{label}</span>
            </div>
            <span className={`text-gray-200 font-medium ${highlight ? 'text-purple-400' : ''}`}>
                {value}
            </span>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FaRocket className="text-purple-400" />
                    <h3 className="text-lg font-medium text-gray-200">Next Airdrop</h3>
                </div>
                <span className="text-yellow-400 text-sm px-3 py-1 bg-yellow-500/20 rounded-full">
                    Coming Soon
                </span>
            </div>

            <div className="bg-black/20 rounded-lg p-4 space-y-3">
                <InfoRow 
                    icon={FaCalendar}
                    label="Registration"
                    value={airdropInfo.start.toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                />
                <InfoRow 
                    icon={FaClock}
                    label="Distribution"
                    value={airdropInfo.distributionDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    })}
                />
                <InfoRow 
                    icon={FaCoins}
                    label="Reward"
                    value={airdropInfo.rewardAmount}
                    highlight
                />
                <InfoRow 
                    icon={FaUsers}
                    label="Limit"
                    value={`${airdropInfo.maxParticipants} wallets`}
                />
            </div>

            <div className="bg-black/20 rounded-lg p-4">
                <h4 className="flex items-center gap-2 text-gray-200 font-medium mb-3">
                    <FaShieldAlt className="text-purple-400" />
                    Requirements
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        Minimum 1 MATIC balance
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        Complete registration
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        Valid wallet address
                    </li>
                </ul>
            </div>

            <motion.button 
                onClick={onOpenSidebar}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span className="font-medium">Register for Airdrop</span>
                <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </motion.button>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-purple-400 mt-1" />
                    <p className="text-sm text-gray-300">
                        Early registrants have priority access to future airdrops and staking pools
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NextAirdropCard;