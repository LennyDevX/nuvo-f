import React, { useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { newKitFromWeb3 } from '@celo/contractkit';

const ConnectWalletButton = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const providerOptions = {}; // Opciones de proveedor para conectar distintas wallets

  const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions
  });

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);
      
      // Crear un nuevo kit con Celo Contract Kit
      const kit = newKitFromWeb3(web3);
      
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      setAccount(accounts[0]);

      // Conseguir el balance del usuario
      const balance = await kit.getTotalBalance(accounts[0]);
      setBalance(balance.celo);

      // Conseguir la cadena de bloques de red
      setNetwork(networkId === 42220 ? 'Mainnet' : 'Testnet');
    } catch (error) {
      console.error('Error al conectar con la wallet:', error);
      alert(error.message);
    }

    setIsLoading(false);
  }

  return (
    <>
      <button className={`button ${isLoading ? 'is-loading' : ''}`} onClick={handleConnect}>
        {account ? `Conectado: ${account}` : 'Conectar a Wallet'}
      </button>
      {account && (
        <>
          <p>Balance: {balance.toString()} CELO</p>
          <p>Cadena de bloques conectada: {network}</p>
        </>
      )}
    </>
  );
}

export default ConnectWalletButton;