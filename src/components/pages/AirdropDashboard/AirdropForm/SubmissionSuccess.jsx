import React from 'react';
import { FaTelegram, FaDiscord } from 'react-icons/fa';

const SubmissionSuccess = ({ onClose }) => {
    return (
        <div className="text-center p-6">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <h2 className="text-2xl font-medium text-green-500 mb-4">Registration Successful!</h2>
            <p className="text-gray-300 mb-6">
                Thank you for registering for the airdrop. Join our communities to stay updated!
            </p>

            <div className="space-y-4 mb-6">
                <a
                    href="https://t.me/nuvoNFT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300"
                >
                    <FaTelegram className="text-xl" />
                    <span>Join our Telegram</span>
                </a>
                
                <a
                    href="https://discord.gg/2fCGejdd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg transition-all duration-300"
                >
                    <FaDiscord className="text-xl" />
                    <span>Join our Discord</span>
                </a>
            </div>

            <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300"
            >
                Close Window
            </button>
        </div>
    );
};

export default SubmissionSuccess;