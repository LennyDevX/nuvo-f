import React, { useEffect, useState, useContext } from 'react';
import { ethers } from 'ethers';
import ABI from "../../Abi/Governance.json";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import "../../Styles/Notification.css"; // Import notification styles

// Import the environment variable correctly
const GOVERNANCE_CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS;

function WithdrawalComponent() {
  const { isDarkMode } = useContext(ThemeContext);
  const { account } = useContext(WalletContext);
  const [governanceContract, setGovernanceContract] = useState(null);
  const [balance, setBalance] = useState(0); 
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, ABI.abi, provider.getSigner());
      setGovernanceContract(contract);
      getBalance(account);
    }
  }, [account]);

  const getBalance = async (account) => {
    if (account && governanceContract) {
      const balance = await governanceContract.balances(account);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const handleWithdrawal = async (event) => {
    event.preventDefault();
    if (!withdrawalAmount || isNaN(withdrawalAmount) || parseFloat(withdrawalAmount) <= 0) {
      displayNotification('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    setLoading(true);
    const amountInWei = ethers.utils.parseEther(withdrawalAmount);

    try {
      const tx = await governanceContract.withdraw(amountInWei);
      await tx.wait();
      const newBalance = await governanceContract.balances(account);
      setBalance(ethers.utils.formatEther(newBalance));
      setLoading(false);
      displayNotification('Your withdrawal was successful!', 'success');
    } catch (error) {
      console.log('Withdrawal error:', error);
      let errorMessage = "There was an error during the withdrawal.";
      if (error.message) {
        errorMessage += ` Details: ${error.message}`;
      }
      displayNotification(errorMessage, 'error');
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
        <form onSubmit={handleWithdrawal} className="field is-grouped">
          <div className="control">
            <input
              className={`input ${isDarkMode ? 'dark-mode-input' : 'light-mode-input'}`}
              type="number"
              placeholder="Enter withdrawal amount"
              onChange={event => setWithdrawalAmount(event.target.value)}
              value={withdrawalAmount}
              maxLength="4"
            />
          </div>
          <div className="control">
            <button 
              className={`button ${isDarkMode ? 'is-success' : 'is-danger'} ${loading ? 'is-loading' : ''}`} 
              type="submit" 
              disabled={loading}
            >
              <strong>Withdraw</strong>
            </button>
          </div>
        </form>
      </div>
      {error && <p className={`notification is-danger ${isDarkMode ? 'dark-mode-error' : 'light-mode-error'}`}>{error}</p>}
      {notification.message && (
        <div className={`notification ${notification.type === 'error' ? 'is-danger' : 'is-success'} notification-visible`}>
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
}

export default WithdrawalComponent;
