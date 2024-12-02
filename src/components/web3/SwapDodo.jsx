// SwapDodo.jsx

import React from 'react';
import { SwapWidget } from '@dodoex/widgets';

const DodoSwapWidget = () => {
  const dodoexAPI = import.meta.env.VITE_SWAP_DODOEX_API;

  return (
    <div className="swap-widget-container h-full">
      <SwapWidget
        apikey={dodoexAPI}
        rebateTo="0xe34C3565AC80fd959627c6EFf02D793808a0b2A2"
        provider={window.ethereum}
        feeRate={2e16} // 2% de comisión
        jsonRpcUrlMap={{
          137: ['https://polygon-rpc.com/'],
        }}
        defaultChainId={137}
        colorMode="light" // Modo claro para coincidir con la temática
        defaultFromToken={{
          chainId: 137,
          address: '0x0000000000000000000000000000000000001010', // MATIC
          name: 'MATIC',
          decimals: 18,
          symbol: 'MATIC',
          logoURI: 'https://polygonscan.com/token/images/polygon.png', // Logo de MATIC
        }}
        defaultToToken={{
          chainId: 137,
          address: '', // Dirección del token al que quieres cambiar por defecto
          name: '',
          decimals: 18,
          symbol: '',
          logoURI: '',
        }}
        style={{
          borderRadius: '0.75rem',
          height: '100%',
          minHeight: '500px',
        }}
      />
    </div>
  );
};

export default DodoSwapWidget;