import React, { useState, useEffect, useContext } from 'react';
import { FaUserCheck, FaClock, FaUsers, FaInfoCircle, FaGift, FaChartLine, FaLock, FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ButtonClaimAirdrop from '../../web3/ButtonClaimAirdrop';
import { ethers } from 'ethers';
import AirdropABI from '../../../Abi/Airdrop.json';
import { WalletContext } from '../../../context/WalletContext';
import AirdropClaimModal from '../../modals/AirdropClaimModal';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

            const stats = await contract.getAirdropStats();
            
            setAirdropInfo({
                startDate: null, // Estos datos ya no están disponibles
                endDate: null,   // en el contrato actual
                totalParticipants: Number(stats.claimedCount),
                airdropAmount: '10',
                isActive: stats.isAirdropActive
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

            const [eligibilityCheck, isActive] = await Promise.all([
                contract.checkUserEligibility(account),
                contract.isActive()
            ]);

            const [isEligible, hasClaimed, hasMinBalance, userBalance] = eligibilityCheck;

            console.log('Airdrop Status:', {
                isEligible,
                hasClaimed,
                hasMinBalance,
                userBalance: ethers.formatEther(userBalance),
                isActive
            });

            // Un usuario es elegible para reclamar si:
            // 1. Está registrado (isEligible)
            // 2. No ha reclamado aún (!hasClaimed)
            // 3. Tiene el balance mínimo (hasMinBalance)
            // 4. El airdrop está activo (isActive)
            const canClaim = isEligible && !hasClaimed && hasMinBalance && isActive;

            setUserEligibilityStatus({
                isEligible: canClaim,
                hasClaimed,
                isChecked: true,
                isActive,
                hasMinBalance
            });

            // Actualizar mensajes de error
            if (!hasMinBalance) {
                setErrorMessage(`Insufficient balance. Need 1 MATIC. Current: ${ethers.formatEther(userBalance)} MATIC`);
            } else if (!isEligible) {
                setErrorMessage('Please register for the airdrop first');
            } else if (hasClaimed) {
                setErrorMessage('You have already claimed this airdrop');
            } else if (!isActive) {
                setErrorMessage('Airdrop is not active at this moment');
            } else {
                setErrorMessage('');
            }

        } catch (error) {
            console.error('Eligibility Check Failed:', error);
            setErrorMessage('Error checking eligibility. Please try again.');
        }
    };

    const handleClaimClick = async () => {
        if (!userEligibilityStatus.isEligible || userEligibilityStatus.hasClaimed || !userEligibilityStatus.isActive) {
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmClaim = async () => {
        try {
            const signer = await provider.getSigner();
            const contractWithSigner = new ethers.Contract(
                import.meta.env.VITE_AIRDROP_ADDRESS,
                AirdropABI.abi,
                signer
            );

            setIsModalOpen(false);
            
            // Call the claimTokens function
            console.log('Initiating claim transaction...');
            const tx = await contractWithSigner.claimTokens();
            console.log('Claim transaction sent:', tx.hash);
            
            console.log('Waiting for confirmation...');
            const receipt = await tx.wait();
            console.log('Claim confirmed:', receipt);

            // Update eligibility status after successful claim
            await checkUserEligibility();
            
        } catch (error) {
            console.error('Claim failed:', error);
            let errorMessage = 'Failed to claim airdrop';
            
            if (error.message.includes('NotEligible')) {
                errorMessage = 'You are not eligible for this airdrop';
            } else if (error.message.includes('AlreadyClaimed')) {
                errorMessage = 'You have already claimed this airdrop';
            } else if (error.message.includes('AirdropInactive')) {
                errorMessage = 'Airdrop is not active at this moment';
            } else if (error.message.includes('InsufficientContractBalance')) {
                errorMessage = 'Contract has insufficient balance';
            } else if (error.message.includes('UNSUPPORTED_OPERATION')) {
                errorMessage = 'Please ensure your wallet is connected and unlocked';
            }
            
            setErrorMessage(errorMessage);
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
                    <FaGift className="text-green-200 text-xl" />
                    <h3 className="text-lg font-semibold text-purple-200">Platform Benefits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <FaChartLine className="text-green-400 mt-1" />
                        <div>
                            <h4 className="text-green-400 font-medium">Smart Staking</h4>
                            <p className="text-gray-300 text-sm">Earn up to 125% APY by staking your POL tokens</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <FaLock className="text-green-400 mt-1" />
                        <div>
                            <h4 className="text-green-400 font-medium">Early Access</h4>
                            <p className="text-gray-300 text-sm">Get priority access to new features and pools</p>
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
                        <h3 className="text-purple-200 font-semibold mb-2">Maximize Your POL Tokens</h3>
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
             {errorMessage && (
                <div className="bg-red-900/30 text-red-400 px-4 py-2 rounded-lg">
                    {errorMessage}
                </div>
            )}

            <button
                onClick={handleClaimClick}
                disabled={!userEligibilityStatus.isEligible || userEligibilityStatus.hasClaimed || !userEligibilityStatus.isActive}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    userEligibilityStatus.isEligible && !userEligibilityStatus.hasClaimed && userEligibilityStatus.isActive
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
            >
                {userEligibilityStatus.hasClaimed
                    ? 'Already Claimed'
                    : !userEligibilityStatus.isActive
                    ? 'Airdrop Not Active'
                    : userEligibilityStatus.isEligible
                    ? 'Claim Airdrop'
                    : 'Not Eligible'}
            </button>

            <AirdropClaimModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmClaim}
                airdropAmount={airdropInfo.airdropAmount}
            />

            {/* Post Claim Actions */}
            {renderPostClaimActions()}
        </div>
    );
};

export default AirdropPoolStatusCard;