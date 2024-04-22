import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import { ThemeContext } from '../context/ThemeContext';
import "../../Styles/home.css";

// Importa la variable de entorno correctamente
const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;

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
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
        const signerAddress = await signer.getAddress();

        // Obtener todos los depósitos realizados por el usuario
        const allDeposits = await contract.getAllDeposits(signerAddress);
        const totalDeposited = allDeposits.reduce((acc, deposit) => acc + parseFloat(ethers.utils.formatEther(deposit)), 0);
        setTotalDeposited(totalDeposited);

        // Calcular las recompensas basadas en todos los depósitos
        const rewards = await contract.calculateRewards(signerAddress);
        const realRewards = ethers.utils.formatEther(rewards);
        setRewardAmount(realRewards);

        // Calcular el total del depósito después de aplicar las tarifas
        const fees = totalDeposited * 0.05;
        const netDeposit = totalDeposited - fees;
        setNetBalance(netDeposit);

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
        <strong className="subtitle">Power 🗡️</strong> {totalDeposited} Matic
        <strong className="subtitle">Shield 🛡️</strong> ( Fee ): {netBalance} Matic
        <p className="subtitle">Bag {rewardAmount} Matic</p>
        <br />
      </div>
    </div>
  );
}

export default App;
