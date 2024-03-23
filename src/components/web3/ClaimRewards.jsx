import { useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../context/WalletContext';
import ABI from "../../Abi/StakingContract.json";
import '../../Styles/ButtonDeposit.css';

// Utiliza la variable de entorno para la dirección del contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function ClaimRewards() {
  const { account } = useContext(WalletContext);
  const [claimedRewards, setClaimedRewards] = useState(0);

  useEffect(() => {
    if (account) {
      const fetchClaimedRewards = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);

          const filter = contract.filters.RewardClaimed(account);
          const logs = await provider.getLogs({
            fromBlock: 0,
            toBlock: "latest",
            address: CONTRACT_ADDRESS,
            topics: filter.topics,
          });

          const totalClaimed = logs.reduce((total, log) => {
            const data = contract.interface.parseLog(log).args;
            return total + parseFloat(ethers.utils.formatEther(data.amount));
          }, 0);

          setClaimedRewards(totalClaimed);
        } catch (error) {
          console.error("Error while fetching claimed rewards:", error);
        }
      };

      fetchClaimedRewards();
    }
  }, [account]);

  const handleOnClick = async () => {
    if (account) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);

        const tx = await contract.claimRewards();
        await tx.wait();

        // Update claimed rewards after successful claim
        fetchClaimedRewards();
      } catch (error) {
        console.log("Error while claiming rewards:", error);
      }
    }
  };

  return (
    <div className="has-text-centered">
      <button className="button boton is-primary" onClick={handleOnClick}>
        <strong>Claim Rewards </strong>
      </button>
      <div className='subtitle is-6'>Total claimed rewards: {claimedRewards}</div>
    </div>
  );
}

export default ClaimRewards;
