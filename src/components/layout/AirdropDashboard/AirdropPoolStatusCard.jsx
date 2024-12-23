import React, { useState, useEffect, useContext } from 'react';
import { FaUserCheck, FaClock, FaUsers, FaInfoCircle, FaGift, FaChartLine, FaLock, FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ButtonClaimAirdrop from '../../web3/ButtonClaimAirdrop';
import { ethers } from 'ethers';
import AirdropABI from '../../../Abi/Airdrop.json';
import { WalletContext } from '../../../context/WalletContext';

const AirdropPoolStatusCard = ({ account }) => {
    const { provider } = useContext(WalletContext);
    const [airdropInfo, setAirdropInfo] = useState({
        startDate: null,
        endDate: null,
        totalParticipants: 0,
        airdropAmount: '10'
    });
    const [userEligibilityStatus, setUserEligibilityStatus] = useState({
        isEligible: false,
        hasClaimed: false,
        isChecked: false,
        isActive: false
    });

    useEffect(() => {
        if (account && provider) {
            checkUserEligibility();
            fetchAirdropInfo();
        }
    }, [account, provider]);

    const fetchAirdropInfo = async () => {
        try {
            const contract = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                provider
            );

            const [stats, dates] = await Promise.all([
                contract.getAirdropStats(),
                contract.getAirdropDates()
            ]);

            setAirdropInfo({
                startDate: new Date(Number(dates.startDate) * 1000),
                endDate: new Date(Number(dates.endDate) * 1000),
                totalParticipants: Number(stats.totalClaims),
                airdropAmount: '10'
            });
        } catch (error) {
            console.error('Error fetching airdrop info:', error);
        }
    };

    const checkUserEligibility = async () => {
        try {
            if (!provider || !account) return;

            const contract = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                provider
            );

            const eligibility = await contract.checkUserEligibility(account);
            const isActive = await contract.isAirdropActive();

            console.log('User Eligibility Status:', {
                contract: import.meta.env.VITE_AIRDROP_ADDRESS,
                account,
                isEligible: eligibility.isEligible_,
                hasClaimed: eligibility.hasClaimed_,
                isActive
            });

            setUserEligibilityStatus({
                isEligible: eligibility.isEligible_,
                hasClaimed: eligibility.hasClaimed_,
                isChecked: true,
                isActive: isActive
            });
        } catch (error) {
            console.error('Eligibility Check Failed:', error);
            // No cambiar el estado en caso de error
        }
    };

    const renderPostClaimActions = () => {
        if (userEligibilityStatus.hasClaimed) {
            return (
                <div className="bg-green-900/30 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FaChartLine className="text-green-400" />
                        <span className="text-green-300">Tokens Claimed Successfully!</span>
                    </div>
                    <p className="text-gray-300 mb-3">Start earning rewards with your POL tokens:</p>
                    <Link 
                        to="/staking"
                        className="block w-full text-center bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Go to Staking Dashboard
                    </Link>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Add a status badge at the top */}
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-center">
                <span className="font-medium">🎉 Airdrop is now LIVE!</span>
            </div>

            {/* New Platform Benefits Section */}
            <div className="bg-purple-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <FaGift className="text-purple-400 text-xl" />
                    <h3 className="text-lg font-semibold text-purple-300">Platform Benefits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <FaChartLine className="text-green-400 mt-1" />
                        <div>
                            <h4 className="text-green-300 font-medium">Smart Staking</h4>
                            <p className="text-gray-400 text-sm">Earn up to 125% APY by staking your POL tokens</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <FaLock className="text-purple-400 mt-1" />
                        <div>
                            <h4 className="text-purple-300 font-medium">Early Access</h4>
                            <p className="text-gray-400 text-sm">Get priority access to new features and pools</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Allocation - existing code */}
            <div className="bg-purple-900/30 rounded-lg p-4">
                {/* ...existing user allocation code... */}
            </div>

           

            {/* New Enhanced Info Section */}
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-purple-400 mt-1" />
                    <div className="text-sm">
                        <h3 className="text-purple-400 font-semibold mb-2">Maximize Your POL Tokens</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Stake POL tokens for up to 125% APY
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Participate in governance voting
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                Access exclusive platform features
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

             {/* Claim Button - existing code */}
             <ButtonClaimAirdrop
                account={account}
                isEligible={!userEligibilityStatus.hasClaimed && userEligibilityStatus.isEligible && userEligibilityStatus.isActive}
            />

            {/* Post Claim Actions */}
            {renderPostClaimActions()}
        </div>
    );
};

export default AirdropPoolStatusCard;