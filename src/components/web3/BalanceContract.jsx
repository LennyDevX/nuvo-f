import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import { ThemeContext } from '../context/ThemeContext';

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

        const totalBalance = netDeposit + parseFloat(realRewards);
        setTotalDeposited(totalBalance);
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
        <strong style={isDarkMode ? { color: '#00ff00'} : { color: 'darkgreen' }}>Deposit:</strong> {depositAmount} Matic
        <br />
        <strong style={isDarkMode ? { color: '#00ff00'} : { color: 'darkgreen' }}>Net Deposit</strong> (After Fee Deduction): {netBalance} Matic
        <br />
        <strong style={isDarkMode ? { color: '#00ff00'} : { color: 'darkgreen' }}>Rewards:</strong> {rewardAmount} Matic
        <br />
        <strong style={isDarkMode ? { color: '#00ff00'} : { color: 'darkgreen' }}>Total Deposit:</strong> {totalDeposited} Matic 
      </div>
    </div>
  );
}

export default App;