import React, { useEffect, useState, useContext } from 'react';
import Web3 from 'web3';
import ABI from '../../Abi/StakingContract.json';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';
import "../../Styles/Notification.css"; // Importa los estilos de notificación

// Importa la variable de entorno correctamente
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function ButtonWithdraw() {
  const { account } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(() => {
        const web3Inst = new Web3(window.ethereum);
        setWeb3(web3Inst);

        const contractInstance = new web3Inst.eth.Contract(ABI.abi, CONTRACT_ADDRESS);
        setContract(contractInstance);
      })
      .catch((error) => {
        console.error('Error while initializing Web3:', error);
        displayError('Failed to connect to MetaMask. Please make sure it is installed and unlocked.');
      });
    } else {
      displayError('Please install MetaMask!');
    }
  }, []);

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => { setNotification({ message: '', type: '' }) }, 3000); // Notification will disappear after 3 seconds
  };

  const handleWithdraw = async () => {
    setLoading(true);
  
    try {
        // Check if the user has claimed rewards to withdraw
        const rewardsClaimed = await contract.methods.totalRewardsClaimed(account).call();
        if (parseFloat(rewardsClaimed) <= 0) {
            displayNotification('You have no claimed rewards to withdraw.', 'error');
            setLoading(false);
            return;
        }
  
        // If the user has claimed rewards, proceed with the withdrawal
        const tx = await contract.methods.withdrawRewards().send({ from: account });
        console.log('Withdraw transaction:', tx);
  
        displayNotification('Withdrawal successful!', 'success');
    } catch (error) {
        console.error('Error while withdrawing rewards:', error);
        displayNotification('There was an error while withdrawing rewards.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const displayError = (message) => {
    setError(message);
    setTimeout(() => { setError('') }, 3000); // Error message will disappear after 3 seconds
  };

  return (
    <div className='withdraw-container hero'>
      
      <button
          onClick={handleWithdraw}
          className={`button  ${isDarkMode ? 'has-text-warning' : 'has-text-primary'}`}
        >
          {loading ? 'Loading...' : 'Withdraw Rewards'}
        </button>
      {error && <p className={`subtitle error-message ${isDarkMode ? 'dark-mode-error' : 'light-mode-error'}`}>{error}</p>}
      {notification.message && (
        <div className={`notification ${notification.type === 'error' ? 'is-danger' : 'is-success'} notification-visible`}>
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
}

export default ButtonWithdraw;
