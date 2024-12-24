import React from 'react';
import { useContext } from 'react';
import { WalletContext } from '../../context/WalletContext';

const NetworkBadge = () => {
  const { network } = useContext(WalletContext);
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
      ${network?.chainId === 137 ? 'bg-purple-500/20 text-purple-200' : 'bg-red-500/20 text-red-200'}`}>
      {network?.chainId === 137 ? 'Polygon Network' : 'Wrong Network'}
    </div>
  );
};

export default NetworkBadge;