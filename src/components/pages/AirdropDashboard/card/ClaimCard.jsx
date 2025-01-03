import React, { useState, useEffect, useContext } from 'react';
import { 
    FaUserCheck, 
    FaInfoCircle, 
    FaGift, 
    FaChartLine, 
    FaCheckCircle,
    FaTrophy,
    FaRocket,
    FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { WalletContext } from '../../../../context/WalletContext';
import { ethers } from 'ethers';
import AirdropABI from '../../../../Abi/Airdrop.json';
import AirdropClaimModal from '../../../modals/AirdropClaimModal';

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

            // Get both eligibility and airdrop status
            const [eligibilityCheck, airdropStats] = await Promise.all([
                contract.checkUserEligibility(account),
                contract.getAirdropStats()
            ]);

            const [isRegistered, hasClaimed, hasMinBalance, userBalance] = eligibilityCheck;
            const [, , , isActive, isFunded] = airdropStats;

            console.log('Airdrop Status:', {
                isRegistered,
                hasClaimed,
                hasMinBalance,
                userBalance: ethers.formatEther(userBalance),
                isActive,
                isFunded
            });

            // Usuario puede reclamar si:
            // 1. Está registrado (isRegistered)
            // 2. No ha reclamado aún (!hasClaimed)
            // 3. Tiene el balance mínimo (hasMinBalance)
            // 4. El airdrop está activo (isActive)
            // 5. El contrato tiene fondos suficientes (isFunded)
            const canClaim = isRegistered && !hasClaimed && hasMinBalance && isActive && isFunded;

            setUserEligibilityStatus({
                isEligible: canClaim,
                hasClaimed,
                isChecked: true,
                isActive,
                hasMinBalance,
                isRegistered
            });

            // Update error messages based on conditions
            if (!hasMinBalance) {
                setErrorMessage(`Insufficient balance. Need 1 MATIC. Current: ${ethers.formatEther(userBalance)} MATIC`);
            } else if (!isRegistered) {
                setErrorMessage('Please register for the airdrop first');
            } else if (hasClaimed) {
                setErrorMessage('You have already claimed this airdrop');
            } else if (!isActive) {
                setErrorMessage('Airdrop is not active at this moment');
            } else if (!isFunded) {
                setErrorMessage('Airdrop contract has insufficient funds');
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

    const PhaseRequirements = () => (
        <div className="bg-black/20 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-gray-200 mb-2">Claim Requirements</div>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-gray-300">Registered wallet</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-gray-300">Minimum 1 MATIC balance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-gray-300">Within claim period</span>
                </div>
            </div>
        </div>
    );

    const ClaimStatus = () => (
        <div className="bg-black/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300">Claim Status:</span>
                <div className={`px-3 py-1 rounded-full ${
                    userEligibilityStatus.hasClaimed 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {userEligibilityStatus.hasClaimed ? 'Claimed' : 'Available'}
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reward Amount:</span>
                <span className="text-purple-400 font-medium">5 POL</span>
            </div>
        </div>
    );

    const RewardUtility = () => (
        <div className="bg-black/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <FaTrophy className="text-purple-400" />
                <h3 className="text-gray-200 font-medium">Reward Utility</h3>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                    <FaChartLine className="text-green-400 mt-1" />
                    <span className="text-gray-300">Stake for up to 125% APY</span>
                </div>
                <div className="flex items-start gap-2">
                    <FaRocket className="text-blue-400 mt-1" />
                    <span className="text-gray-300">Access exclusive features</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Claim Airdrop</h3>
                <div className="flex items-center gap-2">
                    <FaGift className="text-purple-400" />
                    <span className="text-sm text-gray-400">Rewards</span>
                </div>
            </div>

            <PhaseRequirements />
            <ClaimStatus />
            <RewardUtility />

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

            {renderPostClaimActions()}
        </div>
    );
};

export default AirdropPoolStatusCard;