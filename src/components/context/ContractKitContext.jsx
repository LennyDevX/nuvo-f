// Asegúrate de importar useState y useEffect
import React, { useState, useEffect } from 'react';
import { ContractKit, newKit } from '@celo/contractkit';
import Web3 from 'web3';

// Importar el componente WalletConnect
import WalletConnect from '../web3/WalletConnect';

// Crear el contexto
export const ContractKitContext = React.createContext();

function MyApp() {
  const [kit, setKit] = useState();

  useEffect(() => {
    const initKit = async () => {
      const web3 = new Web3("https://alfajores-forno.celo-testnet.org"); // Reemplaza esto con tu propio nodo o proveedor de Infura
      const kit = newKitFromWeb3(web3);
      setKit(kit);
    };

    initKit();
  }, []);

  if (!kit) {
    return null; // O un componente de carga...
  }

  // En lugar de <MyWalletApp />, devolver <WalletConnect />
  return (
    <ContractKitContext.Provider value={kit}>
      <WalletConnect />
    </ContractKitContext.Provider>
  );
}

export default MyApp;