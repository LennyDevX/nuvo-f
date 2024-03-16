import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import WalletUtils from '../web3/WalletUtils';
import ButtonContract from "../web3/ButtonContract";
import BalanceContract from "../web3/BalanceContract";
import '../../Styles/home.css'


const Home = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (account && network && balance !== null) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [account, network, balance]);
  

  return (
    <div className='texto' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>Welcome to Nuvo, here is your Dashboard!</h1>
      {isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p>Your Wallet: {WalletUtils.censorAccount(account)}</p>
          <p>Connected Blockchain: {network}</p>
          <p>Your Balance: {balance} cryptos</p>
          <ButtonContract />
          <BalanceContract />
        </div>
      ) : (
        <p>Connect to your wallet to view information.</p>
      )}
    </div>
  );
};

export default Home;