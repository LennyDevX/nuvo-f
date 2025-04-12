import React from 'react';
import { FaTelegram, FaDiscord, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SubmissionSuccess = ({ onClose }) => {
    return (
        <div className="text-center py-4">
            <motion.div 
                className="mb-6"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
            >
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <FaCheck className="w-8 h-8 text-green-500" />
                </div>
            </motion.div>
            
            <h2 className="text-xl font-medium text-white mb-2">Registration Complete!</h2>
            <p className="text-gray-300 mb-6">
                You've successfully registered for the airdrop. 
                Join our communities to stay updated on the distribution.
            </p>

            <div className="space-y-3 mb-6">
                <a
                    href="https://t.me/nuvoNFT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all duration-300"
                >
                    <FaTelegram />
                    <span>Join Telegram</span>
                </a>
                
                <a
                    href="https://discord.gg/2fCGejdd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all duration-300"
                >
                    <FaDiscord />
                    <span>Join Discord</span>
                </a>
            </div>

            <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300"
            >
                Close
            </button>
        </div>
    );
};

export default SubmissionSuccess;