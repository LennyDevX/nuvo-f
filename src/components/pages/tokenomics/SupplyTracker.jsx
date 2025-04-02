import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { FaCoins } from 'react-icons/fa';

const SupplyTracker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [supplyData, setSupplyData] = useState({
    totalSupply: '0',
    circulatingSupply: '0',
    percentCirculating: 0,
    remainingSupply: '0'
  });

  // Simulate data loading
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data - replace with your actual data fetching
        setSupplyData({
          totalSupply: '21,000,000',
          circulatingSupply: '1,000,000',
          percentCirculating: 4.76,
          remainingSupply: '20,000,000'
        });
      } catch (error) {
        console.error("Error fetching supply data:", error);
        // Set fallback values in case of error
        setSupplyData({
          totalSupply: '21,000,000',
          circulatingSupply: '0',
          percentCirculating: 0,
          remainingSupply: '21,000,000'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Ensure percentCirculating is a number and format it properly
  const formattedPercentage = isLoading ? 0 : 
    typeof supplyData.percentCirculating === 'number' 
      ? supplyData.percentCirculating.toFixed(2) 
      : 0;

  return (
    <m.div 
      className="card-purple-gradient card-purple-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '180px' }}
    >
      {/* Component Header */}
      <div className="flex items-center mb-4">
        <div className="p-2 bg-purple-900/30 rounded-lg mr-3">
          <FaCoins className="text-purple-400 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">NUVOS Token Supply</h2>
          <p className="text-gray-400 text-sm">Fixed cap of 21M tokens</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Supply */}
        <div 
          className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20 flex flex-col justify-between"
          style={{ minHeight: '90px' }}
        >
          <div className="text-gray-400 text-sm">Total Supply</div>
          {isLoading ? (
            <div className="mt-2 h-7">
              <div className="h-4 bg-purple-600/30 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="text-xl font-bold mt-2 max-w-md">
              {supplyData.totalSupply || '0'}
            </div>
          )}
        </div>

        {/* Circulating Supply */}
        <div 
          className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20 flex flex-col justify-between"
          style={{ minHeight: '90px' }}
        >
          <div className="text-gray-400 text-sm">Circulating</div>
          {isLoading ? (
            <div className="mt-2 h-7">
              <div className="h-4 bg-purple-600/30 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="text-xl font-bold mt-2 text-green-400">
              {supplyData.circulatingSupply || '0'}
            </div>
          )}
        </div>

        {/* Percent Circulating */}
        <div 
          className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20 flex flex-col justify-between"
          style={{ minHeight: '90px' }}
        >
          <div className="text-gray-400 text-sm">% Circulating</div>
          {isLoading ? (
            <div className="mt-2 h-7">
              <div className="h-4 bg-purple-600/30 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="text-xl font-bold mt-2 text-blue-400">
              {formattedPercentage}%
            </div>
          )}
        </div>

        {/* Remaining Supply */}
        <div 
          className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20 flex flex-col justify-between"
          style={{ minHeight: '90px' }}
        >
          <div className="text-gray-400 text-sm">Remaining</div>
          {isLoading ? (
            <div className="mt-2 h-7">
              <div className="h-4 bg-purple-600/30 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="text-xl font-bold mt-2 text-purple-400">
              {supplyData.remainingSupply || '0'}
            </div>
          )}
        </div>
      </div>

      {/* Supply Progress Bar */}
      <div className="mt-6" style={{ height: '40px' }}>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Supply Distribution</span>
          {!isLoading && (
            <span className="text-gray-400">{formattedPercentage}% Circulating</span>
          )}
        </div>
        
        <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden">
          {isLoading ? (
            <div className="h-full bg-gradient-to-r from-purple-900/50 to-purple-600/50 rounded-full animate-pulse"></div>
          ) : (
            <m.div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${formattedPercentage}%` }}
              transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
            ></m.div>
          )}
        </div>
      </div>
    </m.div>
  );
};

export default SupplyTracker;
