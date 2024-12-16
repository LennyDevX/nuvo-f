
import React from 'react';
import { FaUser, FaCopy, FaShieldAlt, FaExclamationCircle, FaHistory, FaInfoCircle, FaArrowRight } from 'react-icons/fa';

const WalletStatusCard = ({ account, formatAddress, walletHistory, onOpenSidebar }) => {
    return (
        <div className="card">
            <div className="space-y-4">
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

                <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                    <span className="text-gray-400">Registration:</span>
                    <div className="flex items-center gap-2">
                        <FaHistory className="text-purple-400" />
                        <span className={`${walletHistory.hasParticipated ? 'text-green-400' : 'text-gray-400'}`}>
                            {walletHistory.hasParticipated ? 'Registered' : 'Not Registered'}
                        </span>
                    </div>
                </div>

                {walletHistory.hasParticipated && (
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Claim Status:</span>
                        <span className={`${walletHistory.claimStatus === 'claimed' ? 'text-green-400' : 'text-yellow-500'}`}>
                            {walletHistory.claimStatus === 'claimed' ? 'Claimed' : 'Pending'}
                        </span>
                    </div>
                )}

                {walletHistory.registrationDate && (
                    <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                        <span className="text-gray-400">Registered On:</span>
                        <span className="text-gray-200">
                            {walletHistory.registrationDate.toLocaleDateString()}
                        </span>
                    </div>
                )}

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

                
            </div>
        </div>
    );
};

export default WalletStatusCard;