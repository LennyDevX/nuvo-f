import React from 'react';
import { motion as m } from 'framer-motion';
import { FaCoins, FaExclamationCircle } from 'react-icons/fa';

const TokensSection = ({ tokenBalances = [] }) => {
  // Default token data if actual balances can't be fetched
  const defaultTokens = [
    {
      symbol: "POL",
      name: "Polygon",
      balance: "0.0",
      price: 0.68,
      change: 2.45,
      logo: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=025"
    },
    {
      symbol: "NUVO",
      name: "Nuvos Token",
      balance: "0.0",
      price: 0.0,
      change: 0.0,
      logo: "/LogoNuvos.webp"
    }
  ];
  
  // Use real token data if available, otherwise use defaults
  const tokens = tokenBalances.length > 0 ? tokenBalances : defaultTokens;

  // Calculate total value
  const totalValue = tokens.reduce((acc, token) => {
    return acc + (parseFloat(token.balance) * (token.price || 0));
  }, 0);
  
  const renderTokenValue = (balance, price) => {
    const value = parseFloat(balance) * (price || 0);
    return value ? `$${value.toFixed(2)}` : 'N/A';
  };
  
  const renderPriceChange = (change) => {
    if (change === undefined || change === null) return 'N/A';
    const isPositive = change >= 0;
    return (
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaCoins className="text-purple-400" /> Token Holdings
        </h2>
        <div className="bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/20">
          <span className="text-sm text-purple-300">Total Value: </span>
          <span className="font-medium text-white">${totalValue.toFixed(2)}</span>
        </div>
      </div>
      
      {tokens.length === 0 ? (
        <div className="bg-black/20 rounded-xl p-10 text-center">
          <FaExclamationCircle className="text-4xl text-purple-400 mb-4 mx-auto" />
          <h3 className="text-xl font-medium text-white mb-2">No Token Data Available</h3>
          <p className="text-gray-400">We couldn't load your token balances at this time.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-purple-500/20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Asset</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-purple-300">Balance</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-purple-300">Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-purple-300">24h</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-purple-300">Value</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr 
                  key={token.symbol} 
                  className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={token.logo} 
                        alt={token.symbol} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-token.png';
                        }}
                      />
                      <div>
                        <div className="font-medium text-white">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-white">
                    {parseFloat(token.balance).toFixed(token.symbol === 'NUVO' ? 0 : 4)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-300">
                    ${token.price?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {renderPriceChange(token.change)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-white">
                    {renderTokenValue(token.balance, token.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-300 flex items-start gap-2">
        <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
        <div>
          Note: NUVO tokens are not yet publicly traded. The value shown is for demonstration purposes only.
        </div>
      </div>
    </m.div>
  );
};

export default TokensSection;
