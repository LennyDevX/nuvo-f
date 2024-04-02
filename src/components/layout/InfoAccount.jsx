import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import ButtonDeposit from "../web3/ButtonDeposit";
import ButtonWithdraw from "../web3/ButtonWithdraw";
import ClaimRewards from "../web3/ClaimRewards";
import PolygonLogo from "/PolygonLogo.png"; // Importa la imagen
import "../../Styles/home.css";

// Utiliza la variable de entorno para la dirección del contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function InfoAccount() {
  const { isDarkMode } = useContext(ThemeContext);
  const { account, network, balance } = useContext(WalletContext);

  const [isConnected, setIsConnected] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsConnected(account && network && balance !== null);
  }, [account, network, balance]);

  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);

  const fetchData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI.abi,
        signer
      );

      const signerAddress = await signer.getAddress();
      const deposit = await contract.getTotalDeposit(signerAddress);
      const realDeposit = ethers.utils.formatEther(deposit);
      setDepositAmount(realDeposit);

      const rewards = await contract.calculateRewards(signerAddress);
      const realRewards = ethers.utils.formatEther(rewards);
      setRewardAmount(realRewards);
    } catch (error) {
      console.error("Error: ", error);
      setError("Error fetching account information. Please try again later.");
    }
  };

  return (
    <div className="  fade">
      <section className={isDarkMode ? "  hero-body fadedark-mode" : "hero-body"}>
        <div className={` fade hero container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="box box-account main-container">
            <h1 className="title is-3 is-centered has-text-centered">Staking</h1>
            <div className={`flex ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
              {isConnected ? (
                <>
                  <div className={`fade balance-display ${isDarkMode ? 'balance-dark' : 'balance-light'}`}>
                    <p className="subtitle">
                      <strong>Power:</strong> {parseFloat(depositAmount).toFixed(6)} <img src={PolygonLogo} alt="Polygon Logo" className="icon" />
                    </p>
                    <p className="subtitle">
                      <strong>Bag:</strong>  {balance} <img src={PolygonLogo} alt="Polygon Logo" className="icon" />
                    </p>
                    <p className="subtitle">
                      <strong>Rewards:</strong>  {rewardAmount} <img src={PolygonLogo} alt="Polygon Logo" className="icon" />
                    </p>
                  </div>
                  <div className="m-2">
                    <ButtonDeposit className=" "/>
                  </div>

                  <div className="m-2">
                    <ClaimRewards className=" "/>
                  </div>
                  

                  <div className="m-2">
                    <ButtonWithdraw className=" "/>
                  </div>

                  <p className={`subtitle account-info ${isDarkMode ? 'account-info-dark' : ''}`}>
                    <strong>Blockchain:</strong> {network}
                  </p>
                </>
              ) : (
                <p className='subtitle is-5 is-centered'>Connect to your wallet to view information.</p>
              )}
              {error && (
                <div className="notification is-danger">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InfoAccount;
