import React, { useEffect, useState, useContext } from 'react';
import Web3 from 'web3';
import ABI from '../../Abi/StakingContract.json';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';
import '../../Styles/ButtonDeposit.css';

const CONTRACT_ADDRESS = '0x5Ce75E5C8575ff802f65633eA2613b5c2ee27904';

function ButtonContract() {
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

  const handleWithdraw = (event) => {
    event.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      displayError('Please enter a valid withdraw amount.');
      return;
    }

    setLoading(true);
    const amountInWei = web3.utils.toWei(withdrawAmount);

    contract.methods.withdraw(amountInWei).send({ from: account })
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
      displayError('There was an error while completing the withdraw!');
      setLoading(false);
    });
  };

  const displayError = (message) => {
    setError(message);
    setTimeout(() => { setError('') }, 3000); // Error message will disappear after 3 seconds
  };

  return (
    <div className='fade'>
      <form onSubmit={handleWithdraw} className="field is-grouped">
        <div className="control is-small">
          <input
            className={`input is-small ${isDarkMode ? 'dark-mode-input' : 'light-mode-input'}`}
            type="number"
            placeholder="Enter withdraw amount"
            onChange={event => setWithdrawAmount(event.target.value)}
            value={withdrawAmount}
            maxLength="3"
          />
        </div>
        <div className="control">
          <button className={`button  is-small is-danger ${loading ? 'is-loading' : ''}`} type="submit" disabled={loading}>Withdraw</button>
        </div>
      </form>
      {error && <p style={{ color: isDarkMode ? '#fff' : '#f00', position: 'fixed', bottom: 0 }}>{error}</p>}
    </div>
  );
}

export default ButtonContract;