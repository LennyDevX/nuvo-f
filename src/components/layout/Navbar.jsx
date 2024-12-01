    
import React, { useContext, useEffect, useState } from "react";
import DodoSwapIframe from "../web3/SwapDodo";
import { WalletContext } from "../context/WalletContext"; // Asegúrate que la ruta es correcta para tu proyecto

const App = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if(account && network && balance !== null) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [account, network, balance]);

  return (
    <div className="fade  subtitle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '80vh', textAlign: 'center' }}>
      <h1 className=" title">SwapToken</h1>
      {isConnected ? 
        (
          <DodoSwapIframe />
        ) : 
        (
          <p className="subtitle">Por favor, conecta tu wallet para utilizar el widget.</p>
        )}
    </div>
  );

};

export default App;