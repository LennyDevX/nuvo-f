import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { m } from 'framer-motion';
import { FaCoins } from 'react-icons/fa';
import LoadingSpinner from '../../ui/LoadingSpinner';

const SupplyTracker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [supplyData, setSupplyData] = useState({
    totalSupply: '0',
    circulatingSupply: '0',
    percentCirculating: 0,
    remainingSupply: '0'
  });
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Optimize the data fetching with useCallback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay - reduced for mobile
      await new Promise(resolve => setTimeout(resolve, isMobile ? 500 : 1000));
      
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
  }, [isMobile]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize percentage calculation
  const formattedPercentage = useMemo(() => {
    if (isLoading) return 0;
    return typeof supplyData.percentCirculating === 'number' 
      ? supplyData.percentCirculating.toFixed(2) 
      : 0;
  }, [isLoading, supplyData.percentCirculating]);

  // Memoize animation variants for better performance
  const progressAnimationVariants = useMemo(() => ({
    initial: { width: 0 },
    animate: { 
      width: `${formattedPercentage}%`,
      transition: { 
        duration: isMobile ? 0.4 : 0.8,
        type: "spring", 
        stiffness: isMobile ? 70 : 50
      }
    }
  }), [formattedPercentage, isMobile]);

  // Memoize the grid layout based on mobile status - improved for better mobile experience
  const gridClassName = useMemo(() => 
    `grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4`,
    []
  );

  // Memoize skeleton component for reuse
  const SkeletonLoader = useMemo(() => (
    <LoadingSpinner size="small" variant="pulse" />
  ), []);

  // Memoized progress bar component with smoother animations
  const ProgressBar = useMemo(() => (
    <div className="mt-4 sm:mt-6">
      <div className="flex justify-between text-xs sm:text-sm mb-2">
        <span className="text-gray-400">Supply Distribution</span>
        {!isLoading && (
          <span className="text-purple-300 font-medium">{formattedPercentage}% Circulating</span>
        )}
      </div>
      
      <div className="h-3 sm:h-4 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/20">
        {isLoading ? (
          <LoadingSpinner size="small" variant="bars" className="h-full" />
        ) : (
          <m.div 
            className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400 rounded-full
                       shadow-inner shadow-purple-500/30"
            variants={progressAnimationVariants}
            initial="initial"
            animate="animate"
          ></m.div>
        )}
      </div>
    </div>
  ), [isLoading, formattedPercentage, progressAnimationVariants]);

  return (
    <m.div 
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ minHeight: '200px' }}
    >
      {/* Component Header */}
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="p-2 bg-purple-900/30 rounded-lg mr-3 flex-shrink-0">
          <FaCoins className="text-purple-400 text-lg sm:text-xl" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">NUVOS Token Supply</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Fixed cap of 21M tokens</p>
        </div>
      </div>

      {/* Main Content - improved mobile grid */}
      <div className={gridClassName}>
        {/* Total Supply */}
        <div 
          className="bg-gradient-to-br from-purple-900/25 to-purple-800/15 p-3 sm:p-4 rounded-lg 
                     border border-purple-500/20 hover:border-purple-400/40 transition-all
                     flex flex-col justify-between"
          style={{ minHeight: '85px' }}
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Total Supply</div>
          {isLoading ? (
            <div className="mt-1 h-6 flex justify-center">
              {SkeletonLoader}
            </div>
          ) : (
            <div className="text-base sm:text-lg lg:text-xl font-bold text-white leading-tight">
              {supplyData.totalSupply || '0'}
            </div>
          )}
        </div>

        {/* Circulating Supply */}
        <div 
          className="bg-gradient-to-br from-green-900/25 to-green-800/15 p-3 sm:p-4 rounded-lg 
                     border border-green-500/20 hover:border-green-400/40 transition-all
                     flex flex-col justify-between"
          style={{ minHeight: '85px' }}
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Circulating</div>
          {isLoading ? (
            <div className="mt-1 h-6">
              {SkeletonLoader}
            </div>
          ) : (
            <div className="text-base sm:text-lg lg:text-xl font-bold text-green-400 leading-tight">
              {supplyData.circulatingSupply || '0'}
            </div>
          )}
        </div>

        {/* Percent Circulating */}
        <div 
          className="bg-gradient-to-br from-blue-900/25 to-blue-800/15 p-3 sm:p-4 rounded-lg 
                     border border-blue-500/20 hover:border-blue-400/40 transition-all
                     flex flex-col justify-between"
          style={{ minHeight: '85px' }}
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1">% Circulating</div>
          {isLoading ? (
            <div className="mt-1 h-6">
              {SkeletonLoader}
            </div>
          ) : (
            <div className="text-base sm:text-lg lg:text-xl font-bold text-blue-400 leading-tight">
              {formattedPercentage}%
            </div>
          )}
        </div>

        {/* Remaining Supply */}
        <div 
          className="bg-gradient-to-br from-purple-900/25 to-pink-900/15 p-3 sm:p-4 rounded-lg 
                     border border-purple-500/20 hover:border-purple-400/40 transition-all
                     flex flex-col justify-between"
          style={{ minHeight: '85px' }}
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-1">Remaining</div>
          {isLoading ? (
            <div className="mt-1 h-6">
              {SkeletonLoader}
            </div>
          ) : (
            <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-400 leading-tight">
              {supplyData.remainingSupply || '0'}
            </div>
          )}
        </div>
      </div>

      {/* Supply Progress Bar */}
      {ProgressBar}
    </m.div>
  );
};

export default React.memo(SupplyTracker);
