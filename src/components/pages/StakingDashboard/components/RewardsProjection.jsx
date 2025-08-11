import React, { useState, useEffect, useRef } from 'react';
import { FaChartLine } from 'react-icons/fa';
import { formatBalance } from '../../../../utils/blockchain/formatters';
import { useStaking } from '../../../../context/StakingContext';
import { StakingSection } from '../ui/CommonComponents';

const RewardsProjection = ({ userDeposits, userInfo }) => {
  const { getDetailedStakingStats, getSignerAddress, calculateRealAPY } = useStaking();
  const [projections, setProjections] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [baseAPY, setBaseAPY] = useState(8.76); // Updated for SmartStaking v3.0
  const fetchInProgressRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const cachedDataRef = useRef(null);
  
  useEffect(() => {
    // Fetch base APY once for consistent display
    const fetchAPY = async () => {
      try {
        const data = await calculateRealAPY();
        if (data && data.baseAPY) {
          setBaseAPY(data.baseAPY);
        }
      } catch (error) {
        console.error('Error fetching APY:', error);
        setBaseAPY(8.76); // Updated for SmartStaking v3.0
      }
    };
    
    fetchAPY();
  }, [calculateRealAPY]);
  
  useEffect(() => {
    // Implementation with proper debouncing and caching
    const fetchProjections = async () => {
      // Skip if already fetching or no deposits
      if (fetchInProgressRef.current || !userDeposits?.length) {
        return;
      }
      
      // Throttle - don't fetch more often than every 30 seconds
      const now = Date.now();
      if (now - lastFetchTimeRef.current < 30000 && cachedDataRef.current) {
        return;
      }
      
      // If we have a cached result and nothing has changed, use that
      if (
        cachedDataRef.current && 
        userInfo && 
        cachedDataRef.current.totalStaked === userInfo.totalStaked && 
        cachedDataRef.current.depositsCount === userDeposits.length
      ) {
        return;
      }
      
      // Set loading state without causing re-renders if we don't have data yet
      if (!projections) {
        setIsLoading(true);
      }
      
      fetchInProgressRef.current = true;
      try {
        const address = await getSignerAddress();
        if (address) {
          const stats = await getDetailedStakingStats(address);
          if (stats && stats.projections) {
            setProjections(stats.projections);
            // Cache this data for future reference
            cachedDataRef.current = {
              projections: stats.projections,
              totalStaked: userInfo?.totalStaked,
              depositsCount: userDeposits.length,
              timestamp: now
            };
            lastFetchTimeRef.current = now;
          }
        }
      } catch (error) {
        console.error("Error fetching reward projections:", error);
      } finally {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    };
    
    fetchProjections();
  }, [userDeposits?.length, userInfo?.totalStaked, getDetailedStakingStats, getSignerAddress]);
  
  // If user has no deposits, show alternate content
  if (!userDeposits || userDeposits.length === 0) {
    return (
      <StakingSection title="Reward Projections" icon={<FaChartLine />}>
        <div className="text-center py-6">
          <div className="text-slate-400 mb-2">No active stakes</div>
          <p className="text-sm text-slate-500">
            Stake POL tokens to see your potential rewards over time.
          </p>
        </div>
      </StakingSection>
    );
  }
  
  // Generate minimal projections based on user info if API call is still loading
  const getMinimalProjections = () => {
    if (projections) return projections;
    if (!userInfo || !userInfo.totalStaked) return null;
    
    // Simple ROI calculation based on contract verified APY (8.76%)
    const totalStaked = parseFloat(userInfo.totalStaked);
    const dailyRate = (8.76 / 365) / 100; // Use contract verified rate
    
    return {
      oneMonth: (totalStaked * dailyRate * 30).toFixed(4),
      threeMonths: (totalStaked * dailyRate * 90).toFixed(4),
      sixMonths: (totalStaked * dailyRate * 180).toFixed(4),
      oneYear: (totalStaked * dailyRate * 365).toFixed(4)
    };
  };
  
  // Always have something to display
  const displayProjections = getMinimalProjections();
  
  return (
    <StakingSection title="Reward Projections" icon={<FaChartLine />}>
      <div className="space-y-5 min-h-[240px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">Estimated rewards over time</div>
            {isLoading && !projections && (
              <div className="flex space-x-1 items-center opacity-60">
                <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            )}
          </div>
          
          {displayProjections ? (
            <div className="space-y-1.5">
              <ProjectionItem period="1 Month" value={displayProjections.oneMonth} />
              <ProjectionItem period="3 Months" value={displayProjections.threeMonths} />
              <ProjectionItem period="6 Months" value={displayProjections.sixMonths} />
              <ProjectionItem period="1 Year" value={displayProjections.oneYear} />
            </div>
          ) : (
            <div className="py-6 flex justify-center">
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-slate-700/30 text-xs text-slate-400">
            <div className="flex justify-between items-center py-2">
              <span>Base APY:</span>
              <span className="text-white">8.76%</span>
            </div>
            
            <div className="text-xs mt-4 py-2 px-3 bg-indigo-900/20 rounded-lg border border-indigo-900/40">
              <span className="text-indigo-400">Note:</span> Projections based on contract verified 8.76% APY with linear rewards.
            </div>
          </div>
        </div>
      </div>
    </StakingSection>
  );
};

const ProjectionItem = ({ period, value }) => (
  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-800/40 transition-colors">
    <span className="text-slate-300">{period}</span>
    <span className="text-white font-medium">{formatBalance(value || 0)} POL</span>
  </div>
);

export default RewardsProjection;
