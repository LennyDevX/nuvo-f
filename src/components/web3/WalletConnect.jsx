import React, { useState, useContext } from 'react';
import Web3 from 'web3';
import { WalletContext } from '../context/WalletContext'; 
import WalletUtils from "../web3/WalletUtils"; 
import MetaMaskLogo from '/metamask-logo.png';
import { ThemeContext } from '../context/ThemeContext';
import "../../Styles/HeroSection.css";

const WalletConnect = () => {
  const { setAccount, setNetwork, setBalance } = useContext(WalletContext); 
  const { isDarkMode } = useContext(ThemeContext);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (web3, accounts, networkName) => {
    setAccounts(accounts);
    setConnected(true);
    setIsLoading(false);
    setAccount(accounts[0]); 
    setNetwork(networkName); 

    const balanceWei = await web3.eth.getBalance(accounts[0]);
    const balance = web3.utils.fromWei(balanceWei, 'ether');
    setBalance(balance); 
  };

  const connectToWallet = async () => {
    try {
      setIsLoading(true);
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await web3Instance.eth.net.getId();
        const networkName = WalletUtils.getNetworkName(networkId.toString()); 

        handleConnect(web3Instance, accounts, networkName);
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
        <button className={` button-wallet  mr-2 ${isDarkMode? 'is-dark' : 'is-light'}`} disabled>
          <strong>{WalletUtils.censorAccount(accounts[0])}</strong>
        </button>
      ) : (
        <button className={`button button-wallet mr-2 ${isDarkMode? 'is-dark' : 'is-light'} ${isLoading ? 'is-loading' : ''}`} onClick={connectToWallet}>
          {isLoading ? (
            ''
          ) : (
            <>
              <strong>WALLET</strong>
              <img src={MetaMaskLogo} alt="MetaMask Logo" style={{ marginLeft: '5px' }} />
            </>
          )}
        </button>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default WalletConnect;