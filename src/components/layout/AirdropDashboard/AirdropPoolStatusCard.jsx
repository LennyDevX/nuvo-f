import React, { useState, useEffect, useContext } from 'react';
import { FaCoins, FaUserCheck, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import ButtonClaimAirdrop from '../../web3/ButtonClaimAirdrop';
import { ethers } from 'ethers';
import AirdropABI from '../../../Abi/Airdrop.json';
import { WalletContext } from '../../context/WalletContext';

const AirdropPoolStatusCard = ({ treasuryBalance, treasuryError, walletHistory, account }) => {
    const { provider } = useContext(WalletContext);
    const [userEligibilityStatus, setUserEligibilityStatus] = useState({
        isEligible: false,
        hasClaimed: false,
        isChecked: false,
        isActive: false
    });

    useEffect(() => {
        if (account && provider) { // Removida la condición walletHistory.hasParticipated
            checkUserEligibility();
        }
    }, [account, provider]);

    const checkUserEligibility = async () => {
        try {
            if (!provider) {
                console.log('Provider not available');
                return;
            }

            const contract = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                provider
            );

            const [eligibility, airdropStats] = await Promise.all([
                contract.checkUserEligibility(account),
                contract.getAirdropStats()
            ]);

            console.log('Debug Eligibility:', {
                eligibility,
                airdropStats,
                contractAddress: import.meta.env.VITE_AIRDROP_ADDRESS
            });

            setUserEligibilityStatus({
                isEligible: eligibility.isEligible_,
                hasClaimed: eligibility.hasClaimed_,
                isChecked: true,
                isActive: airdropStats.isAirdropActive
            });
        } catch (error) {
            console.error('Detailed error checking eligibility:', error);
            setUserEligibilityStatus(prev => ({
                ...prev,
                isChecked: true
            }));
        }
    };

    return (
        <div className="space-y-4">
            {/* Treasury Status */}
            <div className="bg-purple-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FaCoins className="text-yellow-400" />
                        <span className="text-gray-300">Treasury Balance</span>
                    </div>
                    <FaChartLine className="text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                    {treasuryError 
                        ? "Error loading" 
                        : treasuryBalance 
                            ? `${parseFloat(treasuryBalance).toFixed(4)} POL` 
                            : "Loading..."}
                </div>
                {treasuryError && (
                    <div className="text-sm text-red-400 mt-1">
                        Failed to load treasury balance
                    </div>
                )}
            </div>

            {/* User Allocation */}
            <div className="bg-purple-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FaUserCheck className="text-green-400" />
                        <span className="text-gray-300">Your Allocation</span>
                    </div>
                    {walletHistory.hasParticipated && !userEligibilityStatus.hasClaimed && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Eligible
                        </span>
                    )}
                    {userEligibilityStatus.hasClaimed && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            Claimed
                        </span>
                    )}
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                    {userEligibilityStatus.hasClaimed ? "10 POL (Claimed)" : 
                     account ? "10 POL" : "0 POL"}
                </div>
                <div className="text-sm text-purple-400">
                    {!account ? "Connect your wallet" :
                     !userEligibilityStatus.isActive ? "Airdrop not active yet" :
                     userEligibilityStatus.hasClaimed ? "You have claimed your tokens" :
                     "Ready to claim your tokens"}
                </div>
            </div>

            {/* Claim Button */}
            <ButtonClaimAirdrop
                account={account}
                isEligible={!userEligibilityStatus.hasClaimed && userEligibilityStatus.isEligible && userEligibilityStatus.isActive}
            />

            {/* Info Section */}
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-purple-400 mt-1" />
                    <div className="text-sm">
                        <p className="text-gray-300 mb-1">
                            Tokens can be used immediately in our Smart Staking program
                        </p>
                        <p className="text-purple-400">
                            Earn up to 125% APY
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirdropPoolStatusCard;
