
import React from 'react';
import { FaRocket, FaInfoCircle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const NextAirdropCard = ({ formatDate, airdropStartDate, airdropEndDate, onOpenSidebar }) => {
    return (
        <div className="card">
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg bg-purple-900/30 p-4">
                    <div className="space-y-3 border-b border-purple-500/20 pb-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Token:</span>
                            <div className="flex items-center gap-2">
                                <img src="/PolygonLogo.png" alt="POL" className="w-5 h-5" />
                                <span className="text-purple-400 font-medium">POL Token</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Amount per Wallet:</span>
                            <span className="text-purple-400 font-medium">10 POL</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Start Date:</span>
                            <span className="text-blue-400 font-medium">{formatDate(airdropStartDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">End Date:</span>
                            <span className="text-red-400 font-medium">{formatDate(airdropEndDate)}</span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <FaInfoCircle className="text-purple-400" />
                            How to Use Your POL Tokens
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                                <p className="text-gray-300">
                                    Stake your POL tokens to earn up to <span className="text-purple-400 font-medium">125% APY</span>
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                                <p className="text-gray-300">
                                    Minimum staking amount: <span className="text-purple-400 font-medium">5 POL</span>
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                                <p className="text-gray-300">
                                    Claim rewards every <span className="text-purple-400 font-medium">24 hours</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-500/20">
                        <div className="flex justify-between text-xs">
                            <div className="text-center">
                                <div className="text-blue-400">Registration</div>
                                <div className="text-gray-400 mt-1">Dec 14</div>
                            </div>
                            <div className="text-center">
                                <div className="text-purple-400">Distribution</div>
                                <div className="text-gray-400 mt-1">Dec 21</div>
                            </div>
                            <div className="text-center">
                                <div className="text-red-400">Deadline</div>
                                <div className="text-gray-400 mt-1">Dec 28</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -right-6 -bottom-6 opacity-5">
                        <FaRocket className="text-8xl text-purple-400" />
                    </div>
                </div>

                <button 
                    onClick={onOpenSidebar}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                    <span className="font-medium">Register for Airdrop</span>
                    <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-xs text-center px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <span className="text-purple-400">💡 Tip:</span>
                    <span className="text-gray-300"> Register early to ensure your allocation in the Smart Staking program</span>
                </div>
            </div>
        </div>
    );
};

export default NextAirdropCard;