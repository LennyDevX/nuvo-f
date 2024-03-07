import React, { useState } from 'react';
import Web3 from 'web3';
import LogoMetamask from '/LogoMetamask2.svg';

const WalletConnectButton = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [networkName, setNetworkName] = useState(null);
  const [error, setError] = useState(null);

  const connectToWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        const networkName = await getNetworkName(networkId.toString());
        setNetworkName(networkName);
      } else {
        throw new Error('Metamask no está instalado en este navegador o no está habilitado.');
      }
    } catch (error) {
      console.error('Error al conectar con Metamask: ', error);
      setError(error.message);
    }
  };

  const getNetworkName = async (networkId) => {
    switch (networkId) {
      case '1':
        return 'Ethereum Mainnet';
      case '3':
        return 'Ropsten Testnet';
      case '4':
        return 'Rinkeby Testnet';
      case '42':
        return 'Kovan Testnet';
      case '56':
        return 'Binance Smart Chain'; // Agregar Binance Smart Chain (BSC)
      case '97':
        return 'Binance Smart Chain Testnet'; // Agregar Binance Smart Chain Testnet (BSC Testnet)
      case '137':
        return 'Polygon Mainnet';
      case '80001':
        return 'Polygon Mumbai Testnet';
      case '42220':
        return 'Celo Mainnet';
      case '44787':
        return 'Celo Alfajores Testnet';
      default:
        return 'Red Desconocida';
    }
  };

  return (
    <div>
      <button className="button is-success is-outlined mr-2" onClick={connectToWallet}>
        <span>Wallet</span>
        <span className="icon">
          <img src={LogoMetamask} alt="Metamask Logo" style={{ width: '1em', height: '1em' }} />
        </span>
      </button>
      {error && <p>{error}</p>}
      {accounts.length > 0 && <p>Cuentas conectadas: {accounts.join(', ')}</p>}
      {networkName && <p>Red: {networkName}</p>}
    </div>
  );
  
};

export default WalletConnectButton;
