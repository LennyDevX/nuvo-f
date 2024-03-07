import React, { useState, useContext } from 'react';
import Web3 from 'web3';
import { WalletContext } from '../context/WalletContext'; // Importa el contexto WalletContext
import WalletUtils from "../web3/WalletUtils"; // Importa el componente WalletUtils

const WalletConnect = () => {
  const { setAccount, setNetwork } = useContext(WalletContext); // Usa useContext para acceder al contexto
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const handleConnect = (web3, accounts, networkName) => {
    setAccounts(accounts);
    setConnected(true);
    setIsLoading(false);
    setAccount(accounts[0]); // Establece la cuenta en el contexto
    setNetwork(networkName); // Establece la red en el contexto
    console.log('Cuenta conectada:', accounts[0]);
    console.log('Red conectada:', networkName);
  };

  const connectToWallet = async () => {
    try {
      setIsLoading(true);
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await web3Instance.eth.net.getId();
        const networkName = WalletUtils.getNetworkName(networkId.toString()); // Utiliza la función del nuevo componente
        setTimeout(() => {
          handleConnect(web3Instance, accounts, networkName);
        }, 2000);
      } else {
        throw new Error('Metamask no está instalado en este navegador o no está habilitado.');
      }
    } catch (error) {
      console.error('Error al conectar con Metamask: ', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {connected ? (
        <button className="button mr-2" disabled>
          <span><strong> {WalletUtils.censorAccount(accounts[0])} </strong>Conectado</span>
        </button>
      ) : (
        <button className={`button mr-2 ${isLoading && 'is-loading'}`} onClick={connectToWallet}>
          {isLoading ? (
            <span>Conectando...</span>
          ) : (
            <span>Wallet</span>
          )}
        </button>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default WalletConnect;
