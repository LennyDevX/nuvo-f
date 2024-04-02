import React, { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import ABI from '../../Abi/StakingContract.json';
import "../../Styles/Notification.css"; // Importa los estilos de notificación

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const ClaimRewardsComponent = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { account } = useContext(WalletContext);
  const [claimingRewards, setClaimingRewards] = useState(false);
  const [error, setError] = useState(null);
  const [rewardsClaimed, setRewardsClaimed] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (account) {
      const fetchRewardsClaimed = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
  
          const claimed = await contract.totalRewardsClaimed(account);
          setRewardsClaimed(claimed);
        } catch (error) {
          console.error("Error fetching rewards claimed:", error);
        }
      };
  
      fetchRewardsClaimed();
    }
  }, [account]);

  const handleClaimRewards = async () => {
    if (account) {
      try {
        setClaimingRewards(true);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);

        const tx = await contract.claimRewards();
        await tx.wait();

        const claimed = await contract.totalRewardsClaimed(account);
        setRewardsClaimed(claimed);

        setSuccessMessage("Rewards claimed successfully!");
      } catch (error) {
        console.error("Error while claiming rewards:", error);
        setError("Error claiming rewards. Please try again.");

        setTimeout(() => {
          setError(null);
        }, 3000);
      } finally {
        setClaimingRewards(false);
      }
    }
  };

  return (
    <div className={" "}>
      <div className="content  hero">
        <button
          onClick={handleClaimRewards}
          className={`button  ${isDarkMode ? 'has-text-warning' : 'has-text-primary'}`}
          disabled={claimingRewards}
        >
          {claimingRewards ? 'Claiming Rewards...' : 'Claim Rewards'}
        </button>
        {error && <p className={`notification is-danger notification-visible ${isDarkMode ? 'dark-mode-error' : 'light-mode-error'}`}>{error}</p>}
        {successMessage && <p className={`notification is-success notification-visible ${isDarkMode ? 'dark-mode-success' : 'light-mode-success'}`}>{successMessage}</p>}
        <strong className=" ">Total rewards claimed: {parseFloat(ethers.utils.formatEther(rewardsClaimed)).toFixed(10)} Matic</strong>
      </div>
    </div>
  );
};

export default ClaimRewardsComponent;
