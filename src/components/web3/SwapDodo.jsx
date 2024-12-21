// SwapDodo.jsx

import React, { useMemo, useCallback } from 'react';
import { SwapWidget } from '@dodoex/widgets';

const DodoSwapWidget = ({ onError, onLoading, onTransactionStatus }) => {
  const dodoexAPI = import.meta.env.VITE_SWAP_DODOEX;

  const defaultFromToken = useMemo(() => ({
    chainId: 137,
    address: '0x0000000000000000000000000000000000001010',
    name: 'POL',
    decimals: 18,
    symbol: 'POL',
    logoURI: 'https://polygonscan.com/token/images/polygon.png',
  }), []);

  const handleError = useCallback((error) => {
    onError?.(error);
  }, [onError]);

  const handleLoading = useCallback((loading) => {
    onLoading?.(loading);
  }, [onLoading]);

  const widgetConfig = useMemo(() => ({
    colorMode: "dark",
    width: 380,
    height: 500,
    apikey: dodoexAPI,
    provider: window.ethereum,
    jsonRpcUrlMap: {
      137: ['https://polygon-rpc.com/'],
    },
    defaultChainId: 137,
    defaultFromToken,
    style: {
      borderRadius: '0.75rem',
      height: '100%',
      minHeight: '500px',
    }
  }), [dodoexAPI, defaultFromToken]);

  return (
    <div className="swap-widget-container h-full">
      <SwapWidget
        {...widgetConfig}
        onError={handleError}
        onLoading={handleLoading}
        onTransactionStatusChange={onTransactionStatus}
      />
    </div>
  );
};

export default React.memo(DodoSwapWidget);