import React, { useState } from 'react';
import getAirdropWalletAddresses from './getAirdropWalletAddresses';

export const AirdropDownloader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      const addresses = await getAirdropWalletAddresses();
      console.log(`Downloaded ${addresses.length} addresses`);
    } catch (err) {
      setError(err.message);
      console.error('Download failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button 
        onClick={handleDownload}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Downloading...' : 'Download Airdrop Addresses'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default AirdropDownloader;