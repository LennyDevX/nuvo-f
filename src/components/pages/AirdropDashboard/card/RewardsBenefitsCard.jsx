import React from 'react';
import { 
    FaCoins, 
    FaChartLine, 
    FaRocket, 
    FaUsers, 
    FaLock, 
    FaHandshake,
    FaTrophy,
    FaGem
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const RewardsBenefitsCard = () => {
    const benefits = [
        
        {
            icon: <FaChartLine className="text-green-400" />,
            title: "125% APY Staking",
            description: "High-yield earnings on staked tokens",
            tag: "Earning Opportunity"
        },
        {
            icon: <FaLock className="text-blue-400" />,
            title: "No Lock Period",
            description: "Flexible withdrawals and instant liquidity",
            tag: "Flexibility"
        },
        
    ];

    const additionalPerks = [
        {
            icon: <FaHandshake className="text-indigo-400" />,
            title: "Priority Access",
            description: "Early access to new features and products"
        },
        {
            icon: <FaTrophy className="text-amber-400" />,
            title: "Exclusive Events",
            description: "Access to community events and workshops"
        },
        {
            icon: <FaGem className="text-pink-400" />,
            title: "NFT Rewards",
            description: "Special NFT drops for active members"
        }
    ];

    const BenefitItem = ({ icon, title, description, tag }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-purple-500/20">
            <div className="mt-1">{icon}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="text-white font-medium">{title}</div>
                    {tag && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                            {tag}
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-400 mt-1">{description}</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Rewards & Benefits</h3>
                <div className="flex items-center gap-2">
                    <FaGem className="text-purple-400" />
                    <span className="text-sm text-gray-400">Member Perks</span>
                </div>
            </div>

            <div className="space-y-3">
                {benefits.map((benefit, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <BenefitItem {...benefit} />
                    </motion.div>
                ))}
            </div>

            <div className="border-t border-purple-500/20 pt-3">
                <div className="text-sm font-medium text-gray-300 mb-2">Additional Perks</div>
                <div className="grid grid-cols-3 gap-2">
                    {additionalPerks.map((perk, index) => (
                        <motion.div
                            key={index}
                            className="p-2 rounded-lg bg-black/20 border border-purple-500/20"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (index * 0.1) }}
                        >
                            <div className="flex justify-center mb-1">{perk.icon}</div>
                            <div className="text-center">
                                <div className="text-xs font-medium text-gray-200">{perk.title}</div>
                                <div className="text-xs text-gray-400">{perk.description}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 text-center">
                <span className="text-purple-300 text-sm">
                    🎉 Participate now to unlock all benefits!
                </span>
            </div>
        </div>
    );
};

export default RewardsBenefitsCard;