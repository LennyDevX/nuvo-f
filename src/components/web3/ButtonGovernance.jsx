import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import ABI from "../../Abi/Gobernanza.json";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';

// Importa la variable de entorno correctamente
const GOVERNANCE_CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS;

function GovernanceComponent() {
  const { isDarkMode } = useContext(ThemeContext);
  const { account } = useContext(WalletContext);
  const [governanceContract, setGovernanceContract] = useState(null);
  const [votes, setVotes] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, ABI.abi, provider.getSigner());
      setGovernanceContract(contract);
      getVotes(account);
    }
  }, [account]);

  const getVotes = async (account) => {
    if (account && governanceContract) {
      const votes = await governanceContract.votos(account);
      setVotes(ethers.utils.formatEther(votes));
    }
  };

  const handleDeposit = async (event) => {
    event.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      displayNotification('Please enter a valid deposit amount.', 'error');
      return;
    }
  
    setLoading(true);
    const amountInWei = ethers.utils.parseEther(depositAmount);
  
    try {
        const tx = await governanceContract.depositar({ value: amountInWei });
        await tx.wait();
      const newVotes = await governanceContract.votos(account);
      setVotes(ethers.utils.formatEther(newVotes));
      setLoading(false);
      displayNotification('Your deposit was successful!', 'success');
    } catch (error) {
        console.error('Deposit error:', error);
      
        let errorMessage;
        let errorDetails = ""; // Additional details for the user
      
        if (error.code) {
          switch (error.code) {
            case 4001:
              errorMessage = "Transaction rejected.";
              errorDetails = "You cancelled the transaction in your wallet.";
              break;
            case -32603: // Internal JSON-RPC error
              if (error.data?.message.includes("insufficient funds")) {
                errorMessage = "Insufficient funds.";
                errorDetails = "You don't have enough MATIC in your wallet to complete this deposit.";
              } else {
                errorMessage = "Contract error.";
                errorDetails = "There was an issue with the Gobernanza contract. Please try again later or contact support."; 
              }
              break;
            default: 
              errorMessage = "An unexpected error occurred.";
              errorDetails = "Please try again later or contact support."; 
          }
        } else if (error.message) {
          // Non-JSON-RPC errors
          errorMessage = "An error occurred.";
          errorDetails = `Details: ${error.message}`;
        } else {
          // Unknown errors
          errorMessage = "An unknown error occurred.";
          errorDetails = "Please try again later or contact support.";
        }
      
        displayNotification(`${errorMessage} ${errorDetails}`, 'error');
        setLoading(false);
      }
  };
  

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => { setNotification({ message: '', type: '' }) }, 3000); // Notification will disappear after 3 seconds
  };

  return (
    <div className={`fade ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div>
        <form onSubmit={handleDeposit} className="field is-grouped">
        <div className="control">
            <input
              className={`input ${isDarkMode ? 'dark-mode-input' : 'light-mode-input'}`}
              type="number"
              placeholder="Enter deposit amount"
              onChange={event => setDepositAmount(event.target.value)}
              value={depositAmount}
              maxLength="4"
            />
          </div>
          <div className="control">
            <button className={`button ${isDarkMode ? 'is-success' : 'is-danger'} ${loading ? 'is-loading' : ''}`} type="submit" disabled={loading}><strong>Get votes</strong></button>
          </div>
          
        </form>
        {notification.message && (
          <div className={`notification ${notification.type === 'error' ? 'is-danger' : 'is-success'} notification-visible`}>
            <p>{notification.message}</p>
          </div>
        )}
        {error && <p style={{ color: isDarkMode ? '#fff' : '#f00', position: 'fixed', bottom: 0 }}>{error}</p>}
      </div>
    </div>
  );
        }

export default GovernanceComponent;