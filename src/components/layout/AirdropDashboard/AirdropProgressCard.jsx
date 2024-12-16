
import React from 'react';
import { FaChartLine, FaUser, FaCoins } from 'react-icons/fa';

const AirdropProgressCard = ({ totalParticipants, distributionProgress, tokensDistributed, TOTAL_AIRDROP_TOKENS, TOKEN_SYMBOL, MAX_PARTICIPANTS, TOKENS_PER_WALLET, remainingTokens }) => {
    return (
        <div className="card">
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
        </div>
    );
};

export default AirdropProgressCard;