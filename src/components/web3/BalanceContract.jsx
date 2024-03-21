import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import { ThemeContext } from '../context/ThemeContext';
import "../../Styles/home.css";

const contractAddress = "0x5Ce75E5C8575ff802f65633eA2613b5c2ee27904";

function App() {
  const [depositAmount, setDepositAmount] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ABI.abi, signer);
        const signerAddress = await signer.getAddress();

        const deposited = await contract.getTotalDeposited(signerAddress);
        const realDeposited = ethers.utils.formatEther(deposited);
        setDepositAmount(realDeposited);

        const fees = realDeposited * 0.04;
        const netDeposit = realDeposited - fees;
        setNetBalance(netDeposit);
        
        const rewards = await contract.calculateRewards(signerAddress);
        const realRewards = ethers.utils.formatEther(rewards);
        setRewardAmount(realRewards);

        
      } catch (error) {
        console.error("Error: ", error);
      }
    }
    fetchData();
  }, []);

  

  return (
    <div>
      <br />
      <div>
        <strong className="subtitle">Power 🗡️</strong> {depositAmount} Matic
        <strong className="subtitle">Shield 🛡️</strong> ( Fee ): {netBalance} Matic
        <p className=" subtitle"></p>Bag {rewardAmount} Matic
        <br />
      </div>
    </div>
  );
}

export default App;