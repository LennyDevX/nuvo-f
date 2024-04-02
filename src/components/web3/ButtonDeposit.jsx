import React, { useEffect, useState, useContext } from 'react';
import Web3 from 'web3';
import ABI from '../../Abi/StakingContract.json';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';
import '../../Styles/ButtonDeposit.css';
import '../../Styles/Notification.css'; // Importar los estilos de notificación

// Importa la variable de entorno correctamente
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function ButtonContract() {
  const { account } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
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
        displayNotification('Failed to connect to MetaMask. Please make sure it is installed and unlocked.', 'error');
      });
    } else {
      displayNotification('Please install MetaMask!', 'error');
    }
  }, []);

  const handleDeposit = (event) => {
    event.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      displayNotification('Please enter a valid deposit amount.', 'error');
      return;
    }

    setLoading(true);
    const amountInWei = web3.utils.toWei(depositAmount);

    contract.methods.deposit().send({ from: account, value: amountInWei })
    .on('transactionHash', (hash) => {
      console.log('Transaction hash:', hash);
    })
    .on('receipt', (receipt) => {
      console.log('Receipt:', receipt);
      setLoading(false);
      displayNotification('Your deposit was successful!', 'success');
    })
    .on('error', (error) => {
      console.log('Deposit error:', error.message);
      displayNotification('There was an error while completing the deposit!', 'error');
      setLoading(false);
    });
  };

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => { setNotification({ message: '', type: '' }) }, 3000); // Notification will disappear after 3 seconds
  };

  return (
    <div className=''>
      <form onSubmit={handleDeposit} className="field is-grouped">
        <div className="control ">
          <input
            className={`input  ${isDarkMode ? 'dark-mode-input' : 'light-mode-input'}`}
            type="number"
            placeholder="Enter deposit amount"
            onChange={event => setDepositAmount(event.target.value)}
            value={depositAmount}
            maxLength="4"
          />
        </div>
        <div className="control">
          <button className={`button  ${isDarkMode ? 'is-success' : 'is-danger'} ${loading ? 'is-loading' : ''}`} type="submit" disabled={loading}><strong>Level Up</strong></button>
        </div>
      </form>
      {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type === 'error' ? 'is-danger' : 'is-success'} notification-visible`}>
          <p>{notification.message}</p>
        </div>
      )}
      {error && <p style={{ color: isDarkMode ? '#fff' : '#f00', position: 'fixed', bottom: 0 }}>{error}</p>}
    </div>
  );
}

export default ButtonContract;
