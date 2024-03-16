import React, { useEffect, useState, useContext } from 'react';
import Web3 from 'web3';
import ABI from '../../Abi/Verify.json';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';
import '../../Styles/ButtonContract.css';

const CONTRACT_ADDRESS = '0x0fd5c0a63626F6Cc25E507F2A614f686B46e62f6';

function ButtonContract() {
  const { account } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getButtonColorClass = () => {
    return isDarkMode ? 'dark-mode-button' : 'light-mode-button';
  };

  const getInputColorClass = () => {
    return isDarkMode ? 'dark-mode-input' : 'light-mode-input';
  };

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
        setError('Failed to connect to MetaMask. Please make sure it is installed and unlocked.');
      });
    } else {
      setError('Please install MetaMask!');
    }
  }, []);

  const handleDeposit = (event) => {
    event.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount.');
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
      alert('Deposit Success!');
      setLoading(false);
    })
    .on('error', (error) => {
      console.log('Deposit error:', error.message);
      setError('There was an error while completing the deposit!');
      setLoading(false);
    });
  };

  return (
    <div className='fade'>
      <form onSubmit={handleDeposit}>
        <input
          className={getInputColorClass()}
          type="number"
          placeholder="Enter deposit amount"
          onChange={event => setDepositAmount(event.target.value)}
          value={depositAmount}
        />
        <button className={getButtonColorClass()} type="submit" disabled={loading}>Deposit</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: isDarkMode ? '#fff' : '#f00' }}>{error}</p>}
    </div>
  );
}

export default ButtonContract;