import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Sector, Tooltip, Legend 
} from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';
import { chartColors } from '../../../utils/chart/chartSetup';

const TokenomicsSystem = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile devices on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add listener for window resize with throttling
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Memoize token data to prevent recreation on each render
  const tokenData = useMemo(() => [
    { name: 'Community Rewards', value: 30, color: chartColors.purple.primary },
    { name: 'Ecosystem Growth', value: 30, color: chartColors.purple.secondary },
    { name: 'Team & Development', value: 20, color: chartColors.purple.tertiary },
    { name: 'Marketing', value: 10, color: chartColors.purple.quaternary },
    { name: 'Liquidity', value: 10, color: chartColors.purple.dark },
  ], []);

  // Optimize event handler with useCallback
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  // Memoize animation settings based on device capability
  const shouldReduceMotion = useMemo(() => 
    prefersReducedMotion || isMobile, 
    [prefersReducedMotion, isMobile]
  );

  // Memoize motion animation values
  const motionProps = useMemo(() => ({
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: shouldReduceMotion ? 0.3 : 0.6 }
  }), [shouldReduceMotion]);

  // Active shape renderer for interactive pie slices
  const renderActiveShape = useCallback((props) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.95}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        {!isMobile && (
          <>
            <text 
              x={cx} 
              y={cy - 10} 
              textAnchor="middle" 
              fill="#FFFFFF"
              style={{
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {payload.name}
            </text>
            <text 
              x={cx} 
              y={cy + 20} 
              textAnchor="middle" 
              fill="#FFFFFF"
              style={{
                fontSize: '14px'
              }}
            >
              {`${value}% of supply`}
            </text>
          </>
        )}
      </g>
    );
  }, [isMobile]);

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-2 rounded-lg shadow-lg border border-purple-500/30">
          <p className="text-white font-medium">{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  }, []);

  // Memoize pie chart
  const pieChart = useMemo(() => {
    const innerRadius = isMobile ? 60 : 80;
    const outerRadius = isMobile ? 120 : 160;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={tokenData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey="value"
            onMouseEnter={onPieEnter}
            isAnimationActive={!shouldReduceMotion}
            animationBegin={300}
            animationDuration={1500}
          >
            {tokenData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  filter: activeIndex === index ? 'url(#glow)' : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [tokenData, activeIndex, onPieEnter, isMobile, shouldReduceMotion, renderActiveShape, CustomTooltip]);

  // Memoize key points section
  const keyPoints = useMemo(() => (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold text-purple-400 mb-2 tracking-wide">
        Key Points
      </h3>
      <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
        {tokenData.map((item) => (
          <li 
            key={item.name} 
            className="flex items-center space-x-2 hover:text-purple-300 transition-colors"
          >
            <span className="text-purple-500 flex-shrink-0">•</span>
            <span>{item.name} - {item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  ), [tokenData]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            {...motionProps}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Tokenomics That Drive Value
            </h2>
            <p className="text-gray-300 mb-8">
              Our token distribution is designed to ensure long-term sustainability and 
              community benefits. With 60% allocated to community initiatives, we're 
              building a truly decentralized ecosystem.
            </p>
            {keyPoints}
          </motion.div>

          {/* Right Content - Interactive Chart */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.6 }}
            className="h-[400px]"
          >
            {pieChart}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TokenomicsSystem);