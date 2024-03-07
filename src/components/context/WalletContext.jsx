// WalletContext.jsx

import React, { createContext, useState } from 'react';

// Creamos el contexto para la billetera
export const WalletContext = createContext({
  account: null,
  network: null,
  setAccount: () => {},
  setNetwork: () => {},
});

// Proveedor del contexto de la billetera
export const WalletProvider = ({ children }) => {
  // Definimos el estado para la cuenta y la red
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  // Valor del contexto
  const value = { account, network, setAccount, setNetwork };

  return (
    // Proporcionamos el valor del contexto a los componentes hijos
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
