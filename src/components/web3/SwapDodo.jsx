// SwapDodo.jsx

import React, { useMemo, useCallback } from 'react';
import { SwapWidget } from '@dodoex/widgets';
import PropTypes from 'prop-types';

// Memoized configuration objects
const STYLE = {
  borderRadius: '0.75rem',
  height: '100%',
  minHeight: '480px', // Slightly reduced for better mobile fit
  maxWidth: '100%',
  margin: '0 auto',
};

const JSON_RPC_MAP = {
  137: ['https://polygon-rpc.com/'],
};

const DEFAULT_FROM_TOKEN = {
  chainId: 137,
  address: '0x0000000000000000000000000000000000001010',
  name: 'POL',
  decimals: 18,
  symbol: 'POL',
  logoURI: 'https://polygonscan.com/token/images/polygon.png',
};

const DodoSwapWidget = ({
  onError = () => {},
  onLoading = () => {},
  onTransactionStatus = () => {}
}) => {
  const dodoexAPI = import.meta.env.VITE_SWAP_DODOEX;

  const widgetConfig = useMemo(() => ({
    colorMode: "dark",
    width: 'auto', // Changed to auto for better responsiveness
    height: '100%',
    apikey: dodoexAPI,
    provider: window.ethereum,
    jsonRpcUrlMap: JSON_RPC_MAP,
    defaultChainId: 137,
    defaultFromToken: DEFAULT_FROM_TOKEN,
    style: STYLE
  }), [dodoexAPI]);

  return (
    <div className="swap-widget-container h-full w-full max-w-[380px] min-h-[480px] mx-auto mt-2 sm:mt-0">
      <SwapWidget
        {...widgetConfig}
        onError={onError}
        onLoading={onLoading}
        onTransactionStatusChange={onTransactionStatus}
      />
    </div>
  );
};

DodoSwapWidget.propTypes = {
  onError: PropTypes.func,
  onLoading: PropTypes.func,
  onTransactionStatus: PropTypes.func,
};

export default React.memo(DodoSwapWidget);