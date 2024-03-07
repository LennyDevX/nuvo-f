import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext'; 

const Home = () => {
  const { account, network } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Verifica si hay una cuenta y una red conectadas
    if (account && network) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [account, network]);

  return (
    <div>
      <h1>¡Conectado!</h1>
      {isConnected ? (
        <>
          <p>Cuenta conectada: {account}</p>
          <p>Red: {network}</p>
        </>
      ) : (
        <p>Conéctate a tu wallet para ver la información.</p>
      )}
    </div>
  );
};

export default Home;
