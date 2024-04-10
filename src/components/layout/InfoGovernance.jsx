import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/Governance.json"; // Make sure you have the correct ABI
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import ButtonGovernance from "../web3/ButtonGovernance";
import ButtonWithdraw from "../web3/WithdrawGovernance";
import PolygonLogo from "/PolygonLogo.png"; // Import the image
import "../../Styles/home.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS;

function InfoAccount() {
  const { isDarkMode } = useContext(ThemeContext);
  const { account, network, balance } = useContext(WalletContext);

  const [isConnected, setIsConnected] = useState(false);
  const [votingPower, setVotingPower] = useState(0);
  const [error, setError] = useState(null);
  const [depositedMatic, setDepositedMatic] = useState(0);
  const [governanceLevel, setGovernanceLevel] = useState("");

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
        ABI.abi, // Make sure you have the correct ABI
        signer
      );

      const signerAddress = await signer.getAddress();
      const votingPowerBN = await contract.votes(signerAddress);
      const votingPowerStr = ethers.utils.formatEther(votingPowerBN);
      const votingPower = parseFloat(votingPowerStr);
      setVotingPower(votingPower);

      // Fetch deposited MATIC (assuming "saldos" mapping stores the balances)
      const depositedMaticBN = await contract.balances(signerAddress); // Changed from `saldos` to `balances`
      const depositedMaticStr = ethers.utils.formatEther(depositedMaticBN);
      const depositedMatic = parseFloat(depositedMaticStr);
      setDepositedMatic(depositedMatic);

      // Determine the governance level based on the "Voting Power"
      const level = getGovernanceLevel(votingPower);
      setGovernanceLevel(level);
    } catch (error) {
      console.error("Error: ", error);
      setError("Error fetching account information. Please try again later.");
    }
  };

  // Function to determine the governance level
  const getGovernanceLevel = (votingPower) => {
    if (votingPower >= 1 && votingPower <= 50) {
      return "Rocket";
    } else if (votingPower >= 51 && votingPower <= 150) {
      return "Holder";
    } else if (votingPower >= 151 && votingPower <= 1000) {
      return "Super Holder";
    } else {
      return "Unknown";
    }
  };

  return (
    <div className="">
      <section className={isDarkMode ? "hero-body fadedark-mode" : "hero-body"}>
        <div className={`fade hero container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="box box-account main-container">
            <h1 className="title is-3 is-centered has-text-centered">Governance V1</h1>
            <div className={`flex ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
              {isConnected ? (
                <>
                  <div className={`fade balance-display ${isDarkMode ? 'balance-dark' : 'balance-light'}`}>
                    <p className="subtitle">
                       <strong>Deposit:</strong> {depositedMatic} <img src={PolygonLogo} alt="Polygon Logo" className="icon" /> 
                    </p>
                    <p className="subtitle">
                      <strong>Voting Power:</strong> {votingPower} 🔥
                    </p>
                    <p className="subtitle">
                      <strong>Bag:</strong>  {balance} <img src={PolygonLogo} alt="Polygon Logo" className="icon" />
                    </p>
                    <p className="subtitle">
                      <strong>Governance Level:</strong> {governanceLevel}
                    </p>
                  </div>
                  <div className="m-2">
                    <ButtonGovernance />
                  </div>
                  <div className="m-2">
                    <ButtonWithdraw />
                  </div>
                  <p className={`subtitle account-info ${isDarkMode ? 'account-info-dark' : ''}`}>
                    <strong>Network:</strong> {network}
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
