import React from 'react';
import { 
    FaCopy, 
    FaShieldAlt, 
    FaExclamationCircle, 
    FaHistory, 
    FaInfoCircle,
    FaGift,
    FaClock,
    FaCheckCircle,
    FaHourglassHalf
} from 'react-icons/fa';

const WalletStatusCard = ({ account, formatAddress, walletHistory, onOpenSidebar }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'claimed': return 'text-green-400';
            case 'pending': return 'text-yellow-500';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getAirdropTypeLabel = (type) => {
        const types = {
            tokens: '🪙 Token Airdrop',
            nfts: '🖼️ NFT Airdrop',
            items: '📦 Items Airdrop',
            art: '🎨 Art Airdrop'
        };
        return types[type] || 'Unknown Type';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Wallet Profile</h3>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-400">
                        {account ? 'Connected' : 'Not Connected'}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {/* Address Section */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                    <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-purple-400" />
                        <span className="text-gray-300">Address</span>
                    </div>
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

                {/* Registration Status */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                    <div className="flex items-center gap-2">
                        <FaHistory className="text-purple-400" />
                        <span className="text-gray-300">Registration</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {walletHistory.hasParticipated ? (
                            <div className="flex items-center gap-1">
                                <FaCheckCircle className="text-green-400" />
                                <span className="text-green-400">Registered</span>
                            </div>
                        ) : (
                            <button
                                onClick={onOpenSidebar}
                                className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                            >
                                Register Now →
                            </button>
                        )}
                    </div>
                </div>

                {/* Airdrop Type if registered */}
                {walletHistory.hasParticipated && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <div className="flex items-center gap-2">
                            <FaGift className="text-purple-400" />
                            <span className="text-gray-300">Airdrop Type</span>
                        </div>
                        <span className="text-gray-200">
                            {getAirdropTypeLabel(walletHistory.registrationType)}
                        </span>
                    </div>
                )}

                {/* Registration Date if registered */}
                {walletHistory.registrationDate && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <div className="flex items-center gap-2">
                            <FaClock className="text-purple-400" />
                            <span className="text-gray-300">Registered On</span>
                        </div>
                        <span className="text-gray-200">
                            {walletHistory.registrationDate.toLocaleDateString()}
                        </span>
                    </div>
                )}

                {/* Claim Status if registered */}
                {walletHistory.hasParticipated && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <div className="flex items-center gap-2">
                            <FaHourglassHalf className="text-purple-400" />
                            <span className="text-gray-300">Claim Status</span>
                        </div>
                        <span className={getStatusColor(walletHistory.claimStatus)}>
                            {walletHistory.claimStatus.charAt(0).toUpperCase() + walletHistory.claimStatus.slice(1)}
                        </span>
                    </div>
                )}

                {/* Eligibility Status */}
                <div className="relative group">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <div className="flex items-center gap-2">
                            <FaInfoCircle className="text-purple-400" />
                            <span className="text-gray-300">Eligibility</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={walletHistory.isEligible ? 'text-green-400' : 'text-red-400'}>
                                {walletHistory.isEligible ? 'Eligible' : 'Not Eligible'}
                            </span>
                            <FaInfoCircle className="text-gray-400 cursor-help" />
                        </div>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 invisible group-hover:visible bg-black/90 text-white text-xs p-2 rounded whitespace-nowrap z-10">
                        {walletHistory.eligibilityReason || 'Connect wallet to check eligibility'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletStatusCard;