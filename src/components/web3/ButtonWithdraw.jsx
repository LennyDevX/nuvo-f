import React, { useEffect, useState, useContext } from 'react';
import Web3 from 'web3';
import ABI from '../../Abi/StakingContract.json';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';

// Importa la variable de entorno correctamente
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function ButtonWithdraw() {
  const { account } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleWithdraw = async (event) => {
    event.preventDefault();
    if (!contract || !withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      displayError('Invalid contract or withdrawal amount.');
      return;
    }
  
    setLoading(true);
    try {
      // Verificar si el usuario tiene suficientes recompensas para retirar
      const rewards = await contract.methods.userRewards(account).call();
      if (parseFloat(rewards) <= 0) {
        displayError('You have no rewards to withdraw.');
        setLoading(false);
        return;
      }
  
      // Verificar si han pasado los 7 días desde el último retiro
      const lastWithdrawalTimestamp = await contract.methods.lastWithdrawalTimestamp(account).call();
      const currentTime = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      if (currentTime - lastWithdrawalTimestamp < sevenDaysInSeconds) {
        const remainingTime = sevenDaysInSeconds - (currentTime - lastWithdrawalTimestamp);
        const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60));
        displayError(`You can withdraw only after ${remainingDays} days from your last withdrawal.`);
        setLoading(false);
        return;
      }
  
      const withdrawAmountFloat = parseFloat(withdrawAmount);
      if (withdrawAmountFloat > parseFloat(rewards)) {
        displayError('You are trying to withdraw more than your available rewards.');
        setLoading(false);
        return;
      }
  
      // Realizar el retiro
      await contract.methods.withdrawRewards().send({ from: account })
      .on('transactionHash', (hash) => {
        console.log('Transaction hash:', hash);
      })
      .on('receipt', (receipt) => {
        console.log('Receipt:', receipt);
        alert('Withdraw Success!');
        setLoading(false);
      })
      .on('error', (error) => {
        console.log('Withdraw error:', error.message);
        if (error.code === 4001) {
          displayError('You rejected the transaction or MetaMask is not available.');
        } else {
          displayError('There was an error while completing the withdraw. Please try again later.');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error handling withdrawal:', error);
      displayError('Failed to process withdrawal. Please try again later.');
      setLoading(false);
    }
  };
  

  const displayError = (message) => {
    setError(message);
    setTimeout(() => { setError('') }, 3000); // El mensaje de error desaparecerá después de 3 segundos
  };

  return (
    <div className='withdraw-container'>
      <form onSubmit={handleWithdraw} className="field is-grouped">
        <div className="control">
          <input
            className={`input ${isDarkMode ? 'dark-mode-input' : 'light-mode-input'}`}
            type="number"
            placeholder="Enter withdraw amount"
            onChange={event => setWithdrawAmount(event.target.value)}
            value={withdrawAmount}
            maxLength="3"
          />
        </div>
        <div className="control">
          <button className={`button is-danger ${loading ? 'is-loading' : ''}`} type="submit" disabled={loading}><strong>Withdraw</strong></button>
        </div>
      </form>
      {error && <p className={`subtitle error-message ${isDarkMode ? 'dark-mode-error' : 'light-mode-error'}`}>{error}</p>}
    </div>
  );
}

export default ButtonWithdraw;
