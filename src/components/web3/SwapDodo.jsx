import React from 'react';
import { SwapWidget } from '@dodoex/widgets';

export const DodoSwapWidget = () => {
  const dodoexAPI = import.meta.env.VITE_SWAP_DODOEX_API;
  
  return (
    <SwapWidget
      apikey={dodoexAPI}
      rebateTo='0xe34C3565AC80fd959627c6EFf02D793808a0b2A2'
      provider={window.ethereum}
      feeRate={2e16} // Aquí agregamos la tasa del 2%
      jsonRpcUrlMap={{
        137: ['https://polygon-rpc.com/']
      }}
      defaultChainId={137}
      colorMode='dark'
      defaultFromToken={{
        chainId: 137,
        address: '0x0000000000000000000000000000000000001010', // Matic
        name: 'Matic',
        decimals: 18,
        symbol: 'Matic',
        logoURI: ''
      }}
    />
  );
};

export default DodoSwapWidget;