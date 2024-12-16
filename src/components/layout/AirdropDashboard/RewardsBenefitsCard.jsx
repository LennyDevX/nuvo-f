import React from 'react';
import { FaCoins, FaChartLine, FaRocket, FaUsers } from 'react-icons/fa';

const RewardsBenefitsCard = () => {
    const benefits = [
        {
            icon: <FaCoins className="text-yellow-400" />,
            text: "10 POL Free Airdrop",
            description: "Instant token rewards"
        },
        {
            icon: <FaChartLine className="text-green-400" />,
            text: "125% APY Staking",
            description: "High-yield earnings"
        },
        {
            icon: <FaRocket className="text-blue-400" />,
            text: "Zero Lock Period",
            description: "Flexible withdrawals"
        },
        {
            icon: <FaUsers className="text-purple-400" />,
            text: "Community Benefits",
            description: "Exclusive access & perks"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="relative rounded-lg bg-purple-900/30 p-4">
                <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                        <div 
                            key={index}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-900/30 transition-colors"
                        >
                            <div className="mt-1">{benefit.icon}</div>
                            <div>
                                <div className="text-white font-medium">{benefit.text}</div>
                                <div className="text-xs text-gray-400">{benefit.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RewardsBenefitsCard;