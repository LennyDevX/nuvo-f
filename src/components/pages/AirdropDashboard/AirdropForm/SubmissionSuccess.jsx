import React from 'react';
import { FaTelegram, FaDiscord, FaCheck, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SubmissionSuccess = ({ onClose, userRegistration, showClaimButton = false }) => {
    // Check if claim period has started (August 1, 2025)
    const now = new Date();
    const claimStartDate = new Date('2025-08-01T00:00:00');
    const canClaim = now >= claimStartDate;
    return (
        <div className="text-center py-8">
            <motion.div 
                className="mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
            >
                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    >
                        <FaCheck className="w-10 h-10 text-green-500" />
                    </motion.div>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-bold text-white mb-3">Registration Complete! 🎉</h2>
                <p className="text-gray-300 mb-4 max-w-md mx-auto leading-relaxed">
                    Congratulations! You've successfully registered for the airdrop. 
                </p>
                
                {/* Registration Details */}
                {userRegistration && (
                    <motion.div 
                        className="bg-black/30 rounded-lg p-4 mb-6 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-white font-medium mb-2">Registration Details</h3>
                        <div className="text-sm text-gray-300 space-y-1">
                            <p><span className="text-purple-300">Name:</span> {userRegistration.name}</p>
                            <p><span className="text-purple-300">Email:</span> {userRegistration.email}</p>
                            <p><span className="text-purple-300">Registered:</span> {new Date(userRegistration.submittedAt).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                )}

                {/* Claim Information */}
                <motion.div 
                    className={`p-4 rounded-lg mb-6 ${canClaim ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {canClaim ? (
                            <>
                                <FaCheck className="text-green-400" />
                                <span className="text-green-400 font-medium">Ready to Claim!</span>
                            </>
                        ) : (
                            <>
                                <FaClock className="text-yellow-400" />
                                <span className="text-yellow-400 font-medium">Claim Period Starts August 1, 2025</span>
                            </>
                        )}
                    </div>
                    <p className="text-gray-300 text-sm">
                        {canClaim 
                            ? "You can now claim your 10 POL tokens! The claim button will appear automatically."
                            : "Your 10 POL tokens will be available for claim starting August 1, 2025. Come back then to claim your tokens!"
                        }
                    </p>
                </motion.div>
                
                <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                    Join our communities to stay updated on the distribution and platform updates.
                </p>
            </motion.div>

            <motion.div 
                className="space-y-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <motion.a
                    href="https://t.me/nuvoNFT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-3 px-6 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaTelegram className="text-xl" />
                    <span className="font-medium">Join Telegram Community</span>
                </motion.a>
                
                <motion.a
                    href="https://discord.gg/2fCGejdd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-3 px-6 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all duration-300 border border-indigo-500/20 hover:border-indigo-500/40"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaDiscord className="text-xl" />
                    <span className="font-medium">Join Discord Server</span>
                </motion.a>
            </motion.div>

            <motion.button
                onClick={onClose}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-300 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                Close & Continue
            </motion.button>
        </div>
    );
};

export default SubmissionSuccess;