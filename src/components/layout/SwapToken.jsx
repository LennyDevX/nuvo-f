import React, { useContext, useEffect, useState } from "react";
import DodoSwapIframe from "../web3/SwapDodo";
import { WalletContext } from "../context/WalletContext"; // Asegúrate que la ruta es correcta para tu proyecto
import { ThemeContext } from "../context/ThemeContext"; // Asegúrate que esta ruta es correcta para tu proyecto

const App = () => {
  const { account, network, balance } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if(account && network && balance !== null) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [account, network, balance]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '10px', fontSize: '30px', fontWeight: 'bold',  color: isDarkMode ? 'white' : 'black' }}>Swap Widget</h1>
      {isConnected ? 
        (
          <DodoSwapIframe />
        ) : 
        (
          <p>Por favor, conecta tu wallet para utilizar el widget.</p>
        )}
    </div>
  );

};

export default App;