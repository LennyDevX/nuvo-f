import React, { useState, useContext, useEffect } from 'react';
import ABI from '../../Abi/Verify.json'; 
import Web3 from 'web3';
import { WalletContext } from '../context/WalletContext';

const CONTRACT_ADDRESS = '0x97577ff1abdB92eA3A59bfca5bCa9E79dC5AEA2C';

function UserRegister() {
  const { account } = useContext(WalletContext);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(() => {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const contractInstance = new web3Instance.eth.Contract(ABI.abi, CONTRACT_ADDRESS);
          setContract(contractInstance);
        })
        .catch(err => {
          console.error('Failed to load web3, accounts, or contract:', err);
        });
    } else {
      window.alert('Please install MetaMask!');
    }
  }, []);

  const registerUser = async () => {
  if (!contract || !web3) return;

  try {
    const gas = await contract.methods.registerUser().estimateGas({from: account});
    const result = await contract.methods.registerUser().send({from: account, gas });
    return result;
  } catch (error) {
    console.error('Error al registrar al usuario: ', error);
    if (/User already registered/i.test(error.message)) {
      alert("Ya estás registrado");
    }
  }
};

  const verifyUser = async (accountAddress) => {
    try {
      const userId = await contract.methods.getUserIdByAddress(accountAddress).call();
      setUserId(userId);
    } catch (error) {
      console.error('Error verifying the user: ', error);
      if (!/User does not exist/i.test(error.message)) {
        alert("Error verifying the user");
      }
    }
  };

  useEffect(() => {
    if (account && contract) {
      verifyUser(account);
    }
  }, [account, contract]);

  return (
    <div>
      <button onClick={registerUser}>
        Register User
      </button>

      {userId && <p>The user's ID is: {userId}</p>}

      <button onClick={() => verifyUser(account)}>
        Verify User
      </button>
    </div>
  );
}

export default UserRegister;