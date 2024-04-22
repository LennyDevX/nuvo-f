import React, { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import ABI from '../../Abi/StakingContract.json';
import "../../Styles/Notification.css"; // Importa los estilos de notificación

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;

const ClaimRewardsComponent = ({ onClaimRewards }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { account } = useContext(WalletContext);
  const [claimingRewards, setClaimingRewards] = useState(false);
  const [error, setError] = useState(null);
  const [rewardsClaimed, setRewardsClaimed] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rewardsBalance, setRewardsBalance] = useState(0);
  const [lastClaimTime, setLastClaimTime] = useState(0); // Agregar estado para el último tiempo de reclamo

  useEffect(() => {
    if (account) {
      const fetchRewardBalance = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);

          const rewardsBalance = await contract.calculateRewards(account);
          setRewardsBalance(rewardsBalance);
        } catch (error) {
          console.error("Error fetching rewards balance:", error);
        }
      };

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

      const fetchLastClaimTime = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);

          const lastTime = await contract.getLastClaimTime(account);
          setLastClaimTime(lastTime.toNumber()); // Convertir a número
        } catch (error) {
          console.error("Error fetching last claim time:", error);
        }
      };

      fetchRewardBalance();
      fetchRewardsClaimed();
      fetchLastClaimTime();
    }
  }, [account]);

  const handleClaimRewards = async () => {
    const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos

    // Verificar si ha pasado al menos una hora desde el último reclamo
    if (now - lastClaimTime >= 3600) {
      if (account && rewardsBalance.gt(0)) {
          try {
              setClaimingRewards(true);

              const provider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = provider.getSigner();
              const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);

              const tx = await contract.claimRewards();
              await tx.wait();

              // Actualiza el saldo de recompensas reclamadas del usuario
              const claimedRewards = await contract.totalRewardsClaimed(account);
              setRewardsClaimed(claimedRewards);
              setLastClaimTime(now); // Actualizar el último tiempo de reclamo

              setSuccessMessage("Rewards claimed successfully!");
          } catch (error) {
              console.error("Error while claiming rewards:", error);
              setError("Error claiming rewards. Please try again.");
          } finally {
              setClaimingRewards(false);
          }
      } else {
          setError("You don't have any rewards to claim.");
      }
    } else {
      setError("You can only claim rewards once every hour.");
    }

    // Limpiar errores después de 3 segundos
    setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
    }, 3000);
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
