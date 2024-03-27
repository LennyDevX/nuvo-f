import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import ButtonDeposit from "../web3/ButtonDeposit";
import ButtonWithdraw from "../web3/ButtonWithdraw";
import ClaimRewards from "../web3/ClaimRewards";
import "../../Styles/home.css";

// Utiliza la variable de entorno para la dirección del contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function InfoAccount() {
  const { isDarkMode } = useContext(ThemeContext);
  const { account, network, balance } = useContext(WalletContext);

  const [isConnected, setIsConnected] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [lastClaimTime, setLastClaimTime] = useState(0); // Agrega lastClaimTime
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  useEffect(() => {
    setIsConnected(account && network && balance !== null);
  }, [account, network, balance]);

  useEffect(() => {
    if (isConnected) {
      async function fetchData() {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS, // Utiliza la variable de entorno para la dirección del contrato
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

          // Obtener el último tiempo de reclamo del contrato
          const contractLastClaimTime = await contract.getLastClaimTime(signerAddress);
          setLastClaimTime(contractLastClaimTime);
        } catch (error) {
          console.error("Error: ", error);
        }
      }
      fetchData();
    }
  }, [isConnected]);

  // Duración del intervalo de retiro (7 días en segundos)
  const withdrawalInterval = 7 * 24 * 60 * 60;

  return (
    <div>
      <section className={isDarkMode ? "hero-body fadedark-mode" : "hero-body"}>
        <div className={`fade hero container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="main-container">
            <h1 className="title is-3 is-centered has-text-centered">Staking</h1>
            <div className={`flex ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
              {isConnected ? (
                <>
                  <div className={`fade balance-display ${isDarkMode ? 'balance-dark' : 'balance-light'}`}>
                    <p className="subtitle">
                      <strong>Power 🗡️:</strong> {depositAmount} Matic
                    </p>
                    <p className="subtitle">
                      <strong>Bag 💰:</strong> {balance} Matic
                    </p>
                    <p className="subtitle">
                      <strong>Rewards 🎁:</strong> {rewardAmount} Matic
                    </p>
                  </div>

                  <div className="m-2">
                    <ClaimRewards className=" "/>
                  </div>
                  <br />
                  <div className="m-2">
                    <ButtonDeposit className=" "/>
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InfoAccount;
