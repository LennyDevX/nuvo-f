import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend
} from 'recharts';
import { 
  tokenDistributionData, 
  tokenDistributionDetails,
  pieChartStyle,
} from '../../../utils/chart/chartConfig';
import { chartColors, gradientDefs } from '../../../utils/chart/chartSetup';

const TokenDistribution = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Throttled resize handler
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

  // Create a unique ID for this chart's gradient definitions
  const chartId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  
  // Get selected category info
  const selectedCategory = activeIndex !== null ? tokenDistributionData[activeIndex] : null;

  // Memoize key points content with specific colors for each element
  const keyPointsItems = [
    { color: 'text-purple-600', text: '20% allocated to staking rewards' },
    { color: 'text-blue-400', text: '15% treasury allocation' },
    { color: 'text-pink-400', text: '20% community incentives' },
    { color: 'text-amber-400', text: '15% marketing' },
    { color: 'text-green-400', text: '20% development' },
    { color: 'text-pink-500', text: '10% founder & team' },
  ];

  const keyPointsContent = useMemo(() => (
    <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
      {keyPointsItems.map((item, idx) => (
        <li key={item.text} className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
          <span className={item.color}>•</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  ), []);

  return (
    <motion.div
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-xl font-bold text-white mb-4 tracking-wide">Token Distribution</h2>
        
        {/* Selected category info panel */}
        {selectedCategory && (
          <div className="bg-[#1a1333]/50 border-l-2 border-purple-600 pl-3 py-1 mb-4 md:mb-0 w-full md:max-w-[220px] transition-all">
            <div className="text-sm text-purple-300 font-bold">{selectedCategory.name}</div>
            <div className="text-lg font-extrabold text-white">{selectedCategory.value}%</div>
            <div className="text-xs text-gray-300 opacity-80 line-clamp-2">
              {tokenDistributionDetails[selectedCategory.name] || ""}
            </div>
          </div>
        )}
      </div>
      
      <div className="aspect-square h-[300px] md:h-[330px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Custom gradient definitions */}
            <defs>
              {Object.values(gradientDefs(chartId)).map((gradient, gradIdx) => (
                <linearGradient 
                  key={gradient.id || `gradient-${gradIdx}`} 
                  id={gradient.id || `gradient-${gradIdx}`} 
                  x1={gradient.x1} y1={gradient.y1} 
                  x2={gradient.x2} y2={gradient.y2}
                >
                  {gradient.stops.map((stop, i) => (
                    <stop 
                      key={`${gradient.id || gradIdx}-stop-${i}`} 
                      offset={stop.offset} 
                      stopColor={stop.color} 
                      stopOpacity={stop.opacity || 1} 
                    />
                  ))}
                </linearGradient>
              ))}
            </defs>
            
            {/* Main pie chart */}
            <Pie
              data={tokenDistributionData}
              cx="50%"
              cy="50%"
              {...pieChartStyle}
              isAnimationActive={true}
              dataKey="value"
              onClick={(_, idx) => setActiveIndex(idx === activeIndex ? null : idx)}
            >
              {tokenDistributionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={0.5}
                  style={{ 
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                    filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                    transition: 'all 0.3s',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: '50% 50%'
                  }}
                />
              ))}
            </Pie>

            {/* Simple legend */}
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value, entry, idx) => (
                <span
                  style={{
                    color: activeIndex === idx ? '#ffffff' : 'rgb(209, 213, 219)',
                    fontSize: isMobile ? 11 : 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    background: activeIndex === idx ? 'rgba(124, 58, 237, 0.2)' : 'transparent'
                  }}
                  onClick={() => setActiveIndex(idx === activeIndex ? null : idx)}
                >
                  {value}
                </span>
              )}
              iconSize={isMobile ? 8 : 10}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 md:mt-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-2 tracking-wide">
          Key Points
        </h3>
        {keyPointsContent}
      </div>
    </motion.div>
  );
};

export default React.memo(TokenDistribution);
