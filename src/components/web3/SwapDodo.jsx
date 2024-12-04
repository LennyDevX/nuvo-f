// SwapDodo.jsx

import React from 'react';
import { SwapWidget } from '@dodoex/widgets';

const DodoSwapWidget = () => {
  const dodoexAPI = import.meta.env.VITE_SWAP_DODOEX_API;

  return (
    <div className="swap-widget-container h-full">
      <SwapWidget
        colorMode="dark"
        width={380}
        height={500}
        apikey={dodoexAPI}
        provider={window.ethereum}
        jsonRpcUrlMap={{
          137: ['https://polygon-rpc.com/'],
        
        }}
        defaultChainId={137}
        defaultFromToken={{
          chainId: 137,
          address: '0x0000000000000000000000000000000000001010', // MATIC
          name: 'POL',
          decimals: 18,
          symbol: 'POL',
          logoURI: 'https://polygonscan.com/token/images/polygon.png', // Logo de MATIC
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