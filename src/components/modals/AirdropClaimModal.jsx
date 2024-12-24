import React from 'react';
import { FaGift, FaInfoCircle } from 'react-icons/fa';

const AirdropClaimModal = ({ isOpen, onClose, onConfirm, airdropAmount, airdropType = 'MATIC' }) => {
    if (!isOpen) return null;

    const getTokenTypeText = () => {
        switch (airdropType) {
            case 0: return 'MATIC';
            case 1: return 'POL tokens';
            case 2: return 'NFT';
            default: return 'tokens';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <FaGift className="text-purple-500 text-4xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Claim Your Airdrop</h2>
                    <p className="text-gray-300">
                        You're eligible to claim {airdropAmount} {getTokenTypeText()}
                    </p>
                </div>

                <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-purple-400 mt-1" />
                        <div className="text-sm text-gray-300">
                            <p>By claiming your tokens, you agree to:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Hold the tokens for platform participation</li>
                                <li>Follow the platform's terms of service</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                        Confirm Claim
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AirdropClaimModal;
