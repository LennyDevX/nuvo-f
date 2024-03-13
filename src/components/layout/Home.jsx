import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import WalletUtils from '../web3/WalletUtils';

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
    <div>
      <h1>Welcome to Nuvo, here is your Dashboard!</h1>
      {isConnected ? (
        <>
          <p>Your Wallet: {WalletUtils.censorAccount(account)}</p>
          <p>Connected Blockchain: {network}</p>
          <p>Your Balance: {balance} cryptos</p>
        </>
      ) : (
        <p>Connect to your wallet to view information.</p>
      )}
    </div>
  );
};

export default Home;