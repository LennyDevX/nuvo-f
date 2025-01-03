import React from 'react';
import { FaChartLine, FaUsers, FaCoins, FaGift, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AirdropProgressCard = ({ 
    totalParticipants, 
    distributionProgress, 
    tokensDistributed, 
    TOTAL_AIRDROP_TOKENS, 
    TOKEN_SYMBOL, 
    MAX_PARTICIPANTS, 
    TOKENS_PER_WALLET, 
    remainingTokens 
}) => {

    const InfoItem = ({ icon: Icon, label, value, subtext, className = "" }) => (
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
            <div className="flex items-center gap-2">
                <Icon className="text-purple-400" />
                <span className="text-gray-300">{label}</span>
            </div>
            <div className="text-right">
                <div className={`text-gray-200 font-medium ${className}`}>{value}</div>
                {subtext && <div className="text-xs text-gray-400">{subtext}</div>}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Airdrop Progress</h3>
                <div className="flex items-center gap-2">
                    <FaChartLine className="text-purple-400" />
                    <span className="text-sm text-gray-400">Live Status</span>
                </div>
            </div>

            {/* Distribution Progress Bar */}
            <div className="bg-black/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Distribution Progress</span>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-medium">{distributionProgress.toFixed(1)}%</span>
                        {distributionProgress >= 90 && (
                            <FaExclamationCircle className="text-yellow-500" title="Almost Full!" />
                        )}
                    </div>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${distributionProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div className="mt-2 flex justify-between text-xs">
                    <span className="text-gray-400">
                        {tokensDistributed} {TOKEN_SYMBOL} distributed
                    </span>
                    <span className="text-gray-400">
                        Target: {TOTAL_AIRDROP_TOKENS} {TOKEN_SYMBOL}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <InfoItem 
                    icon={FaUsers}
                    label="Participants"
                    value={`${totalParticipants} / ${MAX_PARTICIPANTS}`}
                    subtext="Registered wallets"
                />

                <InfoItem 
                    icon={FaGift}
                    label="Reward Per Wallet"
                    value={`${TOKENS_PER_WALLET} ${TOKEN_SYMBOL}`}
                    subtext="One-time registration"
                />

                <InfoItem 
                    icon={FaCoins}
                    label="Remaining Tokens"
                    value={`${remainingTokens} ${TOKEN_SYMBOL}`}
                    subtext={`${((remainingTokens / TOTAL_AIRDROP_TOKENS) * 100).toFixed(1)}% available`}
                    className={remainingTokens < TOTAL_AIRDROP_TOKENS * 0.1 ? 'text-yellow-400' : ''}
                />

                
            </div>

            {/* Additional Info Banner */}
            {distributionProgress >= 90 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 text-center">
                    <span className="text-yellow-500 text-sm">
                        ⚠️ Airdrop is almost full! Register soon to secure your tokens.
                    </span>
                </div>
            ) : (
                <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-3 text-center">
                    <span className="text-purple-400 text-sm">
                        ℹ️ Registration is open and tokens are still available
                    </span>
                </div>
            )}
        </div>
    );
};

export default AirdropProgressCard;